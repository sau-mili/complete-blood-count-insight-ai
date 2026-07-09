// src/app/dashboard/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/actions/auth';
import { AIAssistant } from '@/components/dashboard/ai-assistant';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Double-check auth server-side as defense-in-depth
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your blood health records, view trends, and upload new laboratory reports.
          </p>
        </div>
      </div>
      {children}

      {/* Floating AI Medical Chatbot Assistant Widget */}
      <AIAssistant />
    </div>
  );
}