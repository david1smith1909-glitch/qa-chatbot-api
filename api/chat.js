export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        reply: 'Please ask a question about QA governance, UAT, or defect prevention.' 
      });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ 
        reply: 'For expert QA guidance, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.' 
      });
    }

    const systemPrompt = `You are an enterprise QA consultant assistant for Alok Kumar.
Answer questions professionally about QA governance, UAT coordination, release management, defect prevention, and testing strategies.
Keep responses concise (2-3 sentences maximum) and actionable.
Encourage users to contact Alok at aloksingh00704@gmail.com or schedule a consultation for detailed guidance.`;

    // Call Gemini API with correct model
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    
    // Extract the reply
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  'Thank you for your question. For expert QA guidance, please contact Alok at aloksingh00704@gmail.com or schedule a consultation call.';

    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    console.error('Chat API Error:', error.message);
    
    // Return friendly error message
    return res.status(200).json({ 
      reply: 'For expert QA guidance on release governance, UAT, or defect prevention, please contact Alok directly at aloksingh00704@gmail.com or schedule a consultation call.' 
    });
  }
}
