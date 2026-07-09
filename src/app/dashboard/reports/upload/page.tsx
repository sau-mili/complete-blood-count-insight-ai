// src/app/dashboard/reports/upload/page.tsx
'use client';

import React, { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadReportFile } from '@/server/actions/reports';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ShieldCheck,
  FileImage
} from 'lucide-react';

export default function UploadReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // File validation constants
  const MAX_SIZE_MB = 10;
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload a PDF, PNG, or JPG report.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File exceeds the ${MAX_SIZE_MB}MB size limit.`);
      return;
    }

    setSelectedFile(file);
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // File Input Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submission Handler
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    startTransition(async () => {
      const response = await uploadReportFile(formData);

      if (response.error) {
        setErrorMessage(response.error);
      } else if (response.success && response.reportId) {
        setUploadSuccess(true);
        // Navigate to the individual report view after 1.5 seconds
        setTimeout(() => {
          router.push(`/dashboard/reports/${response.reportId}`);
        }, 1500);
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Upload CBC Lab Report
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm">
          Upload your Complete Blood Count report as a PDF document or a clear photograph. Our AI will automatically extract and analyze your biomarkers.
        </p>
      </div>

      {uploadSuccess ? (
        <div className="p-8 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Report Uploaded Successfully!</h3>
            <p className="text-sm text-slate-500">Securing file and initializing AI biomarker extraction pipeline...</p>
          </div>
          <div className="flex justify-center pt-2">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600 dark:text-rose-400" />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold block">Upload Error</span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Drag and Drop Zone */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                isDragging
                  ? 'border-rose-500 bg-rose-500/5 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  Drag and drop your report here, or <span className="text-rose-600 dark:text-rose-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500">
                  Supports PDF, PNG, JPG, or JPEG (Max file size: 10MB)
                </p>
              </div>
            </div>
          ) : (
            /* Selected File Preview Card */
            <div className="p-5 border border-rose-500/30 bg-rose-500/5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  {selectedFile.type === 'application/pdf' ? (
                    <FileText className="h-6 w-6" />
                  ) : (
                    <FileImage className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)} • Ready for extraction
                  </p>
                </div>
              </div>

              {!isPending && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Privacy Cautions */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-200 block">Encrypted Medical Storage</span>
              Your documents are processed via secure serverless pipelines and stored with user-isolated privacy restrictions. No third party has access to your medical identity.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-rose-500/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading & Securing...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Analyze Report
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}