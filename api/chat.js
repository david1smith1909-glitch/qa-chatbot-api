import fs from "fs";
import path from "path";

// Load dataset safely for Vercel
const filePath = path.join(process.cwd(), "qa_with_embeddings.json");
const dataset = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Stopwords to ignore
const STOPWORDS = new Set([
  "the","is","are","does","do","did","a","an","of","to","and","in",
  "on","for","with","what","which","who","when","where","how",
  "can","could","would","should","please","tell","me"
]);

// Normalize text
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word && !STOPWORDS.has(word))
    .map(word => word.endsWith("s") ? word.slice(0, -1) : word);
}

// Keyword-based scoring
function scoreQuestion(userInput, questionText) {
  const userTokens = tokenize(userInput);
  const questionTokens = tokenize(questionText);

  let score = 0;

  for (let token of userTokens) {
    if (questionTokens.includes(token)) {
      score += 2; // direct keyword match
    }

    // Partial word match
    for (let qToken of questionTokens) {
      if (qToken.includes(token) || token.includes(qToken)) {
        score += 1;
      }
    }
  }

  return score;
}

export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    let bestMatch = null;
    let highestScore = 0;

    for (let entry of dataset) {
      const score = scoreQuestion(message, entry.question);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    if (!bestMatch || highestScore < 2) {
      return res.status(200).json({
        reply: "Sorry, I couldn't find a relevant answer. Please contact us at aloksingh00704@gmail.com directly."
      });
    }

    return res.status(200).json({
      reply: bestMatch.answer
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
