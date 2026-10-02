import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 */
export function useSpeechRecognition({ onTranscriptChange } = {}) {
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPiece = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          currentInterim += transcriptPiece;
        }
      }

      if (currentInterim) {
        setInterimTranscript(currentInterim);
      }

      if (finalTranscript && onTranscriptChange) {
        onTranscriptChange(finalTranscript);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow microphone permissions in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech was detected. Please try speaking again.');
      } else if (event.error === 'network') {
        setError('Network issue occurred during speech recognition.');
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition notice: ${event.error}`);
      }
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignore abort errors on unmount
      }
    };
  }, [isSupported, onTranscriptChange]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or use keyboard input.');
      return;
    }
    setError(null);
    setInterimTranscript('');

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn('Recognition start exception:', err);
      try {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch {
        // Ignored
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    error,
    clearError: () => setError(null),
    interimTranscript,
    startListening,
    stopListening,
    toggleListening
  };
}
