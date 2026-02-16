// Serverless function for Vercel
// File: api/chat.js

export default async function handler(req, res) {
  // Set CORS headers FIRST
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      reply: 'For expert QA guidance, contact Alok at aloksingh00704@gmail.com'
    });
  }

  try {
    // Parse request body
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        reply: 'Please ask a question about QA governance, UAT, or testing strategies.'
      });
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(200).json({ 
        reply: 'Thank you for your question! For expert QA guidance on release governance, defect prevention, and UAT coordination, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.'
      });
    }

    // System prompt for QA consultant
    const systemPrompt = `You are a professional QA consultant assistant for Alok Kumar, an Enterprise QA & Release Governance expert.

RESPOND IN 2-3 SHORT SENTENCES ONLY.

Answer questions about:
- QA governance and quality frameworks
- UAT (User Acceptance Testing) coordination
- Release management and deployment strategies
- Defect prevention and risk-based testing
- Test automation strategies
- Enterprise QA scaling

Always be professional, concise, and actionable.
End responses by suggesting they contact Alok at aloksingh00704@gmail.com for detailed guidance.`;

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
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
          maxOutputTokens: 150,
          topP: 0.8,
        }
      })
    });

    // Check Gemini API response
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      
      return res.status(200).json({ 
        reply: 'Thank you for your question about QA! For expert guidance on enterprise QA governance, UAT coordination, and defect prevention, please contact Alok directly at aloksingh00704@gmail.com or schedule a consultation.'
      });
    }

    // Parse Gemini response
    const data = await geminiResponse.json();
    
    // Extract reply
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      reply = 'For expert QA guidance on release governance, UAT, and testing strategies, please contact Alok at aloksingh00704@gmail.com or schedule a consultation.';
    }

    // Return success
    return res.status(200).json({ 
      reply: reply.trim() 
    });

  } catch (error) {
    // Log error for debugging
    console.error('Chat API Error:', error.message, error.stack);
    
    // Return friendly fallback
    return res.status(200).json({ 
      reply: 'Thank you for your question! For expert guidance on QA governance, UAT coordination, and defect prevention strategies, please contact Alok directly at aloksingh00704@gmail.com or schedule a consultation call.'
    });
  }
}
