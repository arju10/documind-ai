import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { uploadDocument } from '../../services/api';
import type { IDocument } from '../../types';

interface DocumentUploadProps {
  onUploadSuccess: (document: IDocument) => void;
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    const toastId = toast.loading('Processing PDF... This may take a moment');

    try {
      const response = await uploadDocument(file);
      if (response.success) {
        toast.success('PDF uploaded successfully!', { id: toastId });
        onUploadSuccess(response.data);
      }
    } catch {
      toast.error('Failed to upload PDF. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-6
        flex flex-col items-center justify-center
        transition-all duration-200 min-h-[140px]
        ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
        ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-blue-600">Processing PDF...</p>
            <p className="text-xs text-gray-400 mt-0.5">Generating embeddings</p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-3
            transition-colors duration-200
            ${isDragging ? 'bg-blue-100' : 'bg-blue-50'}
          `}
          >
            <svg
              className={`w-6 h-6 transition-colors ${isDragging ? 'text-blue-600' : 'text-blue-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 text-center">
            {isDragging ? 'Drop it here!' : 'Drop your PDF here or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF files up to 10MB</p>
        </>
      )}
    </div>
  );
};

export default DocumentUpload;
