import fs from 'fs';
import { createRequire } from 'module';
import { v4 as uuidv4 } from 'uuid';
import DocumentModel from './document.model';
import { IDocument, ITextChunk, IUploadDocumentResponse } from './document.interface';
import { storeChunksInChroma, deleteChromaCollection } from '../../utils/chromadb.utils';

const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

// -------- PDF utilities -----------------------------------------------

const extractTextFromPDF = async (filePath: string): Promise<string> => {
  const fileBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(fileBuffer);

  // DEBUG: Check file was read correctly
  // console.log('[PDF] File buffer size:', fileBuffer.length);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    verbosity: 0, //  suppress all warnings
  });

  const pdf = await loadingTask.promise;

  // DEBUG: Check how many pages were detected
  // console.log('[PDF] Total pages:', pdf.numPages);

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // DEBUG: Check how many text items found per page
    // console.log(`[PDF] Page ${pageNum} text items:`, textContent.items.length);

    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str)
      .join(' ')
      .trim();

    fullText += pageText + '\n';

    // DEBUG: Preview first 100 chars of each page
    // console.log(`[PDF] Page ${pageNum} preview:`, pageText.substring(0, 100));
  }

  // DEBUG: Check total extracted text length
  // console.log('[PDF] Total text length:', fullText.length);

  return fullText;
};

const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): ITextChunk[] => {
  const chunks: ITextChunk[] = [];
  const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

  // DEBUG: Check cleaned text length before chunking
  // console.log('[CHUNK] Clean text length:', cleanText.length);

  if (!cleanText) return chunks;

  const words = cleanText.split(' ');
  let chunkIndex = 0;
  let i = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunkTextStr = chunkWords.join(' ');

    if (chunkTextStr.trim()) {
      chunks.push({
        text: chunkTextStr,
        chunkIndex,
        pageNumber: Math.floor(i / chunkSize) + 1,
      });
      chunkIndex++;
    }

    i += chunkSize - overlap;
  }

  // DEBUG: Check total chunks created
  // console.log('[CHUNK] Total chunks:', chunks.length);

  // DEBUG: Preview first chunk
  // console.log('[CHUNK] First chunk preview:', chunks[0]?.text.substring(0, 150));

  return chunks;
};

const deleteFile = (filePath: string): void => {
  // DEBUG: Log file deletion
  // console.log('[FILE] Deleting temp file:', filePath);

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ------- Service methods -------------------------------------------------------
export const uploadDocumentService = async (
  file: Express.Multer.File,
  userId: string,
): Promise<IUploadDocumentResponse> => {
  const collectionName = `doc_${uuidv4().replace(/-/g, '_')}`;

  // DEBUG: Log incoming upload details
  // console.log('[UPLOAD] userId:', userId);
  // console.log('[UPLOAD] filename:', file.originalname);
  // console.log('[UPLOAD] fileSize:', file.size);
  // console.log('[UPLOAD] collectionName:', collectionName);

  const document = await DocumentModel.create({
    userId,
    filename: file.filename,
    originalName: file.originalname,
    fileSize: file.size,
    collectionName,
    status: 'processing',
  });

  // DEBUG: Confirm document saved to MongoDB
  // console.log('[UPLOAD] Document saved to MongoDB:', document._id);

  try {
    const rawText = await extractTextFromPDF(file.path);

    // DEBUG: Check raw text returned
    // console.log('[UPLOAD] Raw text length:', rawText.length);

    if (!rawText || rawText.trim().length === 0) {
      await DocumentModel.findByIdAndUpdate(document._id, { status: 'failed' });
      deleteFile(file.path);
      throw new Error('Could not extract text from PDF');
    }

    const chunks = chunkText(rawText, 300, 30);

    // DEBUG: Log chunking details
    // console.log(`[UPLOAD] Processing ${chunks.length} chunks — please wait...`);

    // DEBUG: Confirm chunks before saving
    // console.log('[UPLOAD] Chunks created:', chunks.length);

    // Store chunks in ChromaDB as vectors
    await storeChunksInChroma(collectionName, chunks);

    // // DEBUG: Confirm ChromaDB storage
    // console.log('[UPLOAD] Chunks stored in ChromaDB');

    // Update document status in MongoDB to ready
    await DocumentModel.findByIdAndUpdate(document._id, {
      totalChunks: chunks.length,
      status: 'ready',
    });

    // DEBUG: Confirm document updated in MongoDB
    // console.log('[UPLOAD] Document status updated to ready');

    deleteFile(file.path);

    return {
      documentId: document._id.toString(),
      originalName: file.originalname,
      totalChunks: chunks.length,
      status: 'ready',
      preview: chunks[0]?.text.substring(0, 200) + '...',
    };
  } catch (error) {
    // DEBUG: Log error details
    // console.error('[UPLOAD] Error during processing:', error);

    deleteFile(file.path);
    await DocumentModel.findByIdAndUpdate(document._id, { status: 'failed' });
    throw error;
  }
};

export const getDocumentsService = async (userId: string): Promise<IDocument[]> => {
  // DEBUG: Log fetch request
  // console.log('[DOCUMENTS] Fetching documents for userId:', userId);

  return DocumentModel.find({ userId }).sort({ createdAt: -1 }).select('-__v');
};

export const deleteDocumentService = async (
  id: string,
  userId: string,
): Promise<IDocument | null> => {
  // DEBUG: Log delete request
  // console.log('[DELETE] Deleting document id:', id, 'for userId:', userId);
  const document = await DocumentModel.findOneAndDelete({ _id: id, userId });

  // Delete ChromaDB collection too
  if (document) {
    await deleteChromaCollection(document.collectionName);

    // DEBUG: Confirm ChromaDB collection deleted
    // console.log('[DELETE] ChromaDB collection deleted:', document.collectionName);
  }

  return document;
};
