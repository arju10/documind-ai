import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatFileSize, formatDate } from '../../utils/helpers';
import { deleteDocument } from '../../services/api';
import { DocumentSkeleton } from '../ui/Skeleton';
import Badge from '../ui/Badge';
import type { IDocument } from '../../types';

interface DocumentListProps {
  documents: IDocument[];
  selectedDocument: IDocument | null;
  onSelect: (document: IDocument) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const statusVariant = (status: IDocument['status']): 'green' | 'yellow' | 'red' => {
  if (status === 'ready') return 'green';
  if (status === 'processing') return 'yellow';
  return 'red';
};

const DocumentList = ({ documents, selectedDocument, onSelect, onDelete, isLoading = false }: DocumentListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteDocument(id);
      onDelete(id);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <DocumentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium">No documents yet</p>
        <p className="text-xs mt-1 text-gray-400">Upload a PDF above to get started</p>
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
            transition-all duration-200 group relative
            ${
              selectedDocument?._id === doc._id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
            ${doc.status !== 'ready' ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {/* Selected indicator */}
          {selectedDocument?._id === doc._id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
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

            {/* Delete button */}
            <button
              onClick={(e) => handleDelete(e, doc._id)}
              disabled={deletingId === doc._id}
              className="
                opacity-0 group-hover:opacity-100
                flex-shrink-0 p-1.5 rounded-lg
                text-gray-400 hover:text-red-500 hover:bg-red-50
                transition-all duration-200
                disabled:opacity-50
              "
            >
              {deletingId === doc._id ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
