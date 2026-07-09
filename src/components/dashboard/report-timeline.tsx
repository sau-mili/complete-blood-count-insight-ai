// src/components/dashboard/report-timeline.tsx
'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteReport } from '@/server/actions/trends';
import { 
  Calendar, 
  FileText, 
  ArrowRight, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Loader2 
} from 'lucide-react';

interface ReportCardItem {
  id: string;
  labName?: string | null;
  reportDate: Date | string;
  uploadedAt: Date | string;
  panelType: string;
  overallStatus: string;
  abnormalCount: number;
  fileDetails?: {
    fileUrl: string;
    fileName: string;
  } | null;
}

interface ReportTimelineProps {
  reports: ReportCardItem[];
}

export function ReportTimeline({ reports }: ReportTimelineProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to permanently delete this report from your timeline? This action cannot be undone.')) {
      return;
    }

    startTransition(async () => {
      await deleteReport(reportId);
      router.refresh();
    });
  };

  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chronological Health Timeline</h3>
          <p className="text-xs text-slate-500">Your lifelong repository of diagnostic blood reports sorted by test date.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          {reports.length} Reports Saved
        </span>
      </div>

      <div className="relative border-l-2 border-rose-500/30 ml-4 pl-6 space-y-8 my-6">
        {reports.map((report) => {
          const isNormal = report.overallStatus === 'NORMAL';
          const isCritical = report.overallStatus.includes('CRITICALLY');
          const dateFormatted = new Date(report.reportDate || report.uploadedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div key={report.id} className="relative group">
              {/* Timeline Dot: Green for Normal, Pulsing Red for Critical */}
              <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 transition-transform group-hover:scale-125 ${
                isNormal 
                  ? 'bg-emerald-500' 
                  : isCritical 
                  ? 'bg-red-600 animate-pulse shadow-md shadow-red-500/50' 
                  : 'bg-amber-500'
              }`} />

              {/* Report Timeline Card: High-contrast red styling for critical cases */}
              <div className={`p-6 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4 border ${
                isCritical
                  ? 'bg-red-500/[0.04] dark:bg-red-950/20 border-red-500/50 dark:border-red-500/40'
                  : isNormal
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-amber-500/[0.02] dark:bg-amber-950/10 border-amber-500/30'
              }`}>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
                        {report.panelType}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {dateFormatted}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {report.labName || report.fileDetails?.fileName || 'Diagnostic Laboratory Report'}
                    </h4>
                  </div>

                  {/* Status Badge: Distinct Red for Critical, Emerald Green for Normal */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      isNormal 
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' 
                        : isCritical
                        ? 'bg-red-600/20 text-red-700 dark:text-red-400 border-red-600/50 shadow-xs animate-pulse'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    }`}>
                      {isNormal ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : isCritical ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>{report.overallStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Abnormality Counter Note */}
                <div className={`text-xs p-3 rounded-xl border flex items-center justify-between ${
                  isCritical
                    ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300 font-medium'
                    : isNormal
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium'
                }`}>
                  <span>
                    Biomarker Flags: <strong className={isNormal ? 'text-emerald-600 dark:text-emerald-400 font-bold' : isCritical ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-amber-600 dark:text-amber-400 font-bold'}>{report.abnormalCount} abnormal parameters</strong> detected out of total extracted panel.
                  </span>
                  <span className="text-[11px] opacity-70">Permanently Archived</span>
                </div>

                {/* Action Buttons Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {report.fileDetails?.fileUrl && (
                      <a
                        href={report.fileDetails.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-xs font-medium"
                        title="Download/View Original Document"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Original File</span>
                      </a>
                    )}

                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      disabled={isDeleting}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition-colors inline-flex items-center gap-1 text-xs font-medium disabled:opacity-50"
                      title="Permanently Delete Report"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm shadow-rose-500/25"
                  >
                    <span>View AI Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}