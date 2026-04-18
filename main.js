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

    console.log(`Request received for: ${text}`);

    // We use gemini-2.0-flash because it was in your list.js
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
    });

    const prompt = `
      TODAY'S DATE: ${today}.
      You are a professional fact-checker. 
      Analyze this news: "${text}"
      
      Respond ONLY in this format:
      VERDICT: [REAL / FAKE / UNVERIFIED]
      REASON: [Short explanation based on events up to ${today}]
    `;

    let result;
    try {
      // Try to use the Search Tool with 2.0 Flash
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ googleSearchRetrieval: {} }] 
      });
    } catch (searchError) {
      console.log("Search tool failed or not allowed, switching to standard AI...");
      // FALLBACK: Use gemini-flash-latest which we know works for you
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      result = await fallbackModel.generateContent(prompt);
    }

    const response = await result.response.text();
    res.json({ result: response });

  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error.message);
    res.status(500).json({ 
      result: "The AI server is busy or restarting. Please try again in 30 seconds." 
    });
  }
});

// Start server on port 3000 (Render will handle this)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});