# DocuMind AI 🧠

> **Upload any PDF and chat with it using AI.**
> Powered by RAG (Retrieval-Augmented Generation), Groq Llama 3, ChromaDB, and fully written in TypeScript.

🚀 **Live Demo:** [Coming Soon]

---

## 📸 Screenshots

> _Add screenshots here after deployment_

---

## ✨ Features

- 📄 **PDF Upload** — Upload any PDF document up to 10MB via drag & drop
- 🔍 **Semantic Search** — Vector similarity search using ChromaDB + Ollama embeddings
- 💬 **AI-Powered Answers** — Get intelligent answers powered by Groq Llama 3.3 70B
- 📝 **Source Citations** — Every answer shows which page and chunk it came from
- 🗂️ **Multi-Document Support** — Upload and manage multiple documents
- 🔐 **JWT Authentication** — Secure register/login with bcryptjs password hashing
- 📱 **Mobile Responsive** — Works perfectly on all screen sizes
- 💾 **Chat History** — Conversations are saved and restored automatically
- 🐳 **Docker Ready** — Full docker-compose setup for local development

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                  │
│                 React + TypeScript UI                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│              Node.js + Express API (TypeScript)              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth Module  │  │  Doc Module  │  │   Chat Module    │  │
│  │ JWT + bcrypt │  │ PDF Extract  │  │  RAG Pipeline    │  │
│  └──────────────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────────────────────  │  ───────────────── │ ───────────┘
                            │                    │
          ┌─────────────────▼──────┐    ┌────────▼──────────┐
          │     PDF Processing     │    │    RAG Pipeline    │
          │  1. Extract text       │    │  1. Embed question │
          │  2. Chunk into 300     │    │  2. Search ChromaDB│
          │     token pieces       │    │  3. Build prompt   │
          │  3. Generate embeddings│    │  4. Send to Groq   │
          │     via Ollama         │    │  5. Return answer  │
          │  4. Store in ChromaDB  │    │     + citations    │
          └──────────┬─────────────┘    └────────┬──────────┘
                     │                           │
        ┌────────────▼──────────────────────────▼────────────┐
        │                    Data Layer                       │
        │                                                     │
        │  ┌─────────────┐  ┌────────────┐  ┌─────────────┐  │
        │  │  ChromaDB   │  │  MongoDB   │  │   Ollama    │  │
        │  │ Vector Store│  │   Atlas    │  │  Embeddings │  │
        │  │             │  │ Documents  │  │nomic-embed  │  │
        │  │             │  │ Chat Hist  │  │    -text    │  │
        │  └─────────────┘  └────────────┘  └─────────────┘  │
        └─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Router v7 | Client-side routing |
| Axios | HTTP requests |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Document & chat storage |
| ChromaDB | Vector database |
| Ollama (nomic-embed-text) | Local text embeddings |
| Groq API (Llama 3.3 70B) | LLM for answer generation |
| JWT + bcryptjs | Authentication |
| pdfjs-dist | PDF text extraction |
| Docker | Containerization |

---

## 📁 Project Structure

```
documind-ai/
│
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatMessage.tsx  # Individual message with sources
│   │   │   │   └── ChatWindow.tsx   # Full chat interface
│   │   │   ├── document/
│   │   │   │   ├── DocumentList.tsx # List of uploaded documents
│   │   │   │   └── DocumentUpload.tsx # Drag & drop PDF upload
│   │   │   └── ui/
│   │   │       ├── Badge.tsx        # Status badges
│   │   │       ├── Button.tsx       # Reusable button
│   │   │       └── Skeleton.tsx     # Loading skeletons
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Global auth state
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Main app page
│   │   │   ├── Login.tsx            # Login page
│   │   │   └── Register.tsx         # Register page
│   │   ├── services/
│   │   │   ├── api.ts               # Document & chat API calls
│   │   │   └── authApi.ts           # Auth API calls
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   └── utils/
│   │       └── helpers.ts           # Utility functions
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                          # Node.js backend
│   └── src/
│       ├── config/
│       │   ├── chromadb.ts          # ChromaDB client
│       │   ├── db.ts                # MongoDB connection
│       │   ├── groq.ts              # Groq client
│       │   └── multer.ts            # File upload config
│       ├── middleware/
│       │   └── auth.middleware.ts   # JWT auth middleware
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.interface.ts
│       │   │   ├── auth.model.ts
│       │   │   ├── auth.route.ts
│       │   │   └── auth.service.ts
│       │   ├── chat/
│       │   │   ├── chat.controller.ts
│       │   │   ├── chat.interface.ts
│       │   │   ├── chat.model.ts
│       │   │   ├── chat.route.ts
│       │   │   └── chat.service.ts
│       │   └── document/
│       │       ├── document.controller.ts
│       │       ├── document.interface.ts
│       │       ├── document.model.ts
│       │       ├── document.route.ts
│       │       └── document.service.ts
│       ├── routes/
│       │   └── index.ts             # Central route registration
│       ├── utils/
│       │   ├── chromadb.utils.ts    # Vector store operations
│       │   ├── embedding.utils.ts   # Ollama embedding calls
│       │   ├── jwt.utils.ts         # Token generation/verification
│       │   ├── pdf.utils.ts         # PDF text extraction
│       │   └── response.utils.ts    # Standardized API responses
│       └── index.ts                 # App entry point
│
├── docker-compose.yml               # ChromaDB service
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for ChromaDB)
- [Ollama](https://ollama.com/) (for local embeddings)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/arju10/documind-ai.git
cd documind-ai
```

### 2. Install Ollama and pull the embedding model

```bash
# Install Ollama (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the embedding model
ollama pull nomic-embed-text
```

### 3. Set up the server

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=your_mongodb_atlas_connection_string

# Groq API (free at console.groq.com)
GROQ_API_KEY=your_groq_api_key

# JWT
JWT_SECRET=your_super_secret_random_string

# ChromaDB (local)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Ollama (local)
OLLAMA_URL=http://localhost:11434
```

### 4. Set up the client

```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 5. Start ChromaDB with Docker

```bash
# From root directory
docker compose up chromadb -d
```

### 6. Start the server

```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected successfully
✅ ChromaDB connected successfully
✅ Groq connected successfully
```

### 7. Start the client

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |

### Documents
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/documents/upload` | Upload PDF | ✅ |
| GET | `/api/documents` | Get all documents | ✅ |
| DELETE | `/api/documents/:id` | Delete document | ✅ |

### Chat
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/chat/ask` | Ask a question | ✅ |
| GET | `/api/chat/history/:documentId` | Get chat history | ✅ |
| GET | `/api/chat` | Get all chats | ✅ |
| DELETE | `/api/chat/:chatId` | Delete chat | ✅ |

### Example Request

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Tahmina", "email": "tahmina@example.com", "password": "secret123"}'

# Upload PDF
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf=@document.pdf"

# Ask a question
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "DOC_ID", "question": "What is this document about?"}'
```

---

## 🔒 Security

- ✅ Passwords hashed with **bcryptjs** (10 salt rounds)
- ✅ **JWT tokens** with 7-day expiry
- ✅ All document and chat routes **protected by auth middleware**
- ✅ Each user can **only access their own documents**
- ✅ File type validation — **PDF only**
- ✅ File size limit — **10MB maximum**
- ✅ CORS configured for specific origins only

---

## 🤖 How the RAG Pipeline Works

```
1. USER UPLOADS PDF
   └── pdfjs-dist extracts raw text from all pages

2. TEXT PROCESSING
   └── Text is cleaned and split into 300-word chunks
       with 30-word overlap for context continuity

3. VECTOR EMBEDDINGS
   └── Each chunk is sent to Ollama (nomic-embed-text)
       which converts text → 768-dimensional vector

4. STORAGE
   └── Vectors + metadata stored in ChromaDB collection
       Document info saved to MongoDB

5. USER ASKS QUESTION
   └── Question is embedded with the same Ollama model

6. SEMANTIC SEARCH
   └── ChromaDB finds top 3 most similar chunks
       using cosine similarity

7. ANSWER GENERATION
   └── Top 3 chunks sent as context to Groq Llama 3.3 70B
       LLM generates accurate answer citing sources

8. RESPONSE
   └── Answer + source citations returned to user
```

---

## 🐳 Docker Services

```yaml
# Start all services
docker compose up -d

# Start only ChromaDB
docker compose up chromadb -d

# Stop all
docker compose down
```

---

## 📜 Available Scripts

### Server
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm run start      # Start production server
npm run lint       # Run ESLint
npm run format     # Format with Prettier
npm run type-check # TypeScript type checking
```

### Client
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | Coming soon |
| Backend | Vercel | Coming soon |
| Database | MongoDB Atlas | Cloud |
| Vector DB | Render | Coming soon |

---

## 📚 Related Research

This project is related to my published research on AI chatbots in education:

**"Investigating the Factors Affecting the Intention to Use AI Chatbots in STEM Education App: A Hybrid SEM and ANN Approach"**
- Published in: *European Journal of STEM Education*, Vol. 11, Issue 1 (June 2026)
- [Read the paper](https://www.lectitopublishing.nl/Article/Detail/investigating-the-factors-affecting-the-intention-to-use-ai-chatbots-in-stem-education-app-a-hybrid-18303)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👩‍💻 Author

**Mst. Tahmina Jerin Arju**

Full Stack AI Developer | React · Node.js · RAG · LLM Applications

- 🌐 LinkedIn: [linkedin.com/in/arju10](https://linkedin.com/in/arju10)
- 💻 GitHub: [github.com/arju10](https://github.com/arju10)
- 📧 Open to remote roles and freelance AI projects

---

## ⭐ Show your support

If you found this project helpful, please give it a **star** on GitHub! It helps others discover it.

[![GitHub stars](https://img.shields.io/github/stars/arju10/documind-ai?style=social)](https://github.com/arju10/documind-ai)