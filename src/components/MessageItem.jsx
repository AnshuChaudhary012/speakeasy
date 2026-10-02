import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  CheckCircle2, 
  Lightbulb
} from 'lucide-react';

export default function MessageItem({
  message,
  onSpeak,
  isSpeakingThis,
  onStopSpeaking
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    const textToCopy = isUser
      ? message.text
      : message.fullTeacherText || message.reply || message.text;

    navigator.clipboard?.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
          <div className="flex flex-col items-end">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-br-xs px-4 py-2.5 shadow-xs text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.text}
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-[11px] text-slate-400">{formattedTime}</span>
              <button
                onClick={handleCopy}
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Copy message"
                aria-label="Copy message"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mb-4">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Teacher Message
  const hasMistake = message.hasMistake;
  const textToRead = message.speechText || message.fullTeacherText || message.reply || message.text;

  return (
    <div className="flex justify-start mb-5 group">
      <div className="flex items-start gap-2.5 max-w-[95%] md:max-w-[85%]">
        {/* Teacher Avatar */}
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1">
          {/* Main Bubble */}
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs space-y-3">
            {/* Header: Teacher Name & Status */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  SpeakEasy Teacher
                </span>
                {hasMistake ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Lightbulb className="w-2.5 h-2.5" />
                    Grammar Tip
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Natural English
                  </span>
                )}
              </div>

              {/* Speaker & Copy Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (isSpeakingThis) {
                      onStopSpeaking();
                    } else {
                      onSpeak(textToRead, message.id);
                    }
                  }}
                  type="button"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isSpeakingThis
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                  title={isSpeakingThis ? 'Stop voice' : 'Listen to teacher voice'}
                  aria-label={isSpeakingThis ? 'Stop teacher voice' : 'Listen to teacher response'}
                >
                  {isSpeakingThis ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                      <span className="text-[11px] font-semibold">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px] font-medium hidden sm:inline">Listen</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title="Copy response"
                  aria-label="Copy teacher response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Grammar / Phrasing Feedback Card (if mistake detected) */}
            {hasMistake && message.correctedSentence && (
              <div className="rounded-xl bg-amber-50/70 border border-amber-200/90 p-3 space-y-2 text-xs">
                <div className="font-medium text-amber-900 flex items-center gap-1.5">
                  <span>{message.feedback || 'Almost! A natural correction is:'}</span>
                </div>
                
                {/* Corrected sentence */}
                <div className="bg-white/90 border border-amber-200 rounded-lg p-2 font-medium text-slate-900 shadow-2xs">
                  <span className="text-amber-800 font-bold mr-1">Correction:</span>
                  <span className="font-semibold text-emerald-700">“{message.correctedSentence}”</span>
                </div>

                {/* Explanation */}
                {message.explanation && (
                  <p className="text-slate-700 text-[11px] leading-relaxed pl-1">
                    <span className="font-semibold text-slate-900">Why: </span>
                    {message.explanation}
                  </p>
                )}
              </div>
            )}

            {/* If no mistake, show friendly praise if provided */}
            {!hasMistake && message.feedback && (
              <p className="text-xs font-semibold text-emerald-700">
                {message.feedback}
              </p>
            )}

            {/* Natural Conversational Reply */}
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {message.reply || message.fullTeacherText || message.text}
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-1 px-1">
            <span className="text-[11px] text-slate-400">{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
