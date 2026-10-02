import { GoogleGenAI, Type } from '@google/genai';

/**
 * SpeakEasy Serverless API Handler
 * Handles English conversation coaching, error detection, corrections, and chat flow.
 * Keeps GEMINI_API_KEY secure on the server side.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // body remains string or empty
      }
    }
    const { messages = [], mode = 'casual', userMessage = '' } = body || {};

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      res.status(400).json({ error: 'userMessage is required.' });
      return;
    }

    const trimmedUserMessage = userMessage.trim();

    // Check for GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Return a smart preview response so the user can test the UI immediately
      const mockResult = generateMockTeacherResponse(trimmedUserMessage, mode);
      res.status(200).json({
        ...mockResult,
        isDemoMode: true,
        note: 'GEMINI_API_KEY is not set. Running in educational preview mode. Add your GEMINI_API_KEY to .env or Vercel environment variables to unlock real-time Gemini AI.'
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Mode-specific coaching contexts
    const modeInstructions = {
      casual: 'Casual chit-chat. Be friendly, relaxed, and conversational like a close peer who happens to be an English teacher.',
      interview: 'Mock job interview. Help the student sound professional, articulate, and confident using workplace English.',
      daily: 'Everyday functional English for practical situations (ordering coffee, asking directions, shopping, commuting).',
      travel: 'Travel English. Practice scenarios at airports, hotels, restaurants, transit, and sightseeing abroad.',
      grammar: 'Grammar practice and drills. Pay intense attention to verb tenses, articles, prepositions, and sentence structure.'
    };

    const modePrompt = modeInstructions[mode] || modeInstructions.casual;

    const systemInstruction = `You are "SpeakEasy Teacher", a friendly, patient, and highly effective English conversation coach.
The student is practicing spoken and written English with you.
Current Practice Mode: ${mode.toUpperCase()} (${modePrompt}).

Your core task for EVERY student message:
1. UNDERSTAND: Grasp the student's intended meaning, even if there are severe grammar mistakes or awkward phrasing.
2. DETECT & ASSESS:
   - Check if the user's sentence contains grammatical mistakes, improper verb tenses, missing/incorrect articles, wrong prepositions, or unnatural phrasing.
   - If there is a mistake:
     * hasMistake: true
     * feedback: Warm encouragement like "Almost!", "Good try! A natural way to say this is:", or "Close! Here is a natural correction:"
     * correctedSentence: The natural, grammatically correct English version.
     * explanation: A brief, crystal-clear explanation (1-2 sentences) of why the correction is needed (e.g., "We use 'went' because 'yesterday' tells us the action happened in the past.")
   - If the user's sentence is already natural and correct:
     * hasMistake: false
     * feedback: "Spot on! That's phrased very naturally." or "Great sentence!"
     * correctedSentence: ""
     * explanation: ""
3. CONTINUE CONVERSATION:
   - reply: Formulate a warm, natural conversational reply that acknowledges what they said and asks a relevant follow-up question to keep the conversation flowing. Never stop at just correcting the user!
4. FULL TEACHER TEXT:
   - fullTeacherText: Combine feedback, correction, explanation, and conversational reply in a friendly format.
   Example format when there is a mistake:
   Almost! A natural correction is:
   'I went to the market yesterday.'

   We use 'went' because 'yesterday' tells us the action happened in the past.

   What did you buy?

   Example format when already correct:
   Spot on! That's phrased very naturally.

   I love Italian food too! What's your favorite pasta dish to make?
5. SPEECH TEXT:
   - speechText: Plain natural text suitable for browser text-to-speech (TTS). No asterisks, markdown, quotation marks around whole sentences, or emojis so the voice synthesis reads smoothly.`;

    // Format chat history for context
    const contents = [];
    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages.slice(-10)) {
        if (msg.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: msg.text || msg.content || '' }]
          });
        } else if (msg.role === 'teacher' || msg.role === 'model') {
          contents.push({
            role: 'model',
            parts: [{ text: msg.reply || msg.fullTeacherText || msg.text || '' }]
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: trimmedUserMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasMistake: {
              type: Type.BOOLEAN,
              description: 'Whether the user message had grammar or phrasing mistakes'
            },
            feedback: {
              type: Type.STRING,
              description: 'Short encouragement or praise phrase'
            },
            correctedSentence: {
              type: Type.STRING,
              description: 'The natural, corrected version of the user sentence (empty if hasMistake is false)'
            },
            explanation: {
              type: Type.STRING,
              description: 'Brief 1-2 sentence explanation of the grammar rule or reason for correction (empty if hasMistake is false)'
            },
            reply: {
              type: Type.STRING,
              description: 'Conversational response continuing the dialogue with a follow-up question'
            },
            fullTeacherText: {
              type: Type.STRING,
              description: 'Complete friendly teacher response formatted with line breaks'
            },
            speechText: {
              type: Type.STRING,
              description: 'Natural spoken text without markdown or symbols, ideal for Web SpeechSynthesis'
            }
          },
          required: ['hasMistake', 'feedback', 'reply', 'fullTeacherText', 'speechText']
        }
      }
    });

    const responseText = response.text?.trim() || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback if model wraps in code fences
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      try {
        parsedResult = JSON.parse(cleanJson);
      } catch {
        parsedResult = {
          hasMistake: false,
          feedback: '',
          correctedSentence: '',
          explanation: '',
          reply: responseText,
          fullTeacherText: responseText,
          speechText: responseText
        };
      }
    }

    res.status(200).json(parsedResult);
  } catch (error) {
    console.error('API Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to process AI response',
      details: error.message || String(error)
    });
  }
}

/**
 * Smart mock generator for local testing / demo mode before API key is provided
 */
function generateMockTeacherResponse(userMessage, mode) {
  const lower = userMessage.toLowerCase();

  // Test case 1: user sent "I am go to market yesterday"
  if (lower.includes('i am go to') || lower.includes('go to market yesterday')) {
    return {
      hasMistake: true,
      feedback: 'Almost! A natural correction is:',
      correctedSentence: 'I went to the market yesterday.',
      explanation: "We use 'went' because 'yesterday' tells us the action happened in the past.",
      reply: 'What did you buy at the market?',
      fullTeacherText: "Almost! A natural correction is:\n'I went to the market yesterday.'\n\nWe use 'went' because 'yesterday' tells us the action happened in the past.\n\nWhat did you buy?",
      speechText: "Almost! A natural correction is: I went to the market yesterday. We use went because yesterday tells us the action happened in the past. What did you buy?"
    };
  }

  // Test case 2: user sent third person singular mistake like "she don't" or "he don't"
  if (lower.includes("she don't") || lower.includes("he don't") || lower.includes("it don't")) {
    const fixed = userMessage.replace(/she don't/gi, "she doesn't").replace(/he don't/gi, "he doesn't");
    return {
      hasMistake: true,
      feedback: 'Good try! Here is a more natural version:',
      correctedSentence: fixed,
      explanation: "For third-person singular (he, she, it), we use 'doesn't' instead of 'don't'.",
      reply: 'That makes total sense! Could you tell me more about that?',
      fullTeacherText: `Good try! Here is a more natural version:\n'${fixed}'\n\nFor third-person singular (he, she, it), we use 'doesn't' instead of 'don't'.\n\nCould you tell me more about that?`,
      speechText: `Good try! Here is a more natural version: ${fixed}. For third person singular, we use doesn't instead of don't. Could you tell me more about that?`
    };
  }

  // General fallback
  const isGreeting = lower.includes('hi') || lower.includes('hello') || lower.includes('hey');
  if (isGreeting) {
    return {
      hasMistake: false,
      feedback: 'Great greeting!',
      correctedSentence: '',
      explanation: '',
      reply: `Hello there! I'm your SpeakEasy English teacher in ${mode} mode. How are you doing today? You can try asking me anything or practicing a sentence!`,
      fullTeacherText: `Hello there! I'm your SpeakEasy English teacher in ${mode} mode. How are you doing today? You can try asking me anything or practicing a sentence!`,
      speechText: `Hello there! I am your SpeakEasy English teacher. How are you doing today? You can try asking me anything or practicing a sentence!`
    };
  }

  return {
    hasMistake: false,
    feedback: "Spot on! That's phrased very naturally.",
    correctedSentence: '',
    explanation: '',
    reply: `That sounds interesting! Practicing English is all about keeping the flow going. What else would you like to discuss in ${mode} mode?`,
    fullTeacherText: `Spot on! That's phrased very naturally.\n\nThat sounds interesting! Practicing English is all about keeping the flow going. What else would you like to discuss in ${mode} mode?`,
    speechText: `Spot on! That is phrased very naturally. That sounds interesting! Practicing English is all about keeping the flow going. What else would you like to discuss?`
  };
}
