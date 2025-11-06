import axios from 'axios';
import type { ChatResponse, StudyMaterial } from '../types/chat';

// API base URL - update this if your server runs on a different port
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Get study materials from the server
 * This function is complete and working as an example
 */
export async function getMaterials(): Promise<{ topics: StudyMaterial[]; metadata: any }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/materials`);
    return response.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
}

/**
 * Send a message to the chat API
 * 
 * INCOMPLETE IMPLEMENTATION - Candidates must finish this
 * 
 * @param message - The message to send
 * @returns The response from the server
 */
export async function sendMessage(message: string): Promise<ChatResponse> {
  // TODO: Implement the API call to send a message
  // 
  // HINTS:
  // 1. Make a POST request to `${API_BASE_URL}/chat`
  // 2. Send the message in the request body
  // 3. Handle the response appropriately
  // 4. Handle errors (network errors, server errors, etc.)
  //
  // The request body should look like: { message: "user's message" }
  // The response will have: { response: "AI response", context_used: "topic used" }
  
  try {
    // YOUR IMPLEMENTATION HERE
    
    // Temporary mock response - REPLACE THIS with actual API call
    throw new Error('Chat API not implemented. Please complete the sendMessage function.');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Check server health
 * This function is complete and can be used for testing
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}