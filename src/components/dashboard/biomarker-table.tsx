// src/components/dashboard/biomarker-table.tsx
'use client';

import React from 'react';
import { BiomarkerRecord } from '@prisma/client';
import { getStatusBadgeConfig } from '@/lib/biomarker-utils';
import { CheckCircle2, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react';

interface BiomarkerTableProps {
  biomarkers: BiomarkerRecord[];
}

export function BiomarkerTable({ biomarkers }: BiomarkerTableProps) {
  if (!biomarkers || biomarkers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extracted CBC Biomarkers</h3>
          <p className="text-xs text-slate-500">Automated AI Key-Value extraction with reference range evaluation.</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
          {biomarkers.length} Parameters Detected
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-6 font-semibold">Test Name</th>
              <th className="py-3 px-6 font-semibold">Patient Value</th>
              <th className="py-3 px-6 font-semibold">Unit</th>
              <th className="py-3 px-6 font-semibold">Reference Range</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {biomarkers.map((item) => {
              const badge = getStatusBadgeConfig(item.status);
              const isAbnormal = item.status !== 'NORMAL';

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isAbnormal 
                      ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06] dark:bg-amber-500/[0.02]' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    {isAbnormal ? (
                      item.status.includes('CRITICALLY') ? (
                        <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      )
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    <span>{item.displayName}</span>
                    <span className="text-xs text-slate-400">({item.key})</span>
                  </td>

                  <td className={`py-4 px-6 font-bold ${isAbnormal ? 'text-slate-900 dark:text-white underline decoration-wavy decoration-amber-500/50' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.value}
                  </td>

                  <td className="py-4 px-6 text-slate-500 text-xs">
                    {item.unit || '—'}
                  </td>

                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                    {item.referenceLow !== null && item.referenceHigh !== null
                      ? `${item.referenceLow} - ${item.referenceHigh}`
                      : item.referenceHigh !== null
                      ? `< ${item.referenceHigh}`
                      : 'Standard Range Applied'}
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right text-xs font-mono text-slate-400">
                    {(item.confidenceScore * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}