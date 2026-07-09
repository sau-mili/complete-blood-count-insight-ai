// src/lib/gemini.ts
import { GoogleGenAI } from '@google/genai';
import { CBC_BIOMARKERS } from '@/config/biomarkers';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface ExtractedBiomarkerRaw {
  key: string;
  displayName: string;
  value: number;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
  confidenceScore: number;
}

export async function extractCBCFromDocument(
  fileBase64: string,
  mimeType: string
): Promise<ExtractedBiomarkerRaw[]> {
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('Missing GEMINI_API_KEY in your .env file. Please check your .env file and restart your server.');
  }

  const cleanBase64 = fileBase64.includes('base64,')
    ? fileBase64.split('base64,')[1]
    : fileBase64;

  const supportedKeys = Object.keys(CBC_BIOMARKERS).join(', ');

  const systemPrompt = `
You are an expert medical data extraction AI. Examine the attached Complete Blood Count (CBC) laboratory report.
Extract all visible CBC biomarkers into a strict JSON array.
Map items to standard keys: [${supportedKeys}].

Return ONLY a valid JSON array of objects following this schema:
[
  {
    "key": "HGB",
    "displayName": "Hemoglobin",
    "value": 13.5,
    "unit": "g/dL",
    "referenceLow": 12.0,
    "referenceHigh": 16.0,
    "confidenceScore": 0.99
  }
]
Do not return markdown formatting blocks or backticks.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '[]';
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error: any) {
    console.error('Vision OCR Extraction Failed:', error);
    throw new Error(error.message || JSON.stringify(error) || 'Google Gemini parsing exception');
  }
}