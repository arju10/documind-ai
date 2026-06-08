export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IDocument {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  totalChunks: number;
  collectionName: string;
  createdAt: Date;
}

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ISource[];
  createdAt: Date;
}

export interface IChat {
  _id: string;
  userId: string;
  documentId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
}

export interface ISource {
  pageNumber: number;
  text: string;
  score: number;
}

export interface AuthRequest extends Request {
  userId?: string;
}