import { Document } from 'mongoose';

export type DocumentStatus = 'processing' | 'ready' | 'failed';

export interface IDocument extends Document {
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  totalChunks: number;
  collectionName: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUploadDocumentResponse {
  documentId: string;
  originalName: string;
  totalChunks: number;
  status: DocumentStatus;
  preview: string;
}

export interface ITextChunk {
  text: string;
  chunkIndex: number;
  pageNumber: number;
}
