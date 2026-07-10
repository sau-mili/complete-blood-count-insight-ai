// src/app/dashboard/reports/[id]/page.tsx
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { runReportExtraction } from '@/server/actions/extract';
import { BiomarkerTable } from '@/components/dashboard/biomarker-table';
import { AIAnalysisCard } from '@/components/dashboard/ai-analysis-card';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Clock, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, startExtraction] = useTransition();

  useEffect(() => {
    params.then((res) => setReportId(res.id));
  }, [params]);

  const fetchReportData = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json();
      setReport(data);

      if (data.biomarkers && data.biomarkers.length === 0) {
        handleTriggerExtraction(id);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReportData(reportId);
    }
  }, [reportId]);

  const handleTriggerExtraction = (idToExtract?: string) => {
    const targetId = idToExtract || reportId;
    if (!targetId) return;

    setError(null);
    startExtraction(async () => {
      const res = await runReportExtraction(targetId);
      if (res.error) {
        setError(res.error);
      } else {
        const refreshRes = await fetch(`/api/reports/${targetId}`);
        const refreshedData = await refreshRes.json();
        setReport(refreshedData);
        router.refresh();
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600 dark:text-rose-400" />
        <p className="text-sm font-medium text-slate-500">Loading laboratory records...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl inline-block">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Could not load report</h2>
        <p className="text-sm text-slate-500">{error || 'The requested document does not exist or you lack permission.'}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const hasBiomarkers = report.biomarkers && report.biomarkers.length > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {hasBiomarkers && !isExtracting && (
          <button
            onClick={() => handleTriggerExtraction()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Re-run AI extraction and clinical explanation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-Analyze Report
          </button>
        )}
      </div>

      {/* Report Header Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {report.panelType} Panel
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Uploaded on {new Date(report.uploadedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {report.fileDetails?.fileName || 'Laboratory Report'}
          </h1>
          <p className="text-xs text-slate-500">
            Status: <strong className="uppercase font-semibold text-slate-700 dark:text-slate-300">{report.overallStatus}</strong> • {report.abnormalCount} Abnormal metrics flagged
          </p>
        </div>

        <div className="flex items-center gap-3">
          {report.fileDetails?.fileUrl && (
            <a
              href={report.fileDetails.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-rose-500" />
              View Original File
            </a>
          )}
        </div>
      </div>

      {/* AI Extraction State Loader */}
      {isExtracting ? (
        <div className="p-12 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4 animate-pulse">
          <div className="mx-auto h-14 w-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Sparkles className="h-7 w-7 animate-spin" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">CBC Insights AI Analyzing Report...</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Extracting tabular values, checking medical reference boundaries, and writing plain-English clinical explanations.
            </p>
          </div>
        </div>
      ) : hasBiomarkers ? (
        <div className="space-y-8">
          {/* Render Extracted Biomarkers Table */}
          <BiomarkerTable biomarkers={report.biomarkers} />

          {/* Render Medical AI Analysis Interpretation Card */}
          <AIAnalysisCard analysis={report.aiAnalysis} overallStatus={report.overallStatus} />
        </div>
      ) : (
        <div className="p-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Ready for Analysis</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Click the button below to initiate the multimodal AI OCR pipeline and extract your complete blood count parameters.
            </p>
          </div>
          <button
            onClick={() => handleTriggerExtraction()}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Extract Biomarkers Now
          </button>
        </div>
      )}
    </div>
  );
}
