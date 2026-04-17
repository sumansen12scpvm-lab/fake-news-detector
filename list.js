require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function check() {
    try {
        // We use a direct fetch to bypass the SDK's logic
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("--- GOOGLE API RESPONSE ---");
        if (data.error) {
            console.log("❌ Error:", data.error.message);
        } else {
            console.log("✅ Success! Your key can see these models:");
            data.models.forEach(m => console.log("- " + m.name));
        }
    } catch (e) {
        console.log("❌ Connection Error:", e.message);
    }
}
check();