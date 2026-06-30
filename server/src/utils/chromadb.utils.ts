import { chromaClient } from '../config/chromadb';
import { ITextChunk } from '../modules/document/document.interface';
import { generateEmbeddingsBatch, generateEmbedding } from './embedding.utils';

export interface ISearchResult {
  text: string;
  chunkIndex: number;
  pageNumber: number;
  score: number;
}

export const storeChunksInChroma = async (
  collectionName: string,
  chunks: ITextChunk[],
): Promise<void> => {
  // DEBUG: Log storage details
  // console.log('[CHROMA] Storing chunks in collection:', collectionName);
  // console.log('[CHROMA] Total chunks to store:', chunks.length);

  // 1. Get or create collection — pass embeddingFunction: null since we provide our own
  const collection = await chromaClient.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null as never,
    metadata: { 'hnsw:space': 'cosine' },
  });

  // DEBUG: Log collection created
  // console.log('[CHROMA] Collection ready:', collectionName);

  // 2. Generate embeddings for all chunks
  const texts = chunks.map((chunk) => chunk.text);
  const embeddings = await generateEmbeddingsBatch(texts, 10);

  // DEBUG: Log embeddings generated
  // console.log('[CHROMA] Embeddings generated:', embeddings.length);

  // 3. Prepare data
  const ids = chunks.map((chunk) => `chunk_${chunk.chunkIndex}`);
  const metadatas = chunks.map((chunk) => ({
    chunkIndex: chunk.chunkIndex,
    pageNumber: chunk.pageNumber,
    textLength: chunk.text.length,
  }));

  // 4. Store in batches of 50
  const batchSize = 50;
  for (let i = 0; i < chunks.length; i += batchSize) {
    await collection.add({
      ids: ids.slice(i, i + batchSize),
      embeddings: embeddings.slice(i, i + batchSize),
      documents: texts.slice(i, i + batchSize),
      metadatas: metadatas.slice(i, i + batchSize),
    });

    // DEBUG: Log batch stored
    // console.log(`[CHROMA] Stored batch ${Math.floor(i / batchSize) + 1}`);
  }

  // DEBUG: Log storage complete
  // console.log('[CHROMA] All chunks stored successfully');
};

export const searchSimilarChunks = async (
  collectionName: string,
  query: string,
  topK: number = 3,
): Promise<ISearchResult[]> => {
  // DEBUG: Log search details
  // console.log('[CHROMA] Searching collection:', collectionName);
  // console.log('[CHROMA] Query:', query);

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Get collection — pass embeddingFunction: null since we provide our own
  const collection = await chromaClient.getCollection({
    name: collectionName,
    embeddingFunction: null as never,
  });

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  // DEBUG: Log raw results
  // console.log('[CHROMA] Raw results count:', results.ids[0].length);

  // 3. Format and return results
  const searchResults: ISearchResult[] = results.ids[0].map((_, index) => ({
    text: results.documents[0][index] ?? '',
    chunkIndex: (results.metadatas[0][index]?.chunkIndex as number) ?? 0,
    pageNumber: (results.metadatas[0][index]?.pageNumber as number) ?? 1,
    score: results.distances ? 1 - (results.distances[0][index] ?? 0) : 0,
  }));

  // DEBUG: Log formatted results
  // console.log('[CHROMA] Search results:', searchResults.length);

  return searchResults;
};

export const deleteChromaCollection = async (collectionName: string): Promise<void> => {
  try {
    await chromaClient.deleteCollection({ name: collectionName });

    // DEBUG: Log deletion
    // console.log('[CHROMA] Collection deleted:', collectionName);
  } catch {
    // Collection might not exist — that's ok
    // console.warn('[CHROMA] Collection not found:', collectionName);
  }
};
