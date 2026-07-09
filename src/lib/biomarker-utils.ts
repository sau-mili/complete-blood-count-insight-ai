// src/lib/biomarker-utils.ts
import { BiomarkerStatus } from '@prisma/client';
import { CBC_BIOMARKERS } from '@/config/biomarkers';

export function calculateBiomarkerStatus(
  key: string,
  value: number,
  biologicalSex: string,
  labLow?: number,
  labHigh?: number
): BiomarkerStatus {
  // 1. Determine reference boundaries: Prefer laboratory printed range, fall back to global dictionary
  let low = labLow;
  let high = labHigh;

  if (low === undefined || high === undefined) {
    const defaultMeta = CBC_BIOMARKERS[key];
    if (defaultMeta) {
      const sexKey = biologicalSex.toLowerCase() === 'female' ? 'female' : 'male';
      const range = defaultMeta.defaultRange[sexKey] || defaultMeta.defaultRange.general;
      if (low === undefined) low = range[0];
      if (high === undefined) high = range[1];
    }
  }

  // If we still have no boundaries, default to NORMAL
  if (low === undefined || high === undefined) {
    return 'NORMAL';
  }

  // 2. Calculate deviation percentage from normal range
  if (value >= low && value <= high) {
    return 'NORMAL';
  }

  const rangeSpan = high - low;

  if (value < low) {
    const deficit = low - value;
    const deficitRatio = deficit / (rangeSpan || low);
    
    if (deficitRatio > 0.35) return 'CRITICALLY_LOW';
    if (deficitRatio > 0.15) return 'LOW';
    return 'SLIGHTLY_LOW';
  } else {
    const excess = value - high;
    const excessRatio = excess / (rangeSpan || high);
    
    if (excessRatio > 0.35) return 'CRITICALLY_HIGH';
    if (excessRatio > 0.15) return 'HIGH';
    return 'SLIGHTLY_HIGH';
  }
}

// Add this updated function inside src/lib/biomarker-utils.ts

export function getStatusBadgeConfig(status: BiomarkerStatus) {
  switch (status) {
    case 'NORMAL':
      return { 
        label: 'Normal', 
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold',
        dotColor: 'bg-emerald-500'
      };
    case 'SLIGHTLY_LOW':
      return { 
        label: 'Slightly Low', 
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold',
        dotColor: 'bg-amber-500'
      };
    case 'LOW':
      return { 
        label: 'Low', 
        color: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/40 font-bold',
        dotColor: 'bg-orange-500'
      };
    case 'CRITICALLY_LOW':
      return { 
        label: 'Critically Low', 
        color: 'bg-red-600/15 text-red-700 dark:text-red-400 border-red-600/50 font-extrabold shadow-sm animate-pulse',
        dotColor: 'bg-red-600 animate-ping'
      };
    case 'SLIGHTLY_HIGH':
      return { 
        label: 'Slightly High', 
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold',
        dotColor: 'bg-amber-500'
      };
    case 'HIGH':
      return { 
        label: 'High', 
        color: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/40 font-bold',
        dotColor: 'bg-orange-500'
      };
    case 'CRITICALLY_HIGH':
      return { 
        label: 'Critically High', 
        color: 'bg-red-600/15 text-red-700 dark:text-red-400 border-red-600/50 font-extrabold shadow-sm animate-pulse',
        dotColor: 'bg-red-600 animate-ping'
      };
    default:
      return { 
        label: 'Unknown', 
        color: 'bg-slate-500/10 text-slate-500 border-slate-500/20 font-medium',
        dotColor: 'bg-slate-400'
      };
  }
}