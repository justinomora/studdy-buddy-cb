// Simple Qdrant DB search service 

import axios from 'axios';

const QDRANT_URL = process.env.QDRANT_URL || ''; // or default to local Qdrant docker 
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''

interface QdrantPoint {
  id: string | number;
  payload?: any;
  vector?: number[];
  score?: number;  
}

/**
 * Simple function to query Qdrant collection - return topK (5) relevant contexdt results
 * @param queryVector - vector representation of the user's query/question. Make sure to use the same text embedding model as the one used for the insertion of knowledge into Qdrant. 
 * @param topK 
 * @returns 
 */
export async function searchQdrant(queryVector: number[], topK: number = 5): Promise<QdrantPoint[]> {

  try {
    const response = await axios.post(`${QDRANT_URL}/collections/${QDRANT_COLLECTION}/points/search`, {
      vector: queryVector,
      top: topK,
      with_payload: true  
      //  with_vectors: false
      // Implement filter example if I have time:
    },
    {
        headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
        }
    });

    console.debug("Qdrant retrieved context: ", response.data.result);

    return response.data.result;
  } catch (error) {
    console.error('Error searching Qdrant:', error);
    throw error;
  }
}