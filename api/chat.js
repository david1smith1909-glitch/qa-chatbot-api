import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "qa_with_embeddings.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/gi, "");
}

function scoreMatch(userInput, item) {
  let score = 0;
  const input = normalize(userInput);
  const question = normalize(item.question);

  if (question.includes(input)) score += 5;

  if (item.keywords) {
    item.keywords.forEach(keyword => {
      if (input.includes(keyword)) score += 3;
    });
  }

  const words = input.split(" ");
  words.forEach(word => {
    if (question.includes(word)) score += 1;
  });

  return score;
}

export default function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userMessage = req.body.message;

  let bestMatch = null;
  let highestScore = 0;

  const allEntries = [
    ...data.intents.services,
    ...data.intents.industries,
    ...data.intents.value_proposition,
    ...data.intents.persona_based
  ];

  allEntries.forEach(item => {
    const score = scoreMatch(userMessage, item);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  });

  if (highestScore > 2 && bestMatch) {
    return res.status(200).json({
      reply: bestMatch.answer
    });
  }

  return res.status(200).json({
    reply: "I can help with QA strategy, automation, and quality transformation. Could you clarify your question?"
  });
}
