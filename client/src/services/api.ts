import axios from 'axios';
import type { IDocument, IChat, IAskResponse, IApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Temporary userId until auth is built
const TEMP_USER_ID = 'temp-user-123';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'x-user-id': TEMP_USER_ID,
  },
});

// --------- Document APIs ---------------------------------
export const uploadDocument = async (file: File): Promise<IApiResponse<IDocument>> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await api.post<IApiResponse<IDocument>>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDocuments = async (): Promise<IApiResponse<IDocument[]>> => {
  const response = await api.get<IApiResponse<IDocument[]>>('/documents');
  return response.data;
};

export const deleteDocument = async (id: string): Promise<IApiResponse<null>> => {
  const response = await api.delete<IApiResponse<null>>(`/documents/${id}`);
  return response.data;
};

// --------- Chat APIs ---------------------------------
export const askQuestion = async (documentId: string, question: string): Promise<IApiResponse<IAskResponse>> => {
  const response = await api.post<IApiResponse<IAskResponse>>('/chat/ask', {
    documentId,
    question,
  });
  return response.data;
};

export const getChatHistory = async (documentId: string): Promise<IApiResponse<IChat>> => {
  const response = await api.get<IApiResponse<IChat>>(`/chat/history/${documentId}`);
  return response.data;
};
