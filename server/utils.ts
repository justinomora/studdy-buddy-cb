import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Topic } from "./parser/parseAndUploadToQdrant";

// ES6 way to determine the directory path of a file. 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

const openAiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function getEmbedding(text: string): Promise<number[]> {

    const response = await openAiClient.embeddings.create( {
        // To generate vector embedding (with size 1536)
        model: `text-embedding-3-small`,
        input: text,
    });

    console.log("OpenAI text embeding: ", response.data[0].embedding)
    return response.data[0].embedding;
}


export async function getRelevantTopic(prompt: string): Promise<string[]> {

  // Load your topics JSON
  const dataPath = path.join(__dirname,  "./data/json/materials.json");
  const data = await fs.promises.readFile(dataPath, "utf-8");
  const parsed = JSON.parse(data);
  const topics  = parsed.topics as Topic[];

  // Build a concise list to send to the model
  const topicSummaries = topics.map(topic => ({
    id: topic.id,
    title: topic.title,
    content: topic.content.slice(0, 200), // truncate to avoid hitting token limits. 200 characters should be enough. 
  }));

 
  // Construct a simple system prompt to ask the LLM to help determine the relevant study topics. 
  const systemPrompt = `
    You are an assistant that selects relevant topics for a user question.

    You will receive a list of topics in JSON format. Each topic has: id, title, and content.
    Return ONLY the IDs of topics that are relevant to the user question.
    Return your answer as a JSON array of topic IDs, e.g. ["photosynthesis", "mitosis"].
  `;

  const userPrompt = `
    User question: "${prompt}"

    Topics:
    ${JSON.stringify(topicSummaries, null, 2)}
  `;

  const response = await openAiClient.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
  });

  // Parse and extract the IDs (i.e. "photosynthesiss")
  const text = response.choices[0].message.content?.trim() || "";
  let selectedIds = [];

  try {
    selectedIds = JSON.parse(text);
  } catch (error) {
    console.error("Could not parse model output:", error);
    console.error("Provided texdt to LLM: ", text)
  }

  // Filter the topics
  const relevantTopicsContext = topics.filter(topic => selectedIds.includes(topic.id)).map(topic => topic.content);

  return relevantTopicsContext;
}
