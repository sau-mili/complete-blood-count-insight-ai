// src/app/dashboard/compare/page.tsx
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { getReportsForComparison, compareTwoReports, ComparisonRow } from '@/server/actions/compare';
import { 
  GitCompare, 
  ArrowLeft, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ComparePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [baseId, setBaseId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [baseMeta, setBaseMeta] = useState<any>(null);
  const [targetMeta, setTargetMeta] = useState<any>(null);
  const [isComparing, startComparing] = useTransition();

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await getReportsForComparison();
        if (res.error) {
          setError(res.error);
        } else if (res.success && res.reports) {
          setReports(res.reports);
          if (res.reports.length >= 2) {
            // Default: Compare second newest (Baseline) vs newest (Target)
            setBaseId(res.reports[1].id);
            setTargetId(res.reports[0].id);
          } else if (res.reports.length === 1) {
            setBaseId(res.reports[0].id);
            setTargetId(res.reports[0].id);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  useEffect(() => {
    if (baseId && targetId) {
      startComparing(async () => {
        setError(null);
        const res = await compareTwoReports(baseId, targetId);
        if (res.error) {
          setError(res.error);
        } else if (res.success && res.comparison) {
          setComparisonData(res.comparison);
          setBaseMeta(res.baseReportMeta);
          setTargetMeta(res.targetReportMeta);
        }
      });
    }
  }, [baseId, targetId]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-slate-400 text-xs">—</span>;
    if (status === 'NORMAL') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> Normal</span>;
    }
    if (status.includes('CRITICALLY')) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse"><ShieldAlert className="h-3 w-3" /> Critical</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><AlertTriangle className="h-3 w-3" /> Flagged</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600 dark:text-rose-400" />
        <p className="text-sm font-medium text-slate-500">Loading historical reports for comparison...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <GitCompare className="h-8 w-8 text-rose-500" />
          <span>Side-by-Side Report Comparison</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select any two laboratory reports to evaluate longitudinal variance, percentage shifts, and biomarker trajectories.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {reports.length < 2 ? (
        <div className="p-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center space-y-4">
          <GitCompare className="h-12 w-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Comparison requires at least two reports</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You currently have {reports.length} report uploaded. Upload another laboratory panel to unlock longitudinal side-by-side comparison analytics.
            </p>
          </div>
          <Link
            href="/dashboard/reports/upload"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition-all text-sm"
          >
            Upload Second Report
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dropdown Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            
            {/* Baseline Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Baseline Report (Previous)
              </label>
              <select
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer shadow-sm"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {new Date(r.reportDate || r.uploadedAt).toLocaleDateString()} — {r.labName || r.fileDetails?.fileName || 'Report'} ({r.overallStatus})
                  </option>
                ))}
              </select>
              {baseMeta && (
                <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                  <Calendar className="h-3.5 w-3.5 text-rose-500" />
                  <span>Selected Date: {new Date(baseMeta.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Target Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                2. Target Report (Current / Newest)
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full p-3 bg-rose-500/5 border border-rose-500/30 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer shadow-sm"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {new Date(r.reportDate || r.uploadedAt).toLocaleDateString()} — {r.labName || r.fileDetails?.fileName || 'Report'} ({r.overallStatus})
                  </option>
                ))}
              </select>
              {targetMeta && (
                <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                  <Calendar className="h-3.5 w-3.5 text-rose-500" />
                  <span>Selected Date: {new Date(targetMeta.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

          </div>

          {/* Comparison Table */}
          {isComparing ? (
            <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600 dark:text-rose-400 mx-auto" />
              <p className="text-sm font-medium text-slate-500">Calculating delta variances and percentage trends...</p>
            </div>
          ) : comparisonData.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-4 px-6 font-semibold">Test Name</th>
                      <th className="py-4 px-6 font-semibold">Baseline Value</th>
                      <th className="py-4 px-6 font-semibold">Target Value</th>
                      <th className="py-4 px-6 font-semibold">Variance (Δ)</th>
                      <th className="py-4 px-6 font-semibold">% Change</th>
                      <th className="py-4 px-6 font-semibold text-right">Trend Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                    {comparisonData.map((row) => {
                      const isAbnormalTarget = row.targetStatus && row.targetStatus !== 'NORMAL';

                      return (
                        <tr 
                          key={row.key}
                          className={`transition-colors ${
                            isAbnormalTarget 
                              ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06] dark:bg-amber-500/[0.02]' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 dark:text-white">{row.displayName}</div>
                            <div className="text-xs text-slate-400">({row.key}) • Unit: {row.unit || 'N/A'}</div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {row.baseValue !== null ? `${row.baseValue} ${row.unit}` : '—'}
                            </div>
                            <div className="mt-1">{getStatusBadge(row.baseStatus)}</div>
                          </td>

                          <td className="py-4 px-6">
                            <div className={`font-bold ${isAbnormalTarget ? 'text-slate-900 dark:text-white underline decoration-wavy decoration-amber-500/50' : 'text-slate-700 dark:text-slate-300'}`}>
                              {row.targetValue !== null ? `${row.targetValue} ${row.unit}` : '—'}
                            </div>
                            <div className="mt-1">{getStatusBadge(row.targetStatus)}</div>
                          </td>

                          <td className="py-4 px-6 font-mono text-xs">
                            {row.diff !== null ? (
                              <span className={row.diff > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : row.diff < 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500'}>
                                {row.diff > 0 ? `+${row.diff}` : row.diff} {row.unit}
                              </span>
                            ) : '—'}
                          </td>

                          <td className="py-4 px-6 font-mono text-xs font-semibold">
                            {row.percentageChange !== null ? (
                              <span className={row.percentageChange > 0 ? 'text-rose-600 dark:text-rose-400' : row.percentageChange < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}>
                                {row.percentageChange > 0 ? `+${row.percentageChange}%` : `${row.percentageChange}%`}
                              </span>
                            ) : '—'}
                          </td>

                          <td className="py-4 px-6 text-right">
                            {row.trend === 'UP' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                <TrendingUp className="h-3.5 w-3.5" /> Increasing
                              </span>
                            ) : row.trend === 'DOWN' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <TrendingDown className="h-3.5 w-3.5" /> Decreasing
                              </span>
                            ) : row.trend === 'STABLE' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                <Minus className="h-3.5 w-3.5" /> Stable
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}