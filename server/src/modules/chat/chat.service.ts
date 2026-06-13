import { groqClient } from '../../config/groq';
import { searchSimilarChunks } from '../../utils/chromadb.utils';
import DocumentModel from '../document/document.model';
import ChatModel from './chat.model';
import { IAskQuestionInput, IAskQuestionResponse, IChat } from './chat.interface';

// --------- RAG Pipeline ---------
const buildPrompt = (context: string, question: string): string => {
  return `You are a helpful AI assistant that answers questions based on the provided document context.

CONTEXT FROM DOCUMENT:
${context}

INSTRUCTIONS:
- Answer the question using ONLY the information provided in the context above
- If the answer is not in the context, say "I could not find this information in the document"
- Be concise and clear
- Cite which part of the document supports your answer

QUESTION: ${question}

ANSWER:`;
};

export const askQuestionService = async (input: IAskQuestionInput): Promise<IAskQuestionResponse> => {
  const { documentId, question, userId } = input;

  // DEBUG: Log incoming question
  // console.log('[RAG] Question:', question);
  // console.log('[RAG] DocumentId:', documentId);

  // 1. Get document from MongoDB to get collectionName
  const document = await DocumentModel.findOne({ _id: documentId, userId });

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status !== 'ready') {
    throw new Error('Document is still processing');
  }

  // DEBUG: Log document found
  // console.log('[RAG] Document found:', document.originalName);

  // 2. Search ChromaDB for relevant chunks
  let searchResults;
  try {
    searchResults = await searchSimilarChunks(
      document.collectionName,
      question,
      3, // top 3 most relevant chunks
    );
  } catch {
    throw new Error('This document was uploaded before embeddings were set up. Please delete and re-upload it.');
  }

  // DEBUG: Log search results
  // console.log('[RAG] Search results:', searchResults.length);
  // console.log('[RAG] Top result score:', searchResults[0]?.score);

  if (!searchResults || searchResults.length === 0) {
    throw new Error('No relevant content found. Please delete and re-upload this document.');
  }

  // 3. Build context from search results
  const context = searchResults
    .map((result, index) => `[Chunk ${index + 1} - Page ${result.pageNumber}]:\n${result.text}`)
    .join('\n\n');

  // DEBUG: Log context length
  // console.log('[RAG] Context length:', context.length);

  // 4. Build prompt
  const prompt = buildPrompt(context, question);

  // DEBUG: Log prompt
  // console.log('[RAG] Prompt built, sending to Groq...');

  // 5. Send to Groq LLM
  const completion = await groqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.3, // lower = more factual, less creative
  });

  const answer = completion.choices[0]?.message?.content ?? 'Could not generate answer';

  // DEBUG: Log answer
  // console.log('[RAG] Answer generated, length:', answer.length);

  // 6. Format sources
  const sources = searchResults.map((result) => ({
    pageNumber: result.pageNumber,
    text: result.text.substring(0, 200) + '...',
    score: Math.round(result.score * 100) / 100,
  }));

  // 7. Save to MongoDB chat history
  const existingChat = await ChatModel.findOne({ userId, documentId });

  if (existingChat) {
    // Add to existing chat
    existingChat.messages.push(
      {
        role: 'user',
        content: question,
        createdAt: new Date(),
      },
      {
        role: 'assistant',
        content: answer,
        sources,
        createdAt: new Date(),
      },
    );
    await existingChat.save();

    // DEBUG: Log chat updated
    // console.log('[RAG] Chat history updated:', existingChat._id);

    return {
      answer,
      sources,
      chatId: existingChat._id.toString(),
    };
  } else {
    // Create new chat
    const newChat = await ChatModel.create({
      userId,
      documentId,
      title: question.substring(0, 50),
      messages: [
        {
          role: 'user',
          content: question,
          createdAt: new Date(),
        },
        {
          role: 'assistant',
          content: answer,
          sources,
          createdAt: new Date(),
        },
      ],
    });

    // DEBUG: Log new chat created
    // console.log('[RAG] New chat created:', newChat._id);

    return {
      answer,
      sources,
      chatId: newChat._id.toString(),
    };
  }
};

export const getChatHistoryService = async (userId: string, documentId: string): Promise<IChat | null> => {
  // DEBUG: Log fetch request
  // console.log('[CHAT] Fetching history for userId:', userId, 'documentId:', documentId);

  return ChatModel.findOne({ userId, documentId }).select('-__v');
};

export const getAllChatsService = async (userId: string): Promise<IChat[]> => {
  // DEBUG: Log fetch all chats
  // console.log('[CHAT] Fetching all chats for userId:', userId);

  return ChatModel.find({ userId }).sort({ updatedAt: -1 }).select('-__v');
};

export const deleteChatService = async (chatId: string, userId: string): Promise<IChat | null> => {
  // DEBUG: Log delete request
  // console.log('[CHAT] Deleting chat:', chatId);

  return ChatModel.findOneAndDelete({ _id: chatId, userId });
};
