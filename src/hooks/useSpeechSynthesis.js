import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Clean text for SpeechSynthesis:
 * Strips markdown symbols, asterisks, brackets, and emojis so speech synthesis reads naturally.
 */
function cleanTextForSpeech(text = '') {
  return text
    .replace(/[*_#`~>]/g, '') // remove markdown markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace markdown links with text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
    .replace(/['"](.*?)['"]/g, '$1') // remove surrounding quotes
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

/**
 * Custom hook for Browser Web SpeechSynthesis API (TTS)
 */
export function useSpeechSynthesis() {
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(0.95); // 0.95x speed is optimal for language learners

  const utteranceRef = useRef(null);

  // Initialize and load voices
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Find best English voice
      const englishVoices = availableVoices.filter(v =>
        v.lang.toLowerCase().startsWith('en')
      );

      if (englishVoices.length > 0) {
        // Prefer natural voices if available
        const preferred =
          englishVoices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Samantha')) ||
          englishVoices.find(v => v.lang === 'en-US') ||
          englishVoices.find(v => v.lang.startsWith('en')) ||
          englishVoices[0];

        setSelectedVoice(preferred);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingId(null);
  }, [isSupported]);

  const speak = useCallback(
    (textToSpeak, id = 'default') => {
      if (!isSupported) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        return;
      }

      // If already speaking this message, toggle it off
      if (isSpeaking && speakingId === id) {
        stop();
        return;
      }

      // Cancel any ongoing speech
      stop();

      const cleaned = cleanTextForSpeech(textToSpeak);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utteranceRef.current = utterance;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingId(id);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, isSpeaking, speakingId, selectedVoice, rate, stop]
  );

  return {
    isSupported,
    isSpeaking,
    speakingId,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    speak,
    stop
  };
}
