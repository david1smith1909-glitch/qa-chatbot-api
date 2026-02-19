// api/chat.js
// Stable production-ready version

export default async function handler(req, res) {

  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY");
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    const systemPrompt = `
You are a senior enterprise QA consultant assistant for Alok Kumar.
Provide:
- Clear
- Structured
- Professional responses
- 3–5 concise bullet points

Focus on:
QA governance, UAT strategy, automation ROI, defect prevention,
release management, SaaS quality architecture.

End response with:
"For detailed guidance, connect with Alok Kumar."
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 300
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return res.status(502).json({
        error: 'AI service unavailable'
      });
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm unable to generate a response at the moment.";

    return res.status(200).json({
      reply: reply.trim()
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
