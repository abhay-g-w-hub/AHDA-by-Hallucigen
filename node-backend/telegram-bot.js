const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Token placeholder handling
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error("🔴 ERROR: Please configure a valid TELEGRAM_BOT_TOKEN in the .env file.");
  process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log("🟢 Telegram Bot Adapter Started. Listening for messages...");

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore non-text messages
  if (!text) return;

  // Provide initial acknowledgement
  await bot.sendMessage(chatId, "⏳ *AHDA Engine Active:* Intercepting and verifying claims...", { parse_mode: "Markdown" });

  try {
    // Send the text to the highly-grounded AHDA Verification Pipeline
    // Assumes the main backend server is running on port 8080
    const response = await axios.post("http://localhost:8080/api/verify", {
      text: text,
      session_id: `telegram_${chatId}`
    });

    const data = response.data;
    
    if (!data.claims || data.claims.length === 0) {
      return bot.sendMessage(chatId, "⚠️ *Verification Result:* No verifiable claims found in the text.", { parse_mode: "Markdown" });
    }

    let report = `📊 *AHDA INTELLIGENCE REPORT*\n`;
    report += `*Overall Confidence:* ${(data.overall_confidence * 100).toFixed(0)}%\n\n`;

    // Format the detailed report for each claim
    for (let i = 0; i < data.claims.length; i++) {
      const claimObj = data.claims[i];
      const isTrue = claimObj.verdict === "TRUE";
      const isFalse = claimObj.verdict === "FALSE";
      const statusIcon = isTrue ? "🟢 TRUE" : isFalse ? "🔴 FALSE" : "🟡 UNVERIFIABLE";
      
      report += `🔹 *Claim:* ${claimObj.claim}\n`;
      report += `*Verdict:* ${statusIcon} (Confidence: ${(claimObj.confidence * 100).toFixed(0)}%)\n`;
      report += `*Agent Reasoning:* ${claimObj.explanation}\n\n`;
      
      if (claimObj.evidence && claimObj.evidence.length > 0) {
        report += `*Sources:*\n`;
        claimObj.evidence.forEach(ev => {
          report += `- _${ev.source}_\n`;
        });
      }
      report += `\n`;
    }

    // Send the detailed report
    bot.sendMessage(chatId, report, { parse_mode: "Markdown" });

  } catch (error) {
    console.error("Verification error:", error.message);
    const errText = error.response?.data?.error || error.message;
    bot.sendMessage(chatId, `🚨 *System Error:* Verification failed.\n\`${errText}\``, { parse_mode: "Markdown" });
  }
});
