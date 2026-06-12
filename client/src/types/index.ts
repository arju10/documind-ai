export interface IDocument {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  totalChunks: number;
  collectionName: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
}

export interface ISource {
  pageNumber: number;
  text: string;
  score: number;
}

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ISource[];
  createdAt: string;
}

export interface IChat {
  _id: string;
  userId: string;
  documentId: string;
  title: string;
  messages: IMessage[];
  createdAt: string;
}

export interface IAskResponse {
  answer: string;
  sources: ISource[];
  chatId: string;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
