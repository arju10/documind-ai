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

export const generateEmbeddingsBatch = async (
  texts: string[],
  batchSize: number = 3, // ← reduced from 10 to 3
): Promise<number[][]> => {
  const embeddings: number[][] = [];

  // DEBUG: Log batch details
  // console.log('[EMBED] Processing', texts.length, 'texts sequentially');

  for (let i = 0; i < texts.length; i++) {
    // Process ONE at a time — prevents CPU overload
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
