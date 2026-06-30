import { Request, Response } from 'express';
import { askQuestionService, getChatHistoryService, getAllChatsService, deleteChatService } from './chat.service';
import { sendSuccess, sendError } from '../../utils/response.utils';
import { AuthRequest } from '../../middleware/auth.middleware';

// POST /api/chat/ask
export const askQuestion = async (req: Request, res: Response): Promise<void> => {
  const { documentId, question } = req.body as {
    documentId: string;
    question: string;
  };
  // const userId = (req.headers['x-user-id'] as string) || 'temp-user-123';
  const userId = (req as AuthRequest).userId as string;

  // DEBUG: Log incoming request
  // console.log('[CONTROLLER] Ask question:', question);

  if (!documentId || !question) {
    sendError(res, 'documentId and question are required', 400);
    return;
  }

  if (question.trim().length < 3) {
    sendError(res, 'Question is too short', 400);
    return;
  }

  try {
    const result = await askQuestionService({ documentId, question, userId });
    sendSuccess(res, result, 'Answer generated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate answer';
    sendError(res, message, 500, error);
  }
};

// GET /api/chat/history/:documentId
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  const documentId = req.params['documentId'] as string;
  // const userId = (req.headers['x-user-id'] as string) || 'temp-user-123';
  const userId = (req as AuthRequest).userId as string;

  try {
    const chat = await getChatHistoryService(userId, documentId);
    sendSuccess(res, chat, 'Chat history fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch chat history', 500, error);
  }
};

// GET /api/chat
export const getAllChats = async (req: Request, res: Response): Promise<void> => {
  // const userId = (req.headers['x-user-id'] as string) || 'temp-user-123';
  const userId = (req as AuthRequest).userId as string;

  try {
    const chats = await getAllChatsService(userId);
    sendSuccess(res, chats, 'Chats fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch chats', 500, error);
  }
};

// DELETE /api/chat/:chatId
export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  const chatId = req.params['chatId'] as string;
  // const userId = (req.headers['x-user-id'] as string) || 'temp-user-123';
  const userId = (req as AuthRequest).userId as string;

  try {
    const chat = await deleteChatService(chatId, userId);

    if (!chat) {
      sendError(res, 'Chat not found', 404);
      return;
    }

    sendSuccess(res, null, 'Chat deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete chat', 500, error);
  }
};
