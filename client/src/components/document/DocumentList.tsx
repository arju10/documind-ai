import { formatFileSize, formatDate } from '../../utils/helpers';
import { deleteDocument } from '../../services/api';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { IDocument } from '../../types';
import { useState } from 'react';

interface DocumentListProps {
  documents: IDocument[];
  selectedDocument: IDocument | null;
  onSelect: (document: IDocument) => void;
  onDelete: (id: string) => void;
}

const statusVariant = (status: IDocument['status']): 'green' | 'yellow' | 'red' => {
  if (status === 'ready') return 'green';
  if (status === 'processing') return 'yellow';
  return 'red';
};

const DocumentList = ({ documents, selectedDocument, onSelect, onDelete }: DocumentListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteDocument(id);
      onDelete(id);
    } catch {
      console.error('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm">No documents yet</p>
        <p className="text-xs mt-1">Upload a PDF to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc._id}
          onClick={() => doc.status === 'ready' && onSelect(doc)}
          className={`
            p-3 rounded-lg border cursor-pointer
            transition-all duration-200 group
            ${
              selectedDocument?._id === doc._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
            ${doc.status !== 'ready' ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.originalName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
                  {doc.status === 'ready' && <span className="text-xs text-gray-400">{doc.totalChunks} chunks</span>}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDelete(e!, doc._id)}
              loading={deletingId === doc._id}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
