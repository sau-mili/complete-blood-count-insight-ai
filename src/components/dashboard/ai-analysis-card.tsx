// src/components/dashboard/ai-analysis-card.tsx
'use client';

import React from 'react';
import { AIAnalysis } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import { Sparkles, ShieldAlert, Stethoscope, BookOpen, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AIAnalysisCardProps {
  analysis: AIAnalysis | null;
  overallStatus: string;
}

export function AIAnalysisCard({ analysis, overallStatus }: AIAnalysisCardProps) {
  if (!analysis) return null;

  const cautions = (analysis.cautions as Array<{ parameter: string; risk: string; message: string }>) || [];
  const followUps = (analysis.suggestedFollowUp as Array<string>) || [];

  return (
    <div className="space-y-6">
      {/* AI Summary Card: Crimson Brand Gradient */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-rose-700 via-red-700 to-rose-800 rounded-2xl text-white shadow-xl relative overflow-hidden border border-rose-800">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
            <Sparkles className="h-6 w-6 text-rose-100 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
              CBC Insights AI Clinical Interpretation
            </span>
            <h3 className="text-xl font-extrabold">Report Overview</h3>
            <p className="text-rose-100 text-sm md:text-base leading-relaxed font-medium">
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Educational Cautions */}
        <div className="p-6 bg-slate-900 border border-[#151c32] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#a75e55]">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h4 className="font-extrabold text-rose-500">Educational Cautions & Biomarker Flags</h4>
          </div>

          {cautions.length > 0 ? (
            <div className="space-y-3">
              {cautions.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-700/60 border border-rose-800 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-black text-red-700">
                    <span>{item.parameter}</span>
                    <span className="uppercase px-2 py-0.5 rounded bg-yellow-200 text-rose-700">{item.risk}</span>
                  </div>
                  <p className="text-xs text-[#fff6f4] leading-relaxed font-medium">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-xs font-bold">All monitored biomarkers are well within standard reference thresholds. No immediate clinical flags detected.</p>
            </div>
          )}
        </div>

        {/* Suggested Follow-up */}
        <div className="p-6 bg-[#f6e3e3] border border-[#E5DFD5] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#daa1a1]">
            <Stethoscope className="h-5 w-5 text-rose-700" />
            <h4 className="font-extrabold text-[#2C2523]">Suggested Medical Next Steps</h4>
          </div>

          <div className="space-y-2.5">
            {followUps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-[#2C2523] p-2.5 rounded-lg hover:bg-[#F5EFE6] transition-colors font-semibold">
                <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-800 font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-[11px] text-[#6A625E] flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Recommendations are conservative guidance. Always verify lab results with your primary physician.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Explanation Section with Custom ReactMarkdown Typography */}
      {analysis.patientExplanation && (
        <div className="p-6 md:p-8 bg-[#ffedc9df] border border-[#ffc561] rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#bc7904]">
            <BookOpen className="h-5 w-5 text-rose-700" />
            <div>
              <h4 className="font-extrabold text-[#2C2523] text-base">Patient-Friendly Biomarker Breakdown</h4>
              <p className="text-xs text-[#6A625E] font-medium">Understanding what your numbers mean in everyday language.</p>
            </div>
          </div>

          <div className="text-sm text-[#2C2523] leading-relaxed space-y-4">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-xl font-black text-rose-700 mt-6 mb-3 border-b border-[#E5DFD5] pb-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-extrabold text-rose-700 mt-5 mb-2.5" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-base font-extrabold text-rose-700 mt-4 mb-2" {...props} />,
                h4: ({ node, ...props }) => <h4 className="text-sm font-black text-[#2C2523] mt-3 mb-1.5 bg-[#fbe4c5] inline-block px-2.5 py-1 rounded-md border border-[#E5DFD5]" {...props} />,
                p: ({ node, ...props }) => <p className="mb-3 leading-relaxed font-medium text-[#2C2523]" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1.5 marker:text-rose-700 font-medium" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 marker:text-rose-700 marker:font-bold font-medium" {...props} />,
                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-extrabold text-[#2C2523] bg-rose-100 px-1 rounded" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-rose-700 pl-4 py-1 my-3 bg-[#fbe4c5] italic text-[#6A625E] rounded-r-lg" {...props} />,
              }}
            >
              {analysis.patientExplanation}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
