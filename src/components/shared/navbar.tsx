// src/components/shared/navbar.tsx
'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '@/server/actions/auth';
import { Activity, LogOut, LayoutDashboard, Upload, TrendingUp, GitCompare, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: {
    name: string;
    email: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <nav className="w-full border-b  border-slate-200 dark:border-slate-800 bg-card/65 backdrop-blur-2xl dark:bg-slate-900 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-rose-600 dark:text-rose-600">
          <Activity className="h-6 w-6" />
          <span>CBC Insight AI</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === '/dashboard' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/reports/upload"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname?.includes('/upload') ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload CBC
              </Link>
              <Link
                href="/dashboard/trends"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname?.includes('/trends') ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Trends
              </Link>
              <Link
                href="/dashboard/compare"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname?.includes('/compare') ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GitCompare className="h-4 w-4" />
                Compare
              </Link>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isPending}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}