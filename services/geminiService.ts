import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, InfographicData } from '../types';

// Constants
const GEMINI_MODEL = "gemini-3-flash-preview";
const createDeepDiveUrl = (query: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(query)}`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Response Interfaces
interface RawFlashcard {
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  deepDiveQuery?: string;
}

interface TranscriptionResponse {
  transcript: string;
  flashcards: RawFlashcard[];
}

interface InfographicResponse {
  infographic: InfographicData;
  flashcards: RawFlashcard[];
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

    const prompt = `Create a comprehensive set of flashcards based on these images. 
    Topic focus: ${topic}. 
    Each card should have a clear question (front) and a concise answer (back).
    Assign a category and an estimated difficulty (easy, medium, hard).
    Also provide a short 'deep dive' search query related to the concept.
    Return JSON only.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
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

    const rawCards: RawFlashcard[] = JSON.parse(response.text || '[]');

    return rawCards.map((c, index) => ({
      id: `gen-${Date.now()}-${index}`,
      front: c.front,
      back: c.back,
      category: c.category,
      difficulty: c.difficulty,
      deepDiveUrl: createDeepDiveUrl(c.deepDiveQuery || c.front)
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
      model: GEMINI_MODEL,
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

    const result: TranscriptionResponse = JSON.parse(response.text || '{}');

    const flashcards = (result.flashcards || []).map((c, index) => ({
        id: `audio-gen-${Date.now()}-${index}`,
        front: c.front,
        back: c.back,
        category: c.category || 'Audio Note',
        difficulty: c.difficulty || 'medium',
        deepDiveUrl: createDeepDiveUrl(c.front)
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

    const prompt = `Analyze the provided visual content (documents, diagrams, or slides). 
    1. Create a "Learning Infographic" structure: A structured summary divided into 3-5 distinct sections, each with a title, a brief content summary, a suggested emoji/icon, and a color theme.
    2. Generate a set of 5-10 high-quality flashcards based on the material.
    3. Return JSON.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          ...parts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            infographic: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      icon: { type: Type.STRING },
                      color: { type: Type.STRING, enum: ['blue', 'green', 'purple', 'orange', 'red'] }
                    }
                  }
                }
              },
              required: ['title', 'summary', 'sections']
            },
            flashcards: {
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
        }
      }
    });

    const result: InfographicResponse = JSON.parse(response.text || '{}');

    const flashcards = (result.flashcards || []).map((c, index) => ({
        id: `info-gen-${Date.now()}-${index}`,
        front: c.front,
        back: c.back,
        category: c.category,
        difficulty: c.difficulty,
        deepDiveUrl: createDeepDiveUrl(c.deepDiveQuery || c.front)
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