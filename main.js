require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("Server is alive!");
});

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ error: "No text provided" });

    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    // We removed the 'tools' section because it was causing the 429 error
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Today's Date: ${today}.
      You are a professional fact-checker. 
      Analyze this news text for authenticity, logical consistency, and tone: "${text}"
      
      Respond in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      CONFIDENCE: [0-100%]
      REASON: [Explain why based on your knowledge of world events up to 2026]
    `;

    console.log("Analyzing...");
    const result = await model.generateContent(prompt);
    const response = await result.response.text(); 

    res.json({ result: response });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ error: "The AI is currently busy. Please try again in 10 seconds." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started`);
});