import axios from 'axios';

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
 * INCOMPLETE IMPLEMENTATION - Candidates must finish this
 * 
 * @param prompt - The prompt to send to Ollama (should include context from BOTH JSON and PDF sources)
 * @returns The response from Ollama
 */
export async function chatWithOllama(prompt: string): Promise<string> {
  // TODO: Implement the Ollama API call
  // 
  // HINTS:
  // 1. Use axios to make a POST request to `${OLLAMA_BASE_URL}/api/generate`
  // 2. The request body should match the OllamaRequest interface
  // 3. Set stream to false for simplicity (streaming is optional/bonus)
  // 4. Handle errors appropriately
  // 5. Return the response text
  //
  // IMPORTANT CONTEXT CONSIDERATIONS:
  // - The prompt may include content from both JSON materials and PDF
  // - Large contexts might affect response time and quality
  // - Consider how you structure the prompt for best results
  //
  // Documentation: https://github.com/ollama/ollama/blob/main/docs/api.md
  
  try {
    // YOUR IMPLEMENTATION HERE
    
    throw new Error('Ollama integration not implemented');
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