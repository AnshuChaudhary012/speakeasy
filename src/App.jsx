import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import QuickPrompts from './components/QuickPrompts';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import { CONVERSATION_MODES } from './constants/modes';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

export default function App() {
  const [currentModeId, setCurrentModeId] = useState('casual');
  const currentMode = CONVERSATION_MODES.find(m => m.id === currentModeId) || CONVERSATION_MODES[0];

  // Conversation history
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome-1',
      role: 'teacher',
      text: currentMode.initialTeacherMessage,
      reply: currentMode.initialTeacherMessage,
      fullTeacherText: currentMode.initialTeacherMessage,
      speechText: currentMode.initialTeacherMessage,
      hasMistake: false,
      timestamp: Date.now()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSentText, setLastSentText] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Text-To-Speech hook
  const {
    isSupported: ttsSupported,
    isSpeaking,
    speakingId,
    rate: speechRate,
    setRate: setSpeechRate,
    speak,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  // Speech-To-Text callback: puts recognized text into the input so the user can review and edit before sending
  const handleTranscript = useCallback((recognizedText) => {
    setInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return recognizedText;
      return `${trimmed} ${recognizedText}`;
    });
  }, []);

  // Speech-To-Text hook
  const {
    isListening,
    isSupported: sttSupported,
    error: sttError,
    interimTranscript,
    stopListening,
    toggleListening
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscript
  });

  // Handle switching conversation mode
  const handleSelectMode = (modeId) => {
    if (modeId === currentModeId) return;
    stopSpeaking();
    stopListening();
    setCurrentModeId(modeId);
    setError(null);

    const newMode = CONVERSATION_MODES.find(m => m.id === modeId) || CONVERSATION_MODES[0];
    setMessages([
      {
        id: `welcome-${modeId}-${Date.now()}`,
        role: 'teacher',
        text: newMode.initialTeacherMessage,
        reply: newMode.initialTeacherMessage,
        fullTeacherText: newMode.initialTeacherMessage,
        speechText: newMode.initialTeacherMessage,
        hasMistake: false,
        timestamp: Date.now()
      }
    ]);
  };

  // Reset current conversation
  const handleResetChat = () => {
    stopSpeaking();
    stopListening();
    setError(null);
    setInput('');
    setMessages([
      {
        id: `welcome-${currentModeId}-${Date.now()}`,
        role: 'teacher',
        text: currentMode.initialTeacherMessage,
        reply: currentMode.initialTeacherMessage,
        fullTeacherText: currentMode.initialTeacherMessage,
        speechText: currentMode.initialTeacherMessage,
        hasMistake: false,
        timestamp: Date.now()
      }
    ]);
  };

  // Send message to Gemini English Teacher
  const handleSendMessage = async (textToSend) => {
    const text = textToSend?.trim();
    if (!text || isLoading) return;

    // Stop microphone if currently listening
    if (isListening) {
      stopListening();
    }

    // Stop ongoing speech
    if (isSpeaking) {
      stopSpeaking();
    }

    const userMessageId = `user-${Date.now()}`;
    const userMessageObj = {
      id: userMessageId,
      role: 'user',
      text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setLastSentText(text);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: currentModeId,
          messages: newMessages.map(m => ({
            role: m.role,
            text: m.text || m.reply || m.fullTeacherText || ''
          })),
          userMessage: text
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.isDemoMode) {
        setIsDemoMode(true);
      }

      const teacherMessageId = `teacher-${Date.now()}`;
      const teacherMessageObj = {
        id: teacherMessageId,
        role: 'teacher',
        hasMistake: Boolean(data.hasMistake),
        feedback: data.feedback || '',
        correctedSentence: data.correctedSentence || '',
        explanation: data.explanation || '',
        reply: data.reply || data.fullTeacherText || '',
        fullTeacherText: data.fullTeacherText || data.reply || '',
        speechText: data.speechText || data.reply || data.fullTeacherText || '',
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, teacherMessageObj]);

      // If autoSpeak is enabled, read the response out loud
      if (autoSpeak && ttsSupported) {
        const textToSpeak = teacherMessageObj.speechText || teacherMessageObj.reply;
        speak(textToSpeak, teacherMessageId);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Unable to connect to SpeakEasy Teacher. Please check your connection or API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onResetChat={handleResetChat}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        speechRate={speechRate}
        onChangeSpeechRate={setSpeechRate}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
        ttsSupported={ttsSupported}
        sttSupported={sttSupported}
        isDemoMode={isDemoMode}
      />

      {/* Mode Selector */}
      <ModeSelector
        currentModeId={currentModeId}
        onSelectMode={handleSelectMode}
      />

      {/* Demo Mode Notice Banner if API Key is not yet configured */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-300/60 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
          <p>
            <span className="font-bold">Educational Preview Active:</span> Add your free Gemini API key in <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px]">.env</code> or Vercel Environment Variables (<code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px]">GEMINI_API_KEY</code>) for unlimited live AI conversations!
          </p>
        </div>
      )}

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        error={error}
        onRetry={lastSentText ? () => handleSendMessage(lastSentText) : null}
        onSpeak={speak}
        speakingId={speakingId}
        onStopSpeaking={stopSpeaking}
      />

      {/* Contextual Quick Starters */}
      <QuickPrompts
        prompts={currentMode.starterPrompts}
        onSelectPrompt={(prompt) => {
          setInput(prompt);
        }}
      />

      {/* Chat Input & Mic Bar */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isListening={isListening}
        onToggleListening={toggleListening}
        sttSupported={sttSupported}
        sttError={sttError}
        interimTranscript={interimTranscript}
      />
    </div>
  );
}
