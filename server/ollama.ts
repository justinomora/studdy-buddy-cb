import axios from 'axios';
import { composePrompt } from './prompts/composePrompt';
import { getEmbedding, getRelevantTopic } from './utils';

import { searchQdrant } from './services/qdrant';

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.MODEL_NAME || 'llama3.2';

// Type definitions for Ollama API
interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

/**
 * Send a chat message to Ollama and get a response
 * 
 * @param prompt - The prompt to send to Ollama (should include context from BOTH JSON and PDF sources)
 * @returns The response from Ollama
 */
export async function chatWithOllama(prompt: string): Promise<string> {

  // Documentation: https://github.com/ollama/ollama/blob/main/docs/api.md
  
  try {
    // Convert user's question to embedding for Qdrant db search
    const queryEmbedding = await getEmbedding(prompt);
  
    // Retrieve context from Qdrant (PDF book)
    const retrievedContextPoints : any = await searchQdrant(queryEmbedding);

    // Extract the text/content from each of the points. 
    const retrievedContext : string[] = retrievedContextPoints.map(
     point => point.payload?.text ?? point.payload?.content ?? ""
    );

    // Include context from material.json (even though this might already exist in the Qdrant collection)
    // This ensures we fullfill the requirement to include context from BOTH sources. 
    const studyMaterialsContext = await getRelevantTopic(prompt);
    retrievedContext.push(...studyMaterialsContext);

    console.debug("Study Materials contexT: ", studyMaterialsContext);
    console.debug("Entire clean retrieved context: ", retrievedContext)

    // Generate Ollama LLM response : 
    const basicRequestOptions: OllamaRequest = {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
    }

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, 
      {...basicRequestOptions, messages: composePrompt(retrievedContext, prompt)},  
      {
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Final Ollama LLM response: ", response.data)
    return response.data;

  } catch (error) {
    console.error('Ollama error:', error);
    throw new Error('Failed to get response from Ollama');
  }
}

/**
 * Helper function to check if Ollama is running
 * This is complete and can be used by candidates
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}