// src/lib/ai-analysis.ts
import { GoogleGenAI } from '@google/genai';
import { BiomarkerRecord } from '@prisma/client';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AIAnalysisResult {
  summary: string;
  cautions: Array<{
    parameter: string;
    risk: string;
    message: string;
  }>;
  suggestedFollowUp: Array<string>;
  patientExplanation: string;
}

export async function generateClinicalAnalysis(
  biomarkers: BiomarkerRecord[],
  biologicalSex: string,
  age?: number
): Promise<AIAnalysisResult> {
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('GEMINI_API_KEY is not configured properly.');
  }

  // Separate normal from abnormal biomarkers to give the AI context
  const abnormalBiomarkers = biomarkers.filter((b) => b.status !== 'NORMAL');
  const allDataSummary = biomarkers.map((b) => `${b.displayName} (${b.key}): ${b.value} ${b.unit} [Status: ${b.status}]`).join('\n');

  const systemPrompt = `
You are an empathetic, highly knowledgeable medical AI assistant designed to explain Complete Blood Count (CBC) laboratory results to patients and caregivers.
Your goal is to provide clear, educational, and non-diagnostic insights based on the provided CBC data.

PATIENT PROFILE:
Sex: ${biologicalSex}
${age ? `Age: ${age} years old` : ''}

EXTRACTED CBC BIOMARKERS:
${allDataSummary}

INSTRUCTIONS:
You must return a strictly formatted JSON object matching this schema exactly:
{
  "summary": "A 2-3 sentence patient-friendly summary of the overall blood health report.",
  "cautions": [
    {
      "parameter": "Hemoglobin",
      "risk": "Possible Anemia / Iron Deficiency",
      "message": "Low hemoglobin may cause fatigue, weakness, or pale skin. Consult a healthcare professional to check your iron and vitamin levels."
    }
  ],
  "suggestedFollowUp": [
    "Consult a General Physician for clinical evaluation.",
    "Consider an Iron Profile (Serum Iron, Ferritin) if hemoglobin remains low."
  ],
  "patientExplanation": "A detailed, structured plain-English markdown explanation of any abnormal parameters found. For each abnormal biomarker, explain: (1) What it measures, (2) Why it might be abnormal, (3) Common symptoms, and (4) General lifestyle considerations. If all parameters are NORMAL, write a comforting congratulatory explanation on maintaining healthy blood biomarkers."
}

STRICT MEDICAL GUARDRAILS:
1. DO NOT diagnose any disease (e.g., never say "You have leukemia" or "You have clinical anemia"). Instead, use phrases like "May indicate", "Could be associated with", or "Is commonly observed in".
2. Keep all follow-up recommendations conservative, educational, and focused on consulting qualified doctors (General Physicians, Hematologists).
3. Do not include markdown code blocks (like \`\`\`json) or any extra text outside the JSON object.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
      ],
      config: {
        temperature: 0.2, // Slightly creative for empathy, but strict on facts
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error: any) {
    console.error('AI Clinical Analysis Failed:', error);
    throw new Error(error.message || 'Failed to generate AI medical interpretation.');
  }
}