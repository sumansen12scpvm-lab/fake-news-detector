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
    console.log("Analyze route hit");
    const { text } = req.body;
    if (!text) return res.json({ error: "No text provided" });

    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Use gemini-1.5-flash as it is more stable for the search tool
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearchRetrieval: {} }],
    });

    const prompt = `Today is ${today}. Fact-check this: "${text}". Respond in Verdict/Confidence/Reason format.`;

    const result = await model.generateContent(prompt);
    
    // ✅ CRITICAL FIX: Added 'await' here
    const response = await result.response.text(); 

    res.json({ result: response });

  } catch (error) {
    console.error("❌ BACKEND ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ CRITICAL FIX: Use process.env.PORT for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});