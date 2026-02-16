// Vercel Serverless Function
// File must be: api/chat.js

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(200).json({ 
      reply: 'For expert QA guidance, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.' 
    });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(200).json({ 
        reply: 'Please ask a question about QA governance, UAT, or testing strategies.' 
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ 
        reply: 'Thank you for your question! For expert QA guidance, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.' 
      });
    }

    const systemPrompt = `You are a QA consultant assistant for Alok Kumar. Answer in 2-3 sentences about QA governance, UAT, release management, defect prevention. Be concise and professional. Always suggest contacting Alok at aloksingh00704@gmail.com for detailed guidance.`;

    // Call Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
        })
      }
    );

    if (!geminiResponse.ok) {
      return res.status(200).json({ 
        reply: 'For expert QA guidance, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.' 
      });
    }

    const data = await geminiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  'For expert QA guidance, contact Alok at aloksingh00704@gmail.com';

    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(200).json({ 
      reply: 'For expert QA guidance, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.' 
    });
  }
};
