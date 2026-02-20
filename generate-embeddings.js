import { pipeline } from '@xenova/transformers';
import fs from 'fs';

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

const dataset = JSON.parse(
  fs.readFileSync('./QA_Chatbot_Training_1200.json', 'utf8')
);

for (let entry of dataset) {
  const output = await extractor(entry.question, { pooling: 'mean' });
  entry.embedding = Array.from(output.data);
}

fs.writeFileSync(
  './qa_with_embeddings.json',
  JSON.stringify(dataset)
);

<<<<<<< HEAD
console.log("Embeddings generated successfully.");
=======
console.log("Embeddings generated successfully.");
>>>>>>> 0f8a41b (Generated embeddings)
