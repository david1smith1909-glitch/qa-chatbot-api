export default async function handler(req, res) {
  // CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are Alok Kumar's AI assistant. Answer this: ${message}` }] }]
        })
      }
    );

    const data = await response.json();

    // Log the error to Vercel dashboard if the API key is wrong or quota is hit
    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({ reply: "API Error: Check Vercel Logs." });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text 
                || "I'm available for consulting. Please reach out to me via the contact section below!";

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "Connection lost. Please email aloksingh00704@gmail.com" });
  }
}
