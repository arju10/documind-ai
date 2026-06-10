import { ChromaClient } from 'chromadb';

// DEBUG: Log ChromaDB connection details
// console.log('[CHROMA] Connecting to host:', process.env.CHROMA_HOST || 'localhost');
// console.log('[CHROMA] Connecting to port:', process.env.CHROMA_PORT || '8000');

export const chromaClient = new ChromaClient({
  ssl: false,
  host: process.env.CHROMA_HOST || 'localhost',
  port: parseInt(process.env.CHROMA_PORT || '8000', 10),
});

export const testChromaConnection = async (): Promise<void> => {
  try {
    await chromaClient.heartbeat();
    console.log('ChromaDB connected successfully');
  } catch (error) {
    console.error('ChromaDB connection error:', error);
    process.exit(1);
  }
};
