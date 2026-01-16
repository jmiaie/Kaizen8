import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const prompt = `Create a comprehensive set of flashcards based on these images. 
    Topic focus: ${topic}. 
    Each card should have a clear question (front) and a concise answer (back).
    Assign a category and an estimated difficulty (easy, medium, hard).
    Also provide a short 'deep dive' search query related to the concept.
    Return JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          ...parts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
              deepDiveQuery: { type: Type.STRING }
            },
            required: ['front', 'back', 'category', 'difficulty']
          }
        }
      }
    });

    const rawCards = JSON.parse(response.text || '[]');
    
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

    const prompt = `Transcribe this audio recording and then generate 5 key flashcards to help study the content.
    Return a JSON object with a 'transcript' string and a 'flashcards' array.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioFile.type, // e.g. audio/mp3, audio/wav
              data: audioBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
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