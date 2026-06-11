import { Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ISource[];
  createdAt: Date;
}

export interface ISource {
  pageNumber: number;
  text: string;
  score: number;
}

export interface IChat extends Document {
  userId: string;
  documentId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAskQuestionInput {
  documentId: string;
  question: string;
  userId: string;
}

export interface IAskQuestionResponse {
  answer: string;
  sources: ISource[];
  chatId: string;
}
