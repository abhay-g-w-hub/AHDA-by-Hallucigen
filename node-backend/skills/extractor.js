const Groq = require("groq-sdk");

async function extractClaims(text) {
  const prompt = `
    Analyze the following text and extract all verifiable factual claims.
    CRITICAL INSTRUCTION: Do NOT overly fragment sentences into isolated, obvious facts (e.g., do not split "India is located in Australia" into "India is a country" and "Australia is a continent"). Instead, extract the main relational claim: "India is located in Australia". Focus on the core relationships, statistics, geographical statements, or events being asserted.
    Return ONLY a valid JSON array of strings. Do not include markdown formatting or backticks.
    
    Text:
    ${text}
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
    console.error("Error extracting claims:", error);
    // Simple fallback: split by sentences
    return text.split(/[.!?]+/).filter(s => s.trim().length > 10).map(s => s.trim());
  }
}

module.exports = { extractClaims };
