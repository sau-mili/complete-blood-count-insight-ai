// src/server/actions/chat.ts
'use server';

import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/server/actions/auth';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function sendChatMessage(message: string, chatHistory: Array<{ role: 'user' | 'model'; text: string }>) {
  try {
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return { error: 'GEMINI_API_KEY is not configured.' };
    }

    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    // Fetch user's most recent lab report to provide personalized context
    const latestReport = await prisma.report.findFirst({
      where: { userId: user.id, isDeleted: false },
      include: { biomarkers: true, aiAnalysis: true },
      orderBy: { reportDate: 'desc' },
    });

    let contextString = 'No previous lab reports recorded for this patient.';
    if (latestReport && latestReport.biomarkers.length > 0) {
      const bioList = latestReport.biomarkers
        .map((b) => `${b.displayName} (${b.key}): ${b.value} ${b.unit} [Status: ${b.status}]`)
        .join('\n');
      
      contextString = `
LATEST RECORDED REPORT DATE: ${new Date(latestReport.reportDate).toLocaleDateString()}
OVERALL PANEL STATUS: ${latestReport.overallStatus}
EXTRACTED BIOMARKERS:
${bioList}
${latestReport.aiAnalysis ? `AI SUMMARY: ${latestReport.aiAnalysis.summary}` : ''}
`;
    }

    const systemPrompt = `
You are "CBC Insight AI Assistant", an empathetic, expert medical education assistant specializing in Complete Blood Count (CBC) analysis.
Your purpose is to answer patient questions, explain medical terminology (like MCV, MCH, Hemoglobin), interpret biomarker trends, and help users prepare questions for their doctors.

PATIENT CONTEXT:
Name: ${user.name}
Sex: ${user.biologicalSex}
${contextString}

STRICT OPERATIONAL GUARDRAILS:
1. DO NOT DIAGNOSE DISEASES. Never state that the patient has anemia, infection, cancer, or any clinical disorder. Instead, explain what abnormal values "may indicate", "are commonly associated with", or "warrant checking with a physician".
2. Keep explanations clear, reassuring, and easy to understand for laypeople. Use formatting (bullet points, bold text) for readability.
3. Every response MUST end with or naturally incorporate a reminder to consult a qualified healthcare professional or general physician for clinical evaluation.
4. If the user asks "Explain my report", synthesize their latest recorded biomarkers above into a reassuring, plain-English overview.
`;

    // Format previous chat history for Gemini multi-turn generation
    const contents = chatHistory.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // Append the current message
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${message}` }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents as any,
      config: {
        temperature: 0.3,
      },
    });

    const replyText = response.text || "I'm having trouble processing your question right now. Please consult your physician for medical advice.";
    
    return { success: true, reply: replyText };
  } catch (error: any) {
    console.error('Chat AI Error:', error);
    return { error: error.message || 'Failed to communicate with AI Assistant.' };
  }
}