import { Flashcard, InfographicData } from '../types';

// Gemini is called through the server-side proxy in api/gemini.ts so the API
// key never reaches the browser bundle. Prompts, schemas and the model live there.
async function callGeminiProxy<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `AI proxy request failed (${res.status})`);
  }
  return data.result as T;
}

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateFlashcardsFromImages = async (
  files: File[], 
  topic: string
): Promise<Flashcard[]> => {
  try {
    const parts = await Promise.all(
      files.map(async (file) => ({
        inlineData: {
          data: await fileToGenerativePart(file),
          mimeType: file.type,
        },
      }))
    );

    const rawCards = await callGeminiProxy<any[]>({ op: 'generateFlashcards', files: parts.map((p) => p.inlineData), topic });
    
    return rawCards.map((c: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      front: c.front,
      back: c.back,
      category: c.category,
      difficulty: c.difficulty,
      deepDiveUrl: `https://www.google.com/search?q=${encodeURIComponent(c.deepDiveQuery || c.front)}`
    }));

  } catch (error) {
    console.error("Gemini Flashcard Generation Error:", error);
    throw error;
  }
};

export const transcribeAndSummarizeAudio = async (audioFile: File): Promise<{ text: string, flashcards: Flashcard[] }> => {
  try {
    const audioBase64 = await fileToGenerativePart(audioFile);

    const result = await callGeminiProxy<any>({
      op: 'transcribeAudio',
      audio: { data: audioBase64, mimeType: audioFile.type }, // e.g. audio/mp3, audio/wav
    });
    
    const flashcards = (result.flashcards || []).map((c: any, index: number) => ({
        id: `audio-gen-${Date.now()}-${index}`,
        front: c.front,
        back: c.back,
        category: c.category || 'Audio Note',
        difficulty: (c.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
        deepDiveUrl: `https://www.google.com/search?q=${encodeURIComponent(c.front)}`
    }));

    return {
      text: result.transcript || "No transcription available.",
      flashcards
    };

  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw error;
  }
};

export const generateInfographicAndCards = async (files: File[]): Promise<{ infographic: InfographicData, flashcards: Flashcard[] }> => {
  try {
    const parts = await Promise.all(
      files.map(async (file) => ({
        inlineData: {
          data: await fileToGenerativePart(file),
          mimeType: file.type,
        },
      }))
    );

    const result = await callGeminiProxy<any>({ op: 'generateInfographic', files: parts.map((p) => p.inlineData) });
    
    const flashcards = (result.flashcards || []).map((c: any, index: number) => ({
        id: `info-gen-${Date.now()}-${index}`,
        front: c.front,
        back: c.back,
        category: c.category,
        difficulty: c.difficulty,
        deepDiveUrl: `https://www.google.com/search?q=${encodeURIComponent(c.deepDiveQuery || c.front)}`
    }));

    return {
      infographic: result.infographic,
      flashcards
    };

  } catch (error) {
    console.error("Gemini Infographic Generation Error:", error);
    throw error;
  }
};