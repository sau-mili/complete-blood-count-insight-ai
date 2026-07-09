// src/components/dashboard/trend-chart.tsx
'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  Legend,
} from 'recharts';
import { TrendDataPoint, ParameterMetadata } from '@/server/actions/trends';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface TrendChartProps {
  data: TrendDataPoint[];
  parameters: ParameterMetadata[];
}

export function TrendChart({ data, parameters }: TrendChartProps) {
  const [selectedParamKey, setSelectedParamKey] = useState<string>(
    parameters[0]?.key || 'HGB'
  );

  if (!data || data.length === 0) {
    return (
      <div className="p-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center space-y-3">
        <Activity className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold">No historical data available</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Upload and extract at least one laboratory report to visualize your lifelong biomarker trend lines.
        </p>
      </div>
    );
  }

  const currentMeta = parameters.find((p) => p.key === selectedParamKey) || parameters[0];
  const refLow = currentMeta?.refLow;
  const refHigh = currentMeta?.refHigh;

  // Calculate dynamic Y-axis min/max to keep chart looking proportional
  const values = data
    .map((d) => Number(d[selectedParamKey]))
    .filter((v) => !isNaN(v) && v !== 0);
  
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  
  const yDomainMin = refLow ? Math.min(minVal, refLow) * 0.85 : minVal * 0.85;
  const yDomainMax = refHigh ? Math.max(maxVal, refHigh) * 1.15 : maxVal * 1.15;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Chart Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-500" />
            <span>Biomarker Longitudinal Trajectory</span>
          </h3>
          <p className="text-xs text-slate-500">
            Shaded green area indicates the standard healthy reference boundary for this test.
          </p>
        </div>

        {/* Parameter Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Parameter:</label>
          <select
            value={selectedParamKey}
            onChange={(e) => setSelectedParamKey(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer shadow-sm"
          >
            {parameters.map((param) => (
              <option key={param.key} value={param.key}>
                {param.name} ({param.key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-[380px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#475569', opacity: 0.5 }}
            />
            
            <YAxis
              domain={[Math.floor(yDomainMin), Math.ceil(yDomainMax)]}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#475569', opacity: 0.5 }}
              unit={currentMeta?.unit ? ` ${currentMeta.unit}` : ''}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fa003f',
                fontSize: '0.875rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(value: any) => [`${value} ${currentMeta?.unit}`, currentMeta?.name]}
              labelFormatter={(label) => `Report Date: ${label}`}
            />

            <Legend verticalAlign="top" height={36} iconType="circle" />

            {/* Shaded Normal Reference Range Area */}
            {refLow !== undefined && refHigh !== undefined && (
              <ReferenceArea
                y1={refLow}
                y2={refHigh}
                fill="#10b981"
                fillOpacity={0.12}
                stroke="#10b981"
                strokeOpacity={0.3}
                strokeDasharray="4 4"
                name={`Normal Range (${refLow} - ${refHigh} ${currentMeta?.unit})`}
              />
            )}

            {/* Biomarker Trend Line */}
            <Line
              type="monotone"
              dataKey={selectedParamKey}
              name={currentMeta?.name || selectedParamKey}
              stroke="#fa003f"
              strokeWidth={3}
              dot={{ r: 6, fill: '#fa003f', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 8, fill: '#fa003f', stroke: '#ffffff', strokeWidth: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Range Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>
            Standard reference boundary for <strong className="text-slate-700 dark:text-slate-300">{currentMeta?.name}</strong>: {refLow ?? 'N/A'} – {refHigh ?? 'N/A'} {currentMeta?.unit}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Points plotted correspond to verified extraction dates.</span>
        </div>
      </div>
    </div>
  );
}