import fs from "fs";
import { pipeline } from "@xenova/transformers";

const dataset = JSON.parse(
  fs.readFileSync("./qa_with_embeddings.json", "utf8")
);

let extractor;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractor;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const extractor = await getExtractor();
    const output = await extractor(message, { pooling: "mean" });
    const userEmbedding = Array.from(output.data);

    let bestMatch = null;
    let highestScore = -1;

    for (let entry of dataset) {
      const score = cosineSimilarity(userEmbedding, entry.embedding);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    return res.status(200).json({
      reply: bestMatch?.answer || "No answer found."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
