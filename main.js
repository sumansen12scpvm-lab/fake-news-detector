require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ error: "No text provided" });

    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Using gemini-2.0-flash because it was in your list.js output
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
      tools: [{ googleSearchRetrieval: {} }],
    });

    const prompt = `
      CURRENT DATE: ${today}
      You are a professional fact-checker. Use Google Search to verify this: "${text}"
      
      Respond ONLY in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      CONFIDENCE: [0-100%]
      SOURCE: [Reputable news site found]
      REASON: [Short explanation based on search results for ${today}]
    `;

    console.log("Analyzing with gemini-2.0-flash and Google Search...");

    const result = await model.generateContent(prompt);
    
    // --- FIXED LINE BELOW (Added await) ---
    const response = await result.response.text(); 

    res.json({ result: response });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ error: "AI search failed. The model might not support web search yet." });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server started");
});