const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

// DEBUG: Log Ollama config
// console.log('[EMBED] Ollama URL:', OLLAMA_URL);
// console.log('[EMBED] Model:', EMBEDDING_MODEL);

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // DEBUG: Log text length
    // console.log('[EMBED] Generating embedding for text length:', text.length);

    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: text,
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

export const generateEmbeddingsBatch = async (texts: string[], batchSize: number = 10): Promise<number[][]> => {
  const embeddings: number[][] = [];

  // DEBUG: Log batch details
  // console.log('[EMBED] Processing batch of', texts.length, 'texts');

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // DEBUG: Log batch progress
    // console.log(`[EMBED] Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

    const batchEmbeddings = await Promise.all(batch.map((text) => generateEmbedding(text)));

    embeddings.push(...batchEmbeddings);
  }

  // DEBUG: Log total embeddings generated
  // console.log('[EMBED] Total embeddings generated:', embeddings.length);

  return embeddings;
};
