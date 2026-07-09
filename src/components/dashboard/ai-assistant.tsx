// src/components/dashboard/ai-assistant.tsx
'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { sendChatMessage } from '@/server/actions/chat';
import ReactMarkdown from 'react-markdown';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Bot, 
  User, 
  HelpCircle, 
  Stethoscope, 
  FileText,
  AlertTriangle 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your **CBC Insight AI Assistant**. You can ask me to explain your latest blood report, define complex lab terminology, or suggest questions for your next doctor's visit. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isPending]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isPending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInput('');

    startTransition(async () => {
      // Prepare history format for server action
      const historyPayload = newHistory.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendChatMessage(query, historyPayload);
      
      const botReplyText = res.success 
        ? res.reply! 
        : `⚠️ **Error:** ${res.error || 'Could not connect to AI server.'}`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: botReplyText,
          timestamp: new Date(),
        },
      ]);
    });
  };

  const quickPrompts = [
    { label: 'Explain my latest report', icon: FileText, query: 'Please explain my latest recorded CBC blood report in simple terms.' },
    { label: 'What does low hemoglobin mean?', icon: HelpCircle, query: 'What does low hemoglobin mean, and what common symptoms or causes should I know about?' },
    { label: 'What should I ask my doctor?', icon: Stethoscope, query: 'Based on my blood reports, what are some smart, relevant questions I should ask my primary care physician?' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-2xl shadow-rose-500/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-rose-500/30"
        title="Open Medical AI Assistant"
        >
    {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
    </button>

      {/* Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[420px] h-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="h-5 w-5 text-rose-100" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">CBC Insight AI Assistant</h3>
                <p className="text-[11px] text-rose-100 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Powered by Gemini 2.5
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-rose-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.query)}
                  disabled={isPending}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose
                  -400 text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5 shadow-2xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all disabled:opacity-50 shrink-0"
                >
                  <Icon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>{prompt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser 
                      ? 'bg-rose-600 text-white font-bold text-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed font-medium ${
                    isUser 
                    ? 'bg-rose-700 text-white rounded-tr-none shadow-sm' 
                    : 'bg-[#F5EFE6] text-[#2C2523] rounded-tl-none border border-[#E5DFD5]'
                    }`}>
                {isUser ? (
                    msg.text
                    ) : (
                <ReactMarkdown
                    components={{
                    p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-extrabold text-[#2C2523]" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1 marker:text-rose-700" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1 marker:text-rose-700 font-bold" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed font-medium" {...props} />,
                    }}
                 >
                {msg.text}
                </ReactMarkdown>
                )}
                </div>
                </div>
              );
            })}

            {isPending && (
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  <span>Gemini AI is consulting your records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Medical Disclaimer Footer Note */}
          <div className="px-3 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 text-center shrink-0">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>AI provides educational information only. Consult a physician for medical advice.</span>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hemoglobin, platelets, reports..."
              disabled={isPending}
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}