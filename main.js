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

    // We use gemini-flash-latest because we know it worked for you before
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      // We are removing the search tool for one test to see if the server wakes up
    });

    const prompt = `
      CONTEXT: Today is ${today}. 
      You are a professional fact-checker. 
      Analyze this news: "${text}"
      
      Respond ONLY in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      CONFIDENCE: [0-100%]
      REASON: [Short explanation based on your knowledge up to 2026]
    `;

    console.log("Request received. Analyzing...");

    const result = await model.generateContent(prompt);
    const response = await result.response.text(); 

    res.json({ result: response });

  } catch (error) {
    // This will print the EXACT error to your Render Logs
    console.error("❌ ERROR DETAILS:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server is running");
});