export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { message } = req.body;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `You are Alok Kumar's enterprise QA consultant assistant. Answer professionally about QA governance, UAT, release management. Keep responses concise (2-3 sentences). User asks: ${message}` }]
          }]
        })
      }
    );
    
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "Please contact Alok at aloksingh00704@gmail.com or schedule a consultation.";
    
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ 
      reply: "Please contact Alok directly at aloksingh00704@gmail.com or schedule a call for expert QA consultation."
    });
  }
}
