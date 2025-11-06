import fs from "fs";
import path from "path";
import { LlamaParseReader } from "llama-cloud-services";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from 'uuid'; 
import OpenAI from "openai";

// Qdrant config: 
const QDRANT_URL = process.env.QDRANT_URL || ''; // or default to local Qdrant docker if time allows
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

const openAiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});


// Interfaces for PDF parsing and chunking: 
interface PageDoc { // Todo: update to a DocChunk for chuncking
  id: string;
  text: string;
  metadata: {
    sourceFile: string;
    pageNumber?: number;
    // Similar to the materials.json, if time allows call an LLM to provide these attributes for each doc/chunk: 
    // title?: string;
    // category?: string;
    // keyConcepts?: string[];
    // studyQuestions?: string[];

  };
}

// The structure of each of the `topic` objects in `materials.json` 
export interface Topic {
  id: string;
  title: string;
  category: string;
  content: string;
  keyConcepts: string[];
  studyQuestions: string[];
}

interface QdrantPayload {
  id: string;
  vector: number[];
  payload: any;
}

/**
 * Parse PDF by page and return list of docs (this can be refactored to chunks but for now this works)
 * @param pdfFilePath 
 * @returns 
 */
async function parsePdf(pdfFilePath: string): Promise<PageDoc[]> {

  console.log(`Parsing PDF file: ${pdfFilePath}`);
  // Convenient and fast for parsing PDF files. It parses them in the cloud and returns the parsed "docs"
  const reader = new LlamaParseReader({ resultType: "markdown" , apiKey: LLAMA_CLOUD_API_KEY});
  const docs = await reader.loadData(pdfFilePath);

  const pages: PageDoc[] = docs.map((doc: any, index: number) => ({
    // Assigned a random uuid value since Qdrant requires one and will complain if it's not an UUID or unsigned integrr
    id: uuidv4(), 
    text: doc.text ?? "",
    metadata: {
      // Attaching a source file and page number helps with debuging and advanced filtering. 
      sourceFile: path.basename(pdfFilePath),
      pageNumber: index + 1,
    },
  }));

  return pages;
}

/**
 * Generate embeddings using OpenAI to insert into Qdrant collection. 
 * @param text 
 * @returns 
 */
async function embedText(text: string): Promise<number[]> {
    try {
        const response = await openAiClient.embeddings.create( {
          // The length of the embedding vector is 1536 for text-embedding-3-small - this matches the Qdrant collection vector size on my account
          // https://platform.openai.com/docs/guides/embeddings
          model: `text-embedding-3-small`, 
          input: text,
        });
        // Return the vector embeddings to insert
        console.log("OpenAI text embeding: ", response.data[0].embedding)
        return response.data[0].embedding;

    } catch (error) {
        console.error("Error generating embedding:", error);
        // Return a zero-vector fallback (length must match Qdrant vector size)
        return Array(1536).fill(0);
    }

}

/**
 * Process the provided input (parsed page documents or topics from materials.json), and create 
 * corresponding Qdrant payload objects for insertion. 
 * @param items 
 * @returns 
 */
async function prepQdrantPayload(items: (PageDoc| Topic)[]): Promise<QdrantPayload[]> {
  const payloads: QdrantPayload[] = [];
  
  for (const item of items) {
    let vector: number[];
    let payload: any;
    let id: string;

    if ("text" in item) {
      // only PDF page docs have a `text` attribute
      vector = await embedText(item.text);
      id = item.id;
      payload = { text: item.text, metadata: item.metadata };
    } else {
      // A JSON study topiic
      vector = await embedText(item.content);
      id = uuidv4();
      payload = {
        title: item.title,
        category: item.category,
        content: item.content,
        keyConcepts: item.keyConcepts,
        studyQuestions: item.studyQuestions,
      };
    }

    payloads.push({ id, vector, payload });
  }

  return payloads;
}

/**
 * Upload payload to the QDRANT_COLLECTION - if it does not exist, it creates it with basic settings. 
*/
async function uploadToQdrant(payloads: QdrantPayload[]) {
  
  const client = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY});

  // Get collection and if it doesn't exist, create one with defaults
  let collections: any;
  try {
    collections = await client.getCollections();
    console.log('List of collections:', collections.collections);
  } catch (err) {
      console.error('Could not get collections:', err);
      throw err
  }
  
  // To faciliate the creation of a new collection vs doing it via the Qdrant web dashboard. 
  const exists = collections.collections.some((collection) => collection.name === QDRANT_COLLECTION);

  if (!exists) {
    console.log(`Creating collection: ${QDRANT_COLLECTION}`);
    await client.createCollection(QDRANT_COLLECTION, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  }

  console.log(`Uploading ${payloads.length} items to Qdrant...`);
  await client.upsert(QDRANT_COLLECTION, {
    points: payloads.map((point) => ({
      id: point.id,
      vector: point.vector,
      payload: point.payload,
    })),
  });

  console.log("Upload complete.");
}


/**
 * load materials.json file contents and return list of `topics`
 * @param jsonFilePath 
 * @returns 
 */
async function loadTopics(jsonFilePath: string): Promise<Topic[]> {
  const data = await fs.promises.readFile(jsonFilePath, "utf-8");
  const parsed = JSON.parse(data);
  return parsed.topics as Topic[];
}

async function main() {
  // Ways to provide a file for pasing and uploading to Qdrant via the CLI: 
  // npx ts-node ./server/parser/parseAndUploadToQdrant.ts ./server/data/json/materials.json
  // npx ts-node ./server/parser/parseAndUploadToQdrant.ts ./server/data/pdf/biology-for-dummies.pdf
  const filePath = process.argv[2];

  // Check if file exists, and if it doesn't exist handle accordingly:
  if (!filePath) {
    console.error("Provide a PDF file path.\nUsage: npx ts-node ./server/parser/parseAndUploadToQdrant.ts ./server/data/json/materials.json");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  let items: any[] = [];

  // Upload the content from BOTH the materials.json AND the PDF book to query all info (context) from the onset. 
  // Thus, depending on the file provided, we extract the info accordingly: 
  if (ext === ".pdf") {
    items = await parsePdf(filePath);
  } else if (ext === ".json") {
    items = await loadTopics(filePath);
  } else {
    console.error("Unsupported file type.");
    process.exit(1);
  }

  console.log(`Loaded ${items.length} from ${filePath}.`);

  // Upload study materials to Qdrant collection: 
  const qdrantPayloads = await prepQdrantPayload(items);
  await uploadToQdrant(qdrantPayloads);
}

main();