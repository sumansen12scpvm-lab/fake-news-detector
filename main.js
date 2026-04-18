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
        const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });


    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      tools: [
        {
          googleSearchRetrieval: {}, // THIS IS THE MAGIC KEY
        },
      ],
    });
    console.log("Using model: gemini-flash-latest");
    

    const prompt = `
      CURRENT DATE: ${today}
      
      You are a professional fact-checker with LIVE ACCESS to Google Search.
      
      CRITICAL INSTRUCTION: 
      1. Do NOT rely on your internal knowledge cutoff. 
      2. You MUST use your Google Search tool to find the most recent news reports from 2025 and 2026.
      3. Verify the current political leadership and international situations via live search before giving a verdict.
      4. If major news outlets (AP, Reuters, BBC) are reporting the news you find, it is REAL. If NO reputable source mentions it, it is LIKELY FAKE.

      News to analyze: "${text}"

      Respond ONLY in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      CONFIDENCE: [0-100%]
      SEARCH SOURCE: [Name of the reputable news site found via Google Search]
      REASON: [Explain why it's real or fake based on what you found on the web today, ${today}]
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