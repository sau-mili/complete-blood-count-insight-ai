// src/app/dashboard/trends/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHistoricalTrends, TrendDataPoint, ParameterMetadata } from '@/server/actions/trends';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { TrendingUp, Sparkles, ArrowLeft, Loader2, Calendar, AlertCircle } from 'lucide-react';

export default function TrendsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [parameters, setParameters] = useState<ParameterMetadata[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await getHistoricalTrends();
        if (res.error) {
          setError(res.error);
        } else if (res.success) {
          setData(res.data || []);
          setParameters(res.availableParameters || []);
          setInsights(res.insights || []);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading trend data');
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600 dark:text-rose-400" />
        <p className="text-sm font-medium text-slate-500">Aggregating chronological laboratory records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-rose-500" />
            <span>Lifelong Blood Health Trends</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Visualize parameter fluctuations over months and years. Select any biomarker below to analyze your historical trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Calendar className="h-4 w-4 text-rose-500 shrink-0" />
          <span>Tracking {data.length} Chronological Reports</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Algorithmic Longitudinal Health Insights Card */}
      {insights.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-transparent border border-rose-500/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <Sparkles className="h-5 w-5" />
            <span>Longitudinal Health Observations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-3.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed shadow-sm">
                • {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Interactive Component */}
      <TrendChart data={data} parameters={parameters} />
    </div>
  );
}