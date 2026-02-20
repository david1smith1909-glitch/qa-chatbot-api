import fs from "fs";
import path from "path";

// ✅ Load dataset safely (works on Vercel)
const filePath = path.join(process.cwd(), "qa_with_embeddings.json");
const dataset = JSON.parse(fs.readFileSync(filePath, "utf8"));

// ✅ Normalize text
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter(word =>
      ![
        "the", "is", "are", "does", "do", "did",
        "a", "an", "of", "to", "and", "in",
        "on", "for", "with", "what", "which",
        "who", "when", "where", "how"
      ].includes(word)
    )
    .map(word =>
      word.endsWith("s") ? word.slice(0, -1) : word // basic plural handling
    );
}

// ✅ Similarity scoring
function similarityScore(userInput, question) {
  const userWords = normalize(userInput);
  const questionWords = normalize(question);

  let score = 0;

  for (let word of userWords) {
    if (questionWords.includes(word)) {
      score += 1;
    }
  }

  return score / Math.max(questionWords.length, 1);
}

export default async function handler(req, res) {

  // ✅ CORS headers
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
      const score = similarityScore(message, entry.question);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    // ✅ Threshold to avoid wrong matches
    if (highestScore < 0.3) {
      return res.status(200).json({
        reply: "Sorry, I couldn't find an exact answer. Please contact us directly for more information."
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
