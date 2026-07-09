// src/server/actions/reports.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/server/actions/auth';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

// Allowed MIME types for CBC reports
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export async function uploadReportFile(formData: FormData) {
  try {
    // 1. Verify User Authentication
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'You must be logged in to upload medical reports.' };
    }

    // 2. Extract File from FormData
    const file = formData.get('file') as File | null;
    if (!file) {
      return { error: 'No file was provided for upload.' };
    }

    // 3. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return { error: 'File size exceeds the maximum limit of 10MB.' };
    }

    // 4. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        error: 'Invalid file format. Please upload a PDF, PNG, JPG, or JPEG file.',
      };
    }

    // 5. Secure File Storage Execution
    let fileUrl = '';
    let storageKey = '';

    // If Vercel Blob Token is present, use Cloud Storage; otherwise, use Local Dev Fallback
    if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'vercel_blob_rw_token_placeholder') {
      const blob = await put(`cbc-reports/${user.id}/${Date.now()}-${file.name}`, file, {
        access: 'public',
      });
      fileUrl = blob.url;
      storageKey = blob.pathname;
    } else {
      // Local Development Fallback: Convert to Base64 Data URI so local testing works seamlessly
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      fileUrl = `data:${file.type};base64,${base64String}`;
      storageKey = `local-dev-${Date.now()}-${file.name}`;
    }

    // 6. Create Database Records inside an Atomic Transaction
    const report = await prisma.$transaction(async (tx) => {
      // Create primary report entry
      const newReport = await tx.report.create({
        data: {
          userId: user.id,
          panelType: 'CBC',
          overallStatus: 'NORMAL',
          abnormalCount: 0,
        },
      });

      // Attach file metadata to the report
      await tx.reportFile.create({
        data: {
          reportId: newReport.id,
          storageKey: storageKey,
          fileUrl: fileUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      return newReport;
    });

    // 7. Refresh dashboard routes so new reports show up instantly
    revalidatePath('/dashboard');
    
    return { success: true, reportId: report.id };
  } catch (error) {
    console.error('Report upload failed:', error);
    return { error: 'An unexpected server error occurred during upload. Please try again.' };
  }
}