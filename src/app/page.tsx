// src/app/page.tsx
import Link from 'next/link';
import { ArrowRight, FileText, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center space-y-12 ">
      <div className="space-y-6 max-w-3xl">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20">
          Next-Generation Health AI
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Your Lifelong <span className="text-rose-600 dark:text-rose-400">Blood Health</span> Intelligence
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Upload any CBC lab report in seconds. Our AI extracts your biomarkers, tracks long-term historical trends, and translates complex medical jargon into plain, actionable insights.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl pt-8">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-red-500 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Instant OCR Parsing</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Drag and drop PDF or image reports from any diagnostic laboratory. Automated precision extraction.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Longitudinal Tracking</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Never lose a lab result again. Watch your hemoglobin, platelets, and white cells change over years.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Educational AI</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Powered by Google Gemini to give you patient-friendly summaries and follow-up guidance.
          </p>
        </div>
      </div>
    </div>
  );
}