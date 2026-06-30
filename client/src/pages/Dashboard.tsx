import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { IDocument } from '../types';
import { getDocuments } from '../services/api';
import DocumentUpload from '../components/document/DocumentUpload';
import DocumentList from '../components/document/DocumentList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/AuthContext';

const App = () => {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await getDocuments();
        if (response.success) {
          setDocuments(response.data);
          const firstReady = response.data.find((d) => d.status === 'ready');
          if (firstReady) setSelectedDocument(firstReady);
        }
      } catch {
        toast.error('Failed to load documents');
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
      setIsSidebarOpen(false);
    }
    toast.success(`${document.originalName} is ready!`);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d._id !== id));
    if (selectedDocument?._id === id) {
      setSelectedDocument(null);
    }
  };

  const handleSelectDocument = (doc: IDocument) => {
    setSelectedDocument(doc);
    setIsSidebarOpen(false); // close sidebar on mobile after selection
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:relative inset-y-0 left-0 z-30
        w-80 flex-shrink-0 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">DocuMind AI</h1>
              <p className="text-xs text-gray-400">Chat with your documents</p>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Upload */}
        <div className="px-4 py-4 border-b border-gray-100">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Your Documents
            </p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>
          <DocumentList
            documents={documents}
            selectedDocument={selectedDocument}
            onSelect={handleSelectDocument}
            onDelete={handleDeleteDocument}
            isLoading={isLoadingDocuments}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Built with React + Node.js + RAG + Groq
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">DocuMind AI</span>
          </div>
        </div>

        {selectedDocument ? (
          <ChatWindow document={selectedDocument} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to DocuMind AI</h2>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
              Upload a PDF document and ask questions. Get accurate AI-powered answers with source
              citations from your document.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
              {[
                { icon: '📄', title: 'Upload PDF', desc: 'Any PDF up to 10MB' },
                { icon: '🔍', title: 'Smart Search', desc: 'Semantic vector search' },
                { icon: '💬', title: 'AI Answers', desc: 'Powered by Llama 3' },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <p className="text-sm font-semibold text-gray-700">{feature.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mt-8 lg:hidden px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
            >
              Upload your first PDF →
            </button>
          </div>
        )}
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-medium text-gray-700 truncate">{user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
