import { useState } from 'react';
import type { IMessage } from '../../types';
import { getScoreColor } from '../../utils/helpers';

interface ChatMessageProps {
  message: IMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              flex-shrink-0 text-xs font-bold
              ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}
            `}
          >
            {isUser ? 'U' : 'AI'}
          </div>

          {/* Message bubble */}
          <div
            className={`
              px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }
            `}
          >
            {message.content}
          </div>
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 ml-10">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showSources ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showSources ? 'Hide' : 'Show'} {message.sources.length} sources
            </button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">Page {source.pageNumber}</span>
                      <span className={`text-xs font-medium ${getScoreColor(source.score)}`}>
                        {Math.round(source.score * 100)}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{source.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
