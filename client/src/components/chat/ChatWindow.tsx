import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { askQuestion, getChatHistory } from '../../services/api';
import ChatMessage from './ChatMessage';
import { MessageSkeleton } from '../ui/Skeleton';
import type { IDocument, IMessage } from '../../types';

interface ChatWindowProps {
  document: IDocument;
}

const SUGGESTED_QUESTIONS = [
  'What is this document about?',
  'Summarize the key points',
  'What are the main conclusions?',
];

const ChatWindow = ({ document }: ChatWindowProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history when document changes
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setMessages([]);
      try {
        const response = await getChatHistory(document._id);
        if (response.success && response.data?.messages) {
          setMessages(response.data.messages);
        }
      } catch {
        // No history yet — silent
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [document._id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [question]);

  const handleSubmit = async (questionText?: string) => {
    const q = (questionText ?? question).trim();
    if (!q || isLoading) return;

    const userMessage: IMessage = {
      role: 'user',
      content: q,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await askQuestion(document._id, q);
      if (response.success) {
        const assistantMessage: IMessage = {
          role: 'assistant',
          content: response.data.answer,
          sources: response.data.sources,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get answer. Please try again.';
      toast.error(message);
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{document.originalName}</p>
            <p className="text-xs text-gray-400">{document.totalChunks} chunks indexed · Ready to answer questions</p>
          </div>
          {/* Status dot */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
        {isLoadingHistory ? (
          <div className="space-y-4">
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ask anything about this document</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-sm">
              I'll search through the document and give you accurate answers with source citations.
            </p>

            {/* Suggested questions */}
            <div className="flex flex-col gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="
                    text-left px-4 py-3 rounded-xl border border-gray-200
                    bg-white hover:border-blue-300 hover:bg-blue-50
                    text-sm text-gray-600 hover:text-blue-700
                    transition-all duration-200 shadow-sm
                  "
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this document..."
              rows={1}
              disabled={isLoading}
              className="
                w-full resize-none rounded-xl border border-gray-300
                px-4 py-3 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder:text-gray-400 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                pr-12
              "
              style={{ maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={!question.trim() || isLoading}
            className="
              w-11 h-11 rounded-xl flex items-center justify-center
              bg-blue-600 hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 flex-shrink-0
              shadow-md hover:shadow-lg
            "
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">Enter</kbd> to send ·{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
