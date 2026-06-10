import { InferenceClient } from '@huggingface/inference';

const hf = new InferenceClient(process.env.HF_API_KEY);
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

// DEBUG: Log embedding model being used
// console.log('[EMBED] Using model:', EMBEDDING_MODEL);

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // DEBUG: Log text length being embedded
    // console.log('[EMBED] Generating embedding for text length:', text.length);

    const response = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    });

    // DEBUG: Log embedding dimension
    // console.log('[EMBED] Embedding dimension:', (response as number[]).length);

    return response as number[];
  } catch (error) {
    // DEBUG: Log embedding error
    // console.error('[EMBED] Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
};

export const generateEmbeddingsBatch = async (texts: string[], batchSize: number = 10): Promise<number[][]> => {
  const embeddings: number[][] = [];

  // DEBUG: Log batch details
  // console.log('[EMBED] Processing batch of', texts.length, 'texts');

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // DEBUG: Log current batch progress
    // console.log(`[EMBED] Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

    const batchEmbeddings = await Promise.all(batch.map((text) => generateEmbedding(text)));

    embeddings.push(...batchEmbeddings);
  }

  // DEBUG: Log total embeddings generated
  // console.log('[EMBED] Total embeddings generated:', embeddings.length);

  return embeddings;
};
