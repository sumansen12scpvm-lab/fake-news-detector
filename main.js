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

    // We use gemini-2.0-flash or gemini-flash-latest
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
      tools: [{ googleSearchRetrieval: {} }], // THE WEB SEARCH IS BACK
    });

    const prompt = `
      TODAY'S DATE: ${today}.
      You are a professional fact-checker. 
      
      TASK: 
      1. Search the web for: "${text}"
      2. Check if reputable news sources (BBC, Reuters, AP, etc.) are reporting this.
      3. If the news is not found on the web, label it as FAKE or UNVERIFIED.
      
      Respond ONLY in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      SEARCH_FINDINGS: [State what you found on the live web today]
      REASON: [Short explanation]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text(); // Remember the 'await'!

    res.json({ result: response });

  } catch (error) {
    console.error("❌ SEARCH ERROR:", error);
    res.status(500).json({ error: "Search failed. Please try again in 10 seconds." });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server is running");
});