import mongoose, { Schema } from 'mongoose';
import { IDocument } from './document.interface';

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
    collectionName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
