import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  uploadDocumentService,
  getDocumentsService,
  deleteDocumentService,
} from './document.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;

  if (!file) {
    sendError(res, 'No PDF file uploaded', 400);
    return;
  }

  const userId = (req as AuthRequest).userId as string;

  try {
    const result = await uploadDocumentService(file, userId);
    sendSuccess(res, result, 'PDF uploaded and processed successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process PDF';
    sendError(res, message, 500, error);
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;

  try {
    const documents = await getDocumentsService(userId);
    sendSuccess(res, documents, 'Documents fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch documents', 500, error);
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  const id = req.params['id'] as string;
  const userId = (req as AuthRequest).userId as string;

  try {
    const document = await deleteDocumentService(id, userId);

    if (!document) {
      sendError(res, 'Document not found', 404);
      return;
    }

    sendSuccess(res, null, 'Document deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete document', 500, error);
  }
};
