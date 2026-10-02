import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff 
} from 'lucide-react';

export default function Header({
  currentMode,
  onResetChat,
  autoSpeak,
  onToggleAutoSpeak,
  speechRate,
  onChangeSpeechRate,
  isListening,
  isSpeaking,
  onStopSpeaking,
  ttsSupported,
  sttSupported,
  isDemoMode
}) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand & Mode */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                SpeakEasy
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Free
              </span>
              {isDemoMode && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  Preview Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              English Conversation Teacher &bull; <span className="text-indigo-600 font-semibold">{currentMode?.title || 'Casual'}</span>
            </p>
          </div>
        </div>

        {/* Right: Audio & Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Hardware Status Badges */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg">
            <span 
              className={`flex items-center gap-1 ${sttSupported ? (isListening ? 'text-rose-600 font-semibold' : 'text-slate-600') : 'text-slate-300'}`}
              title={sttSupported ? (isListening ? 'Microphone active' : 'Speech recognition ready') : 'Speech recognition not available in this browser'}
            >
              {sttSupported ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{isListening ? 'Listening' : 'Mic'}</span>
            </span>
            <span className="text-slate-200">|</span>
            <span 
              className={`flex items-center gap-1 ${ttsSupported ? (isSpeaking ? 'text-indigo-600 font-semibold' : 'text-slate-600') : 'text-slate-300'}`}
              title={ttsSupported ? (isSpeaking ? 'Voice playing' : 'Voice synthesis ready') : 'Voice synthesis not supported'}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{isSpeaking ? 'Speaking' : 'Voice'}</span>
            </span>
          </div>

          {/* Speaking Indicator & Stop Button */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors animate-pulse cursor-pointer"
              aria-label="Stop teacher speaking"
            >
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-rose-500 rounded-full sound-wave-bar"></span>
                <span className="w-1 h-3 bg-rose-500 rounded-full sound-wave-bar"></span>
                <span className="w-1 h-3 bg-rose-500 rounded-full sound-wave-bar"></span>
              </div>
              <span>Stop Voice</span>
            </button>
          )}

          {/* Auto Speak Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            type="button"
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              autoSpeak
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={autoSpeak ? 'Auto-read is ON (Teacher replies are spoken aloud)' : 'Auto-read is OFF (Click speaker on message to listen)'}
            aria-label={autoSpeak ? 'Turn off auto voice' : 'Turn on auto voice'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline">
              Auto-read: {autoSpeak ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Voice Speed Selector */}
          <div className="hidden lg:flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 text-xs bg-slate-50 text-slate-700">
            <span className="text-slate-400 font-medium">Speed:</span>
            <select
              value={speechRate}
              onChange={(e) => onChangeSpeechRate(parseFloat(e.target.value))}
              className="bg-transparent font-semibold focus:outline-hidden cursor-pointer"
              aria-label="Voice reading speed"
            >
              <option value="0.8">0.8x (Slow)</option>
              <option value="0.95">0.95x (Natural)</option>
              <option value="1.1">1.1x (Fast)</option>
            </select>
          </div>

          {/* Reset / New Chat */}
          <button
            onClick={onResetChat}
            type="button"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Start fresh conversation"
            aria-label="Restart conversation"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
