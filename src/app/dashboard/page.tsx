// src/app/dashboard/page.tsx
import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/server/actions/auth';
import { ReportTimeline } from '@/components/dashboard/report-timeline';
import { Upload, FileText, Activity, AlertCircle, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const reports = await prisma.report.findMany({
    where: {
      userId: user.id,
      isDeleted: false,
    },
    include: {
      fileDetails: true,
    },
    orderBy: {
      reportDate: 'desc',
    },
  });

  const totalReports = reports.length;
  const latestReport = reports[0];
  const latestStatus = latestReport?.overallStatus || '—';
  const totalAbnormalities = reports.reduce((sum, r) => sum + (r.abnormalCount || 0), 0);
  

  const isLatestCritical = latestStatus.includes('CRITICALLY');
  const isLatestNormal = latestStatus === 'NORMAL';
// Fix: We simply check if latestReport exists instead of comparing against '—'
  const isLatestWarning = Boolean(latestReport) && !isLatestCritical && !isLatestNormal;

  return (
    <div className="space-y-8">
      {/* Brand Palette Welcome Banner: Crimson to Maroon */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-crimson via-maroon to-rose rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-maroon">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hello, {user.name}! 👋</h2>
          <p className="text-beige text-sm font-medium">
            Biological Profile: <span className="font-bold underline decoration-rose-soft">{user.biologicalSex}</span> • Born: <span className="font-bold">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          {totalReports > 0 && (
            <Link
              href="/dashboard/trends"
              className="flex-1 md:flex-initial px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl border border-white/30 backdrop-blur-md transition-all flex items-center justify-center gap-2 text-sm shadow-xs"
            >
              <TrendingUp className="h-4 w-4" />
              View Trends
            </Link>
          )}

          <Link
            href="/dashboard/reports/upload"
            className="flex-1 md:flex-initial px-6 py-3 bg-card text-crimson hover:bg-background font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm shrink-0"
          >
            <Upload className="h-4 w-4" />
            Upload New CBC Report
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-foreground/70">
            <span className="text-sm font-bold">Total Tracked Reports</span>
            <FileText className="h-5 w-5 text-crimson" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalReports}</p>
          <p className="text-xs text-foreground/60 font-medium">Chronologically indexed in database</p>
        </div>

        {/* Dynamic Status Card: 3-Tier Visual Styling */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-2 transition-all ${
          isLatestCritical
            ? 'bg-red-50/90 border-red-500/60 text-red-950 shadow-md shadow-red-500/10'
            : isLatestNormal
            ? 'bg-emerald-50/80 border-emerald-500/50 text-emerald-950'
            : isLatestWarning
            ? 'bg-amber-50/90 border-amber-400/80 text-amber-950 shadow-sm shadow-amber-500/5'
            : 'bg-card border-border text-foreground'
        }`}>
          <div className="flex items-center justify-between font-bold text-sm opacity-85">
            <span>Latest Overall Status</span>
            {isLatestCritical ? (
              <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
            ) : isLatestNormal ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : isLatestWarning ? (
              <Activity className="h-5 w-5 text-amber-600" />
            ) : (
              <Activity className="h-5 w-5 text-foreground/40" />
            )}
          </div>
          <p className={`text-2xl font-black uppercase truncate ${
            isLatestCritical
              ? 'text-red-700'
              : isLatestNormal
              ? 'text-emerald-700'
              : isLatestWarning
              ? 'text-amber-700'
              : 'text-foreground'
          }`}>
            {latestStatus}
          </p>
          <p className="text-xs opacity-75 font-medium">From your most recent lab upload</p>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-foreground/70">
            <span className="text-sm font-bold">Cumulative Flagged Metrics</span>
            <AlertCircle className="h-5 w-5 text-crimson" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalAbnormalities}</p>
          <p className="text-xs text-foreground/60 font-medium">Historical abnormal readings monitored</p>
        </div>
      </div>

      {/* Render Chronological Timeline or Clean Empty State */}
      {totalReports > 0 ? (
        <ReportTimeline reports={reports as any} />
      ) : (
        <div className="border-2 border-dashed border-border bg-card/60 rounded-2xl p-12 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-card-muted flex items-center justify-center text-crimson shadow-inner">
            <Upload className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-foreground">No CBC reports found</h3>
            <p className="text-sm text-foreground/70 max-w-md mx-auto leading-relaxed">
              Get started by uploading a photo or PDF of your Complete Blood Count report. Our AI will extract parameters and build your timeline automatically.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/reports/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-crimson hover:bg-maroon text-white font-bold rounded-xl shadow-md shadow-crimson/20 transition-all text-sm"
            >
              <Upload className="h-4 w-4" />
              Upload First Report
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}