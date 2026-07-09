// src/server/actions/extract.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/server/actions/auth';
import { extractCBCFromDocument } from '@/lib/gemini';
import { calculateBiomarkerStatus } from '@/lib/biomarker-utils';
import { generateClinicalAnalysis } from '@/lib/ai-analysis';
import { revalidatePath } from 'next/cache';
import { BiomarkerStatus } from '@prisma/client';

export async function runReportExtraction(reportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized user access.' };

    // 1. Fetch Report and attached File details
    const report = await prisma.report.findUnique({
      where: { id: reportId, userId: user.id },
      include: { fileDetails: true, biomarkers: true },
    });

    if (!report || !report.fileDetails) {
      return { error: 'Report or associated file asset not found.' };
    }

    // Prevent re-extraction if biomarkers already exist
    if (report.biomarkers.length > 0) {
      return { success: true, message: 'Report already analyzed.' };
    }

    const { fileUrl, mimeType } = report.fileDetails;

    // 2. Retrieve file content as Base64 String
    let base64Data = '';
    if (fileUrl.startsWith('data:')) {
      base64Data = fileUrl;
    } else {
      const res = await fetch(fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
    }

    // 3. Execute Multimodal Vision AI Extraction
    const rawBiomarkers = await extractCBCFromDocument(base64Data, mimeType);
    if (!rawBiomarkers || rawBiomarkers.length === 0) {
      return { error: 'Could not detect readable CBC tables in this document.' };
    }

    // 4. Calculate Clinical Statuses
    let abnormalCount = 0;
    let worstStatus: BiomarkerStatus = 'NORMAL';

    const recordsToCreate = rawBiomarkers.map((item) => {
      const status = calculateBiomarkerStatus(
        item.key,
        item.value,
        user.biologicalSex,
        item.referenceLow,
        item.referenceHigh
      );

      if (status !== 'NORMAL') {
        abnormalCount++;
        if (status.includes('CRITICALLY')) worstStatus = status;
        else if (worstStatus === 'NORMAL' || worstStatus.includes('SLIGHTLY')) worstStatus = status;
      }

      return {
        reportId: report.id,
        key: item.key.toUpperCase(),
        displayName: item.displayName || item.key,
        value: item.value,
        unit: item.unit || '',
        referenceLow: item.referenceLow ?? null,
        referenceHigh: item.referenceHigh ?? null,
        status: status,
        confidenceScore: item.confidenceScore || 0.95,
      };
    });

    // 5. Generate AI Clinical Interpretation (Summary, Cautions, Follow-up)
    // We calculate age from DOB if available
    let userAge = 25;
    if (user.dateOfBirth) {
      const diffDays = Date.now() - new Date(user.dateOfBirth).getTime();
      userAge = Math.floor(diffDays / (1000 * 60 * 60 * 24 * 365.25));
    }

    const aiAnalysisData = await generateClinicalAnalysis(
      recordsToCreate as any,
      user.biologicalSex,
      userAge
    );

    // 6. Atomic Database Save (Biomarkers + AI Analysis + Report Status update)
    await prisma.$transaction(async (tx) => {
      await tx.biomarkerRecord.createMany({
        data: recordsToCreate,
        skipDuplicates: true,
      });

      await tx.aIAnalysis.upsert({
        where: { reportId: report.id },
        create: {
          reportId: report.id,
          summary: aiAnalysisData.summary,
          cautions: aiAnalysisData.cautions as any,
          suggestedFollowUp: aiAnalysisData.suggestedFollowUp as any,
          patientExplanation: aiAnalysisData.patientExplanation,
        },
        update: {
          summary: aiAnalysisData.summary,
          cautions: aiAnalysisData.cautions as any,
          suggestedFollowUp: aiAnalysisData.suggestedFollowUp as any,
          patientExplanation: aiAnalysisData.patientExplanation,
        },
      });

      await tx.report.update({
        where: { id: report.id },
        data: {
          abnormalCount: abnormalCount,
          overallStatus: worstStatus,
        },
      });
    });

    revalidatePath(`/dashboard/reports/${report.id}`);
    revalidatePath('/dashboard');

    return { success: true, count: recordsToCreate.length };
  } catch (error: any) {
    console.error('Extraction Action Error:', error);
    return { error: error.message || 'An error occurred while analyzing the report.' };
  }
}