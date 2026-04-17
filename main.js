require("dotenv").config();


const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check API key
console.log("API KEY:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Test route
app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.send("Test working");
});


// 🔥 AI Analyze Route
app.post("/analyze", async (req, res) => {
  try {
    console.log("Analyze route hit");

    const { text } = req.body;

    if (!text) {
      return res.json({ error: "No text provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });
    console.log("Using model: gemini-flash-latest");
    

    const prompt = `
      You are a professional fact-checker and investigative journalist. 
      Analyze the following news text for signs of misinformation, clickbait, or "fake news."

      Evaluate the text based on:
      1. Tone: Is it overly emotional or sensationalist?
      2. Source: Does it mention credible sources or is it anonymous?
      3. Plausibility: Does it claim something that would be world-changing but isn't being reported by major outlets (like a "100% cure for cancer overnight")?

      Respond ONLY in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      CONFIDENCE: [0-100%]
      REASON: [A detailed 2-sentence explanation of why it might be fake or real, mentioning specific red flags like emotional language or lack of attribution.]

      News: ${text}
    `;


   const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ result: response });

  } catch (error) {
    console.error("❌ FULL ERROR:");
    console.error(error);

    res.status(500).json({
      error: error.message || "Gemini failed"
    });
  }
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});