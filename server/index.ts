import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import { chatWithOllama } from './ollama.js';
import studyMaterials from './data/json/materials.json' with { type: 'json' };

dotenv.config()
console.log(process.env)

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint - WORKING EXAMPLE FOR CANDIDATES
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    materials_loaded: studyMaterials ? true : false
  });
});

// Get study materials endpoint - WORKING EXAMPLE FOR CANDIDATES
app.get('/api/materials', (req, res) => {
  res.json(studyMaterials);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    chatWithOllama(message).then(response => {
      console.log("api/chat response: ", response)
      res.status(200).json({ 
        response: response.response,
        context_used: null
      });
   
    })
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  GET  http://localhost:${PORT}/api/materials`);
  console.log(`  POST http://localhost:${PORT}/api/chat`);
});