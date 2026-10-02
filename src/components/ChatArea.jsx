import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function ChatArea({
  messages,
  isLoading,
  error,
  onRetry,
  onSpeak,
  speakingId,
  onStopSpeaking
}) {
  const bottomRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main
      role="log"
      aria-live="polite"
      aria-label="Conversation history"
      className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar"
    >
      <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
        {/* Messages */}
        <div className="space-y-1">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onSpeak={onSpeak}
              isSpeakingThis={speakingId === msg.id}
              onStopSpeaking={onStopSpeaking}
            />
          ))}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center gap-2.5 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Teacher is analyzing grammar & writing response...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="my-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  type="button"
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </main>
  );
}
