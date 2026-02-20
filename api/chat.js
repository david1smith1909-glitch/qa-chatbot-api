import fs from "fs";

const dataset = JSON.parse(
  fs.readFileSync("./qa_with_embeddings.json", "utf8")
);

function simpleSimilarity(a, b) {
  const aWords = a.toLowerCase().split(" ");
  const bWords = b.toLowerCase().split(" ");
  let matches = 0;

  for (let word of aWords) {
    if (bWords.includes(word)) {
      matches++;
    }
  }

  return matches / Math.max(aWords.length, 1);
}

export default async function handler(req, res) {
  try {
    const { message } = req.body;

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
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
