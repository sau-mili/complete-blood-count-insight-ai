// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { Navbar } from "@/components/shared/navbar";
import { getCurrentUser } from "@/server/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CBC Insight AI - Personal Blood Health Record",
  description: "AI-powered Complete Blood Count (CBC) analyzer and lifelong health trend tracker.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-background min-h-screen flex flex-col`}>
        <Navbar user={user} />
        <div className="w-full bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <DisclaimerBanner />
          </div>
        </div>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}