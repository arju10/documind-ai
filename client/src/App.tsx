import { useState, useEffect } from 'react';
import { getDocuments } from './services/api';
import DocumentUpload from './components/document/DocumentUpload';
import DocumentList from './components/document/DocumentList';
import ChatWindow from './components/chat/ChatWindow';
import type { IDocument } from './types';

const App = () => {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  // Load documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await getDocuments();
        if (response.success) {
          setDocuments(response.data);
          // Auto-select first ready document
          const firstReady = response.data.find((d) => d.status === 'ready');
          if (firstReady) setSelectedDocument(firstReady);
        }
      } catch {
        console.error('Failed to load documents');
      } finally {
        setIsLoadingDocuments(false);
      }
    };
    loadDocuments();
  }, []);

  const handleUploadSuccess = (document: IDocument) => {
    setDocuments((prev) => [document, ...prev]);
    if (document.status === 'ready') {
      setSelectedDocument(document);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d._id !== id));
    if (selectedDocument?._id === id) {
      setSelectedDocument(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">DocuMind AI</h1>
              <p className="text-xs text-gray-400">Chat with your documents</p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="px-4 py-4 border-b border-gray-200">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Documents</p>
          {isLoadingDocuments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          ) : (
            <DocumentList
              documents={documents}
              selectedDocument={selectedDocument}
              onSelect={setSelectedDocument}
              onDelete={handleDeleteDocument}
            />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedDocument ? (
          <ChatWindow document={selectedDocument} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a document to start chatting</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Upload a PDF document from the sidebar, then select it to ask questions and get AI-powered answers with
              source citations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
