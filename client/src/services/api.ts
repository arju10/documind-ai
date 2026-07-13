import axios from 'axios';
import type { IDocument, IChat, IAskResponse, IApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 300000,
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('documind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add timestamp to prevent caching
  config.params = {
    ...config.params,
    _t: Date.now(),
  };
  return config;
});

// Handle 401 errors — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('documind_token');
      localStorage.removeItem('documind_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Document APIs ─────────────────────────────────────────

export const uploadDocument = async (file: File): Promise<IApiResponse<IDocument>> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await api.post<IApiResponse<IDocument>>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 minutes timeout for large files
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

// ── Chat APIs ─────────────────────────────────────────────

export const askQuestion = async (
  documentId: string,
  question: string,
): Promise<IApiResponse<IAskResponse>> => {
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
