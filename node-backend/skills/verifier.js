const Groq = require("groq-sdk");

async function verifyClaim(claim, evidenceList) {
  const evidenceText = evidenceList.map(e => `Source: ${e.source}\nText: ${e.text}`).join('\n\n');

  if (!evidenceList || evidenceList.length === 0) {
    return {
      verdict: "UNVERIFIABLE",
      confidence: 0.0,
      explanation: "No evidence could be retrieved to verify this claim."
    };
  }

  const prompt = `
    You are an expert fact-checker and an impartial reasoner. Your task is to evaluate the following claim based ONLY on the provided evidence.
    
    PRINCIPLES:
    1. Do NOT use your internal knowledge. You must act only as a reasoner over the retrieved evidence.
    2. Compare consistency across the provided sources. If one source mentions a myth and another debunks it, synthesize this.
    3. If evidence is weak, conflicting, or missing, lower the confidence score significantly and explain why.
    4. If multiple high-quality sources agree, increase the confidence score.
    5. Do not just say "unsure" if one source fails. Look at all the Web Search and Academic evidence provided.
    6. Be explicit in your explanation about what the evidence supports and what it fails to support.

    Claim: "${claim}"
    
    Evidence:
    ${evidenceText}
    
    Respond with ONLY a valid JSON object with the following structure:
    {
        "verdict": "TRUE" | "FALSE" | "UNVERIFIABLE",
        "confidence": <float between 0.0 and 1.0>,
        "explanation": "<detailed 2-3 sentence explanation of your reasoning based on the evidence, mentioning sources directly>"
    }
    Do not include markdown backticks or any other text.
  `;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    let textResp = chatCompletion.choices[0]?.message?.content?.trim() || "";

    if (textResp.startsWith('```json')) {
      textResp = textResp.slice(7, -3);
    } else if (textResp.startsWith('```')) {
      textResp = textResp.slice(3, -3);
    }

    return JSON.parse(textResp);
  } catch (error) {
    console.error("Error verifying claim:", error);
    return {
      verdict: "UNVERIFIABLE",
      confidence: 0.0,
      explanation: `Verification failed: ${error.message || "Unknown internal error"}`
    };
  }
}

module.exports = { verifyClaim };
