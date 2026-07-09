"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="w-full border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-4 rounded-lg flex items-start gap-3 shadow-sm select-none" role="alert">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
      <p className="text-sm font-medium leading-relaxed">
        <strong className="font-semibold">Medical Disclaimer:</strong> This analysis is for educational and informational purposes only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.
      </p>
    </div>
  );
}