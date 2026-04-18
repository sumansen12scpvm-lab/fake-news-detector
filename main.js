app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Use gemini-2.0-flash or gemini-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let result;
    try {
      // Attempt search
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Today is ${today}. Fact check this: ${text}` }] }],
        tools: [{ googleSearchRetrieval: {} }]
      });
    } catch (e) {
      console.log("Search failed, falling back to standard AI...");
      // If search fails, do a normal AI check so the site doesn't break
      result = await model.generateContent(`Today is ${today}. Fact check this: ${text}`);
    }

    const response = await result.response.text();
    res.json({ result: response });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Server is waking up. Please try again in 30 seconds." });
  }
});