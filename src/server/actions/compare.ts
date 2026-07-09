// src/server/actions/compare.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/server/actions/auth';
import { CBC_BIOMARKERS } from '@/config/biomarkers';
import { BiomarkerStatus } from '@prisma/client';

export interface ComparisonRow {
  key: string;
  displayName: string;
  unit: string;
  baseValue: number | null;
  baseStatus: BiomarkerStatus | null;
  targetValue: number | null;
  targetStatus: BiomarkerStatus | null;
  diff: number | null;
  percentageChange: number | null;
  trend: 'UP' | 'DOWN' | 'STABLE' | 'N/A';
}

export async function getReportsForComparison() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized user access.' };

    const reports = await prisma.report.findMany({
      where: { userId: user.id, isDeleted: false },
      select: {
        id: true,
        reportDate: true,
        uploadedAt: true,
        labName: true,
        overallStatus: true,
        abnormalCount: true,
        fileDetails: { select: { fileName: true } },
      },
      orderBy: { reportDate: 'desc' },
    });

    return { success: true, reports };
  } catch (error) {
    console.error('Error fetching reports for comparison:', error);
    return { error: 'Failed to retrieve laboratory reports.' };
  }
}

export async function compareTwoReports(baseReportId: string, targetReportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized user access.' };

    const [baseReport, targetReport] = await Promise.all([
      prisma.report.findUnique({
        where: { id: baseReportId, userId: user.id },
        include: { biomarkers: true, fileDetails: true },
      }),
      prisma.report.findUnique({
        where: { id: targetReportId, userId: user.id },
        include: { biomarkers: true, fileDetails: true },
      }),
    ]);

    if (!baseReport || !targetReport) {
      return { error: 'One or both selected reports could not be found.' };
    }

    // Map biomarkers by standard key
    const baseMap = new Map(baseReport.biomarkers.map((b) => [b.key.toUpperCase(), b]));
    const targetMap = new Map(targetReport.biomarkers.map((b) => [b.key.toUpperCase(), b]));

    // Combine all unique parameter keys from both reports
    const allKeys = Array.from(new Set([...baseMap.keys(), ...targetMap.keys()])).sort();

    const rows: ComparisonRow[] = allKeys.map((key) => {
      const baseBio = baseMap.get(key);
      const targetBio = targetMap.get(key);

      const baseVal = baseBio?.value ?? null;
      const targetVal = targetBio?.value ?? null;

      let diff: number | null = null;
      let percentageChange: number | null = null;
      let trend: 'UP' | 'DOWN' | 'STABLE' | 'N/A' = 'N/A';

      if (baseVal !== null && targetVal !== null) {
        diff = Number((targetVal - baseVal).toFixed(2));
        
        if (baseVal !== 0) {
          percentageChange = Number(((diff / baseVal) * 100).toFixed(1));
        }

        if (Math.abs(diff) < 0.05) {
          trend = 'STABLE';
        } else if (diff > 0) {
          trend = 'UP';
        } else {
          trend = 'DOWN';
        }
      }

      const defaultMeta = CBC_BIOMARKERS[key];
      const displayName = targetBio?.displayName || baseBio?.displayName || defaultMeta?.standardName || key;
      const unit = targetBio?.unit || baseBio?.unit || defaultMeta?.unit || '';

      return {
        key,
        displayName,
        unit,
        baseValue: baseVal,
        baseStatus: baseBio?.status ?? null,
        targetValue: targetVal,
        targetStatus: targetBio?.status ?? null,
        diff,
        percentageChange,
        trend,
      };
    });

    return {
      success: true,
      baseReportMeta: {
        id: baseReport.id,
        name: baseReport.labName || baseReport.fileDetails?.fileName || 'Baseline Report',
        date: baseReport.reportDate || baseReport.uploadedAt,
        status: baseReport.overallStatus,
      },
      targetReportMeta: {
        id: targetReport.id,
        name: targetReport.labName || targetReport.fileDetails?.fileName || 'Current Report',
        date: targetReport.reportDate || targetReport.uploadedAt,
        status: targetReport.overallStatus,
      },
      comparison: rows,
    };
  } catch (error) {
    console.error('Comparison calculation failed:', error);
    return { error: 'Failed to generate report comparison.' };
  }
}