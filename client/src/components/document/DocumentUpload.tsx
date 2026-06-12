import { useState, useRef } from 'react';
import { uploadDocument } from '../../services/api';
import type { IDocument } from '../../types';

interface DocumentUploadProps {
  onUploadSuccess: (document: IDocument) => void;
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const response = await uploadDocument(file);
      if (response.success) {
        onUploadSuccess(response.data);
      }
    } catch {
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-blue-600 font-medium">Processing PDF... This may take a moment</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Drop your PDF here or click to browse</p>
            <p className="text-xs text-gray-400">PDF files up to 10MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
