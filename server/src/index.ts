import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { testChromaConnection } from './config/chromadb.js';
import { testGroqConnection } from './config/groq.js';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// All routes
app.use('/api', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'DocuMind API is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server after DB and ChromaDB connections are established and Groq connection is tested
connectDB();
testChromaConnection();
testGroqConnection();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
