import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, AlertCircle } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSendMessage,
  isLoading,
  isListening,
  onToggleListening,
  sttSupported,
  sttError,
  interimTranscript
}) {
  const textareaRef = useRef(null);
  const formRef = useRef(null);

  // Auto-resize textarea as text expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap at 140px max height
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [input, interimTranscript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    const textToSend = input.trim();
    if (!textToSend) return;
    onSendMessage(textToSend);
  };

  /**
   * IME-safe Enter-to-Submit according to modern web standards
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Guard against IME composition (e.g. Japanese, Chinese, or mobile conversion)
      if (e.isComposing || e.keyCode === 229) {
        return;
      }

      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Active Speech Recognition Notice / Listening Indicator */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-lg text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <span className="font-semibold">Listening to your English...</span>
              {interimTranscript && (
                <span className="text-slate-600 italic">“{interimTranscript}”</span>
              )}
            </div>
            <button
              type="button"
              onClick={onToggleListening}
              className="text-rose-700 font-bold hover:underline cursor-pointer ml-2 text-xs"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Speech Recognition Error Notice (e.g. Mic Permission Denied) */}
        {sttError && (
          <div className="mb-2 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="flex-1">{sttError}</span>
          </div>
        )}

        {/* Main Input Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 rounded-2xl p-1.5 transition-all shadow-2xs"
        >
          {/* Accessible Label */}
          <label htmlFor="chat-input" className="sr-only">
            English Message Input
          </label>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={onToggleListening}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white mic-active-pulse shadow-md shadow-rose-200'
                : sttSupported
                ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60'
                : 'text-slate-400 cursor-not-allowed opacity-60'
            }`}
            title={
              !sttSupported
                ? 'Voice input is not supported in this browser (available on Chrome, Edge, Safari)'
                : isListening
                ? 'Click to stop listening'
                : 'Click to speak in English (Voice input)'
            }
            aria-label={isListening ? 'Stop microphone' : 'Start microphone voice input'}
            disabled={!sttSupported}
          >
            {isListening ? (
              <Mic className="w-5 h-5 text-white" />
            ) : sttSupported ? (
              <Mic className="w-5 h-5 text-slate-600" />
            ) : (
              <MicOff className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Textarea */}
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening... speak now or type anytime...'
                : 'Type a message in English or click the mic to speak... (Press Enter to send)'
            }
            className="w-full bg-transparent resize-none py-2 px-1 text-slate-800 text-sm focus:outline-hidden max-h-[140px] leading-relaxed placeholder:text-slate-400 custom-scrollbar"
            aria-multiline="true"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !isListening)}
            className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isLoading || !input.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-200 active:scale-95'
            }`}
            title="Send English message"
            aria-label="Send English message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Keyboard shortcut hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-2">
          <span>Press <kbd className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.2 rounded text-[10px]">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.2 rounded text-[10px]">Shift+Enter</kbd> for new line</span>
          <span>Dual Voice & Text Enabled</span>
        </div>
      </div>
    </div>
  );
}
