const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.resolve(__dirname, 'ahda_memory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_input TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS hallucinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    claim TEXT NOT NULL,
    evidence TEXT,
    confidence REAL,
    explanation TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

const { extractClaims } = require('./skills/extractor');
const { retrieveEvidence } = require('./skills/retriever');
const { verifyClaim } = require('./skills/verifier');

// OpenClaw Path (WSL internal path)
const OPENCLAW_WSL_PATH = '/home/abc/.nvm/versions/node/v24.15.0/bin/openclaw';

app.post('/api/verify', async (req, res) => {
  const { text, session_id = 'default' } = req.body;

  // Log conversation
  db.run('INSERT INTO conversations (session_id, user_input) VALUES (?, ?)', [session_id, text]);

  console.log(`Starting verification for session: ${session_id}`);

  const { extractClaims } = require('./skills/extractor');
  const { retrieveEvidence } = require('./skills/retriever');
  const { verifyClaim } = require('./skills/verifier');

  // 1. Trigger OpenClaw in the background (Fire-and-forget) to eliminate latency!
  const command = `wsl --exec /bin/bash -c "export PATH=$PATH:/home/abc/.nvm/versions/node/v24.15.0/bin && export GROQ_API_KEY='${process.env.GROQ_API_KEY}' && ${OPENCLAW_WSL_PATH} agent --session-id ahda-demo --message 'Verify: ${text.replace(/'/g, "'\\''")}' --local --json"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Background OpenClaw execution failed: ${error.message}`);
    } else {
      console.log(`Background OpenClaw execution finished successfully.`);
    }
  });

  // 2. The Groq Grounded Pipeline
  const runGroqPipeline = async () => {
    console.log("Running Groq Grounded Verification Pipeline...");
    const claims = await extractClaims(text);
    
    // Process all claims concurrently
    const verificationPromises = claims.map(async (claim) => {
      const evidence = await retrieveEvidence(claim);
      const verification = await verifyClaim(claim, evidence);
      
      if (verification.verdict === 'FALSE') {
        db.run('INSERT INTO hallucinations (session_id, claim, evidence, confidence, explanation) VALUES (?, ?, ?, ?, ?)',
          [session_id, claim, JSON.stringify(evidence), verification.confidence, verification.explanation]);
      }

      return {
        claim,
        ...verification,
        evidence
      };
    });

    const results = await Promise.all(verificationPromises);
    const totalConfidence = results.reduce((sum, res) => sum + (res.confidence || 0), 0);
    return { results, totalConfidence };
  };

  try {
    // 3. Await ONLY the ultra-fast Groq Pipeline!
    const groqData = await runGroqPipeline();

    res.json({
      status: "completed",
      overall_confidence: groqData.results.length ? groqData.totalConfidence / groqData.results.length : 0,
      claims: groqData.results,
      openClawData: null // UI no longer blocked waiting for OpenClaw
    });

  } catch (manualError) {
    console.error("Manual verification failed:", manualError);
    res.status(500).json({ error: 'Verification failed entirely.', details: manualError.message });
  }
});

app.listen(port, () => {
  console.log(`Node.js AHDA Backend listening at http://localhost:${port}`);
});
