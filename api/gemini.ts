// Vercel-style serverless function: POST /api/gemini
//
// Server-side proxy for the three Gemini operations the client uses. The key is
// read from GEMINI_API_KEY in the server environment and never sent to the
// browser. Model, prompts and response schemas are fixed here; the client only
// sends its uploaded media (base64) and, for flashcards, a topic string.
import { GoogleGenAI, Type } from '@google/genai';

const MODEL = 'gemini-3-flash-preview';
// Vercel caps function request bodies at 4.5 MB; stay under it.
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const MAX_FILES = 10;
const MAX_TOPIC_CHARS = 500;
const IMAGE_MIME = /^image\/[a-z0-9.+-]+$/i;
const AUDIO_MIME = /^audio\/[a-z0-9.+-]+$/i;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

type MediaPart = { data: string; mimeType: string };

class BadRequest extends Error {}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

async function readBodyLimited(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > limit) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseMedia(value: unknown, mime: RegExp): MediaPart {
  const part = value as Partial<MediaPart> | null;
  if (
    !part ||
    typeof part.data !== 'string' ||
    part.data.length === 0 ||
    !BASE64.test(part.data) ||
    typeof part.mimeType !== 'string' ||
    !mime.test(part.mimeType)
  ) {
    throw new BadRequest('Invalid media part');
  }
  return { data: part.data, mimeType: part.mimeType };
}

function parseMediaList(value: unknown, mime: RegExp): MediaPart[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_FILES) {
    throw new BadRequest(`files must contain 1-${MAX_FILES} items`);
  }
  return value.map((v) => parseMedia(v, mime));
}

const inline = (p: MediaPart) => ({ inlineData: { data: p.data, mimeType: p.mimeType } });

async function generateFlashcards(ai: GoogleGenAI, files: MediaPart[], topic: string) {
  const prompt = `Create a comprehensive set of flashcards based on these images. 
    Topic focus: ${topic}. 
    Each card should have a clear question (front) and a concise answer (back).
    Assign a category and an estimated difficulty (easy, medium, hard).
    Also provide a short 'deep dive' search query related to the concept.
    Return JSON only.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: { parts: [...files.map(inline), { text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
            deepDiveQuery: { type: Type.STRING },
          },
          required: ['front', 'back', 'category', 'difficulty'],
        },
      },
    },
  });
  return JSON.parse(response.text || '[]');
}

async function transcribeAudio(ai: GoogleGenAI, audio: MediaPart) {
  const prompt = `Transcribe this audio recording and then generate 5 key flashcards to help study the content.
    Return a JSON object with a 'transcript' string and a 'flashcards' array.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: { parts: [inline(audio), { text: prompt }] },
    config: {
      responseMimeType: 'application/json',
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
                difficulty: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || '{}');
}

async function generateInfographic(ai: GoogleGenAI, files: MediaPart[]) {
  const prompt = `Analyze the provided visual content (documents, diagrams, or slides). 
    1. Create a "Learning Infographic" structure: A structured summary divided into 3-5 distinct sections, each with a title, a brief content summary, a suggested emoji/icon, and a color theme.
    2. Generate a set of 5-10 high-quality flashcards based on the material.
    3. Return JSON.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: { parts: [...files.map(inline), { text: prompt }] },
    config: {
      responseMimeType: 'application/json',
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
                    color: { type: Type.STRING, enum: ['blue', 'green', 'purple', 'orange', 'red'] },
                  },
                },
              },
            },
            required: ['title', 'summary', 'sections'],
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
                deepDiveQuery: { type: Type.STRING },
              },
              required: ['front', 'back', 'category', 'difficulty'],
            },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || '{}');
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('api/gemini: GEMINI_API_KEY is not set in the server environment');
    return json(500, { error: 'AI service is not configured' });
  }

  const raw = await readBodyLimited(request, MAX_BODY_BYTES);
  if (raw === null) return json(413, { error: 'Request too large' });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) ?? {};
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  let run: (ai: GoogleGenAI) => Promise<unknown>;
  try {
    switch (body.op) {
      case 'generateFlashcards': {
        const files = parseMediaList(body.files, IMAGE_MIME);
        const topic = typeof body.topic === 'string' ? body.topic.slice(0, MAX_TOPIC_CHARS) : '';
        run = (ai) => generateFlashcards(ai, files, topic);
        break;
      }
      case 'transcribeAudio': {
        const audio = parseMedia(body.audio, AUDIO_MIME);
        run = (ai) => transcribeAudio(ai, audio);
        break;
      }
      case 'generateInfographic': {
        const files = parseMediaList(body.files, IMAGE_MIME);
        run = (ai) => generateInfographic(ai, files);
        break;
      }
      default:
        return json(400, { error: 'Unknown operation' });
    }
  } catch (error) {
    if (error instanceof BadRequest) return json(400, { error: error.message });
    throw error;
  }

  try {
    const result = await run(new GoogleGenAI({ apiKey }));
    return json(200, { result });
  } catch (error) {
    console.error('api/gemini: upstream error', error);
    return json(502, { error: 'AI request failed' });
  }
}
