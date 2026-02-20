import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "qa_with_embeddings.json");

const dataset = JSON.parse(
  fs.readFileSync(filePath, "utf8")
);

function simpleSimilarity(a, b) {
  const aWords = a.toLowerCase().split(" ");
  const bWords = b.toLowerCase().split(" ");
  let matches = 0;

  for (let word of aWords) {
    if (bWords.includes(word)) matches++;
  }

  return matches / Math.max(aWords.length, 1);
}

export default async function handler(req, res) {

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

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    let bestMatch = null;
    let highestScore = 0;

    for (let entry of dataset) {
      const score = simpleSimilarity(message, entry.question);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    return res.status(200).json({
      reply: bestMatch?.answer || "Sorry, I don't have an answer for that."
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
