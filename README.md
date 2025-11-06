# Study Buddy - Take-Home Assignment

Welcome! This is a take-home coding assignment for our software engineering position. You'll be implementing chat functionality for a Study Buddy application that helps students learn by answering questions about their study materials.

## 🎯 Your Task (1-3 hours) - Please do not spend more than 3 hours on this. It is not expected for your solution to be perfectly polished and we want to be respectful of your time. 

Build a working chat interface that:
1. Connects the frontend to the backend API
2. Integrates with Ollama (or an API of your choice) to generate responses
3. Uses the provided study materials as context for answers

Take as many creative liberties as you want with your implementation! This is a chance for you to demonstrate your familiarity with building LLM based applications and to demonstrate your creativity. 

## 🚀 Quick Setup

### Start the Application
```bash
# Install dependencies
pnpm install

# Start both frontend and backend
pnpm dev:all

# Or run them separately:
pnpm dev        # Frontend only (http://localhost:5173)
pnpm dev:server # Backend only (http://localhost:3001)
```

## ✅ Requirements Checklist

### Core Requirements (Must Complete)
- [ ] **API Client**: Complete the `sendMessage` function in `src/services/api.ts`
- [ ] **AI Integration**: Implement the `chatWithOllama` function in `server/ollama.ts` (If you prefer to take a different approach or use a different LLM feel free to. Create any additional files that you want.)
- [ ] **Context Integration**: Include study material from BOTH sources in your prompts:
  - JSON study materials (provided in `server/data/json/materials.json`)
  - PDF content (extract from `server/data/pdf/biology-for-dummies.pdf`)

### Ideas for Enhancements (If Time Permits) (If there is something not mentioned in this list that you would like to implement, feel free to do that.)
- [ ] Streaming responses from LLM
- [ ] Better context selection (choose most relevant topic from JSON and PDF)
- [ ] Smart PDF content extraction (relevance-based, chunking, summarization)
- [ ] Context size optimization strategiesß
- [ ] Message history persistence
- [ ] Improved prompt engineering
- [ ] Loading animations
- [ ] Error Handling: Show appropriate error messages when things go wrong

## 📁 Project Structure

```
study-buddy/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── Chat.tsx       # Main chat component (partially complete)
│   │   └── Context.tsx    # Study materials display (complete)
│   ├── services/
│   │   └── api.ts         # API client (needs implementation)
│   └── types/
│       └── chat.ts        # TypeScript interfaces (complete)
├── server/                 # Backend (Express + TypeScript)
│   ├── index.ts           # Express server (chat endpoint stubbed)
│   ├── ollama.ts          # Ollama integration (needs implementation)
│   └── data/
│       ├── json/
│       │   └── materials.json # Biology study materials
│       └── pdf/
│           └── biology-for-dummies.pdf # Additional PDF context
└── README.md              # You are here!
```

## 🔍 What We've Provided

1. **Working Examples**:
   - `/api/health` endpoint - shows how to create an endpoint
   - `/api/materials` endpoint - returns study materials
   - `getMaterials()` in api.ts - shows how to make API calls

2. **Study Materials**: 
   - Three biology topics (photosynthesis, cellular respiration, mitosis) in `server/data/json/materials.json`
   - A biology textbook PDF in `server/data/pdf/biology-for-dummies.pdf`

3. **UI Components**: Fully styled chat interface and context panel

4. **Type Definitions**: All TypeScript interfaces you'll need

## 💡 Implementation Hints

### 1. Start with the API Client
Look at the working `getMaterials` function in `src/services/api.ts` as an example.

### 2. Ollama API Documentation
- Endpoint: `POST http://localhost:11434/api/generate`
- Request body:
  ```json
  {
    "model": "llama3.2",
    "prompt": "Your prompt with context here",
    "stream": false
  }
  ```
- Response: `{ "response": "AI response text", ... }`

### 3. Building Good Prompts
Include relevant study material from both JSON and PDF sources. For example:
```
Study Materials Context:
[Include relevant JSON study material here]

Additional Reference Material:
[Include relevant PDF content here]

Question: [User's question]
Please answer based on the provided context.
```

### 4. PDF Processing Tips
- PDF files can be large - think about context window limits

## 🧪 Testing Checklist

Before submitting, make sure:
- [ ] Chat messages send and receive successfully
- [ ] Responses are relevant to the study materials

## 📊 Evaluation Criteria

### We Must See
- Clean, readable code
- Working chat functionality
- Proper use of TypeScript
- Error handling

### We Love to See
- Thoughtful UX improvements
- Clever prompt strategies
- Performance optimizations
- Code comments where helpful
- Creative problem solving

## ❓ FAQ

**Q: Can I use a different LLM instead of Ollama?**
A: Yes! OpenAI or other APIs are fine. Just document your choice.

**Q: Should I implement authentication?**
A: No, focus on the core chat functionality.

**Q: Can I add additional npm packages?**
A: Yes, but document why you chose them.

**Q: The context is too large for my prompt, what should I do?**
A: This is intentional! Show us how you handle this challenge. The PDF adds extra complexity here.

**Q: How should I handle both JSON and PDF content?**
A: That's up to you! Show us your approach to combining multiple context sources.

## 🎉 Submission

When you're done:
1. Make sure both `pnpm dev` and `pnpm dev:server` run without errors
2. Test the complete flow: send message → get response with context
3. Push to your fork and send the link to the recruiter that you have been communicating with.

Good luck! We're excited to see your solution. Remember, we're looking for clean, working code that demonstrates your expertise in working with LLMs.

---

**Time Estimate**: 1-3 hours
**Questions?** Include them in your submission notes.
