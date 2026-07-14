const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';
const MAX_CHUNK_LENGTH = 500; // ← max characters per embedding call

// DEBUG: Log Ollama config
// console.log('[EMBED] Ollama URL:', OLLAMA_URL);
// console.log('[EMBED] Model:', EMBEDDING_MODEL);

// Truncate text to prevent Ollama 500 errors on large chunks
const truncateText = (text: string): string => {
  if (text.length <= MAX_CHUNK_LENGTH) return text;
  return text.substring(0, MAX_CHUNK_LENGTH);
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const truncated = truncateText(text);

    // DEBUG: Log text length
    // console.log('[EMBED] Original length:', text.length, 'Truncated:', truncated.length);

    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: truncated,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { embedding: number[] };

    // DEBUG: Log embedding dimension
    // console.log('[EMBED] Embedding dimension:', data.embedding.length);

    return data.embedding;
  } catch (error) {
    // DEBUG: Log error
    // console.error('[EMBED] Error:', error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
};

export const generateEmbeddingsBatch = async (
  texts: string[],
  batchSize: number = 3,
): Promise<number[][]> => {
  const embeddings: number[][] = [];

  // DEBUG: Log batch details
  // console.log('[EMBED] Processing', texts.length, 'texts sequentially');

  for (let i = 0; i < texts.length; i++) {
    const embedding = await generateEmbedding(texts[i]);
    embeddings.push(embedding);

    // Small delay between calls to let CPU breathe
    await new Promise((resolve) => setTimeout(resolve, 100));

    // DEBUG: Log progress every 5 chunks
    // if (i % 5 === 0) console.log(`[EMBED] Progress: ${i + 1}/${texts.length}`);
  }

  // DEBUG: Log total embeddings generated
  // console.log('[EMBED] Total embeddings generated:', embeddings.length);

  return embeddings;
};
