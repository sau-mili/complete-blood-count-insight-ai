// src/server/actions/trends.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/server/actions/auth';
import { CBC_BIOMARKERS } from '@/config/biomarkers';
import { revalidatePath } from 'next/cache';

export interface TrendDataPoint {
  reportId: string;
  date: string;
  rawDate: number;
  labName: string;
  [key: string]: string | number; // Holds dynamic parameter values like HGB: 13.5
}

export interface ParameterMetadata {
  key: string;
  name: string;
  unit: string;
  refLow?: number;
  refHigh?: number;
}

export async function getHistoricalTrends() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized user access.' };

    // 1. Fetch all non-deleted reports for the user, ordered from oldest to newest
    const reports = await prisma.report.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
      },
      include: {
        biomarkers: true,
        fileDetails: true,
      },
      orderBy: {
        reportDate: 'asc',
      },
    });

    if (!reports || reports.length === 0) {
      return { success: true, data: [], availableParameters: [], insights: [] };
    }

    // 2. Format data points for Recharts & track which parameters exist in this user's history
    const paramSet = new Set<string>();
    const paramMetaMap: Record<string, ParameterMetadata> = {};

    const trendData: TrendDataPoint[] = reports.map((report) => {
      const dateStr = new Date(report.reportDate || report.uploadedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const dataPoint: TrendDataPoint = {
        reportId: report.id,
        date: dateStr,
        rawDate: new Date(report.reportDate || report.uploadedAt).getTime(),
        labName: report.labName || report.fileDetails?.fileName || 'Lab Report',
      };

      report.biomarkers.forEach((bio) => {
        const stdKey = bio.key.toUpperCase();
        paramSet.add(stdKey);
        dataPoint[stdKey] = bio.value;

        // Save reference ranges for visual shaded boundaries on the chart
        if (!paramMetaMap[stdKey]) {
          const globalMeta = CBC_BIOMARKERS[stdKey];
          paramMetaMap[stdKey] = {
            key: stdKey,
            name: bio.displayName || globalMeta?.standardName || stdKey,
            unit: bio.unit || globalMeta?.unit || '',
            refLow: bio.referenceLow ?? (globalMeta?.defaultRange.general[0] || undefined),
            refHigh: bio.referenceHigh ?? (globalMeta?.defaultRange.general[1] || undefined),
          };
        }
      });

      return dataPoint;
    });

    const availableParameters = Array.from(paramSet).map((key) => paramMetaMap[key] || {
      key,
      name: key,
      unit: '',
    });

    // 3. Generate longitudinal health insights based on chronological trends
    const insights: string[] = [];
    
    if (trendData.length >= 2) {
      const firstReport = trendData[0];
      const latestReport = trendData[trendData.length - 1];

      // Check Hemoglobin trend
      if (firstReport['HGB'] && latestReport['HGB']) {
        const diff = Number(latestReport['HGB']) - Number(firstReport['HGB']);
        if (diff > 0.5) {
          insights.push(`Hemoglobin has steadily improved by +${diff.toFixed(1)} g/dL since your first recorded report.`);
        } else if (diff < -0.5) {
          insights.push(`Hemoglobin has decreased by ${Math.abs(diff).toFixed(1)} g/dL over your tracked history. Monitor for signs of fatigue.`);
        } else {
          insights.push(`Hemoglobin levels have remained consistently stable across your reports.`);
        }
      }

      // Check Platelet trend
      if (firstReport['PLT'] && latestReport['PLT']) {
        const diff = Number(latestReport['PLT']) - Number(firstReport['PLT']);
        if (Math.abs(diff) < 30000) {
          insights.push(`Platelet count has remained within a steady, predictable baseline.`);
        }
      }
    } else {
      insights.push(`Upload at least two CBC laboratory reports to generate multi-month historical trend comparison insights.`);
    }

    return {
      success: true,
      data: trendData,
      availableParameters,
      insights,
    };
  } catch (error: any) {
    console.error('Trend Aggregation Error:', error);
    return { error: 'Failed to aggregate historical medical trends.' };
  }
}

export async function deleteReport(reportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    // Verify ownership and permanently remove record
    await prisma.report.delete({
      where: {
        id: reportId,
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/trends');
    
    return { success: true };
  } catch (error) {
    console.error('Delete Report Error:', error);
    return { error: 'Failed to delete report.' };
  }
}