import mongoose, { Schema } from 'mongoose';
import { IChat } from './chat.interface';

const SourceSchema = new Schema({
  pageNumber: { type: Number, required: true },
  text: { type: String, required: true },
  score: { type: Number, required: true },
});

const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: { type: String, required: true },
  sources: [SourceSchema],
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true, index: true },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    messages: [MessageSchema],
  },
  { timestamps: true },
);

export default mongoose.model<IChat>('Chat', ChatSchema);
