"use client";

import { useUIStore } from "@/lib/store/ui-store";
import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatSidebar() {
  const { isChatOpen, closeChat } = useUIStore();
  const account = useActiveAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for custom events to open chat
  useEffect(() => {
    const handleOpenChat = (e: CustomEvent) => {
      useUIStore.getState().openChat();
      if (e.detail?.message) {
        setInput(e.detail.message);
      }
    };

    window.addEventListener("openAIChat" as any, handleOpenChat as any);
    return () => {
      window.removeEventListener("openAIChat" as any, handleOpenChat as any);
    };
  }, []);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isChatOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let isFirstChunk = true;
      const assistantMsgId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

          if (isFirstChunk) {
            // Add message on first chunk
            setMessages(prev => [...prev, {
              id: assistantMsgId,
              role: 'assistant',
              content: assistantMessage,
            }]);
            isFirstChunk = false;
          } else {
            // Update existing message
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: assistantMessage }
                : m
            ));
          }
        }
      }
      
      // If no tokens received (e.g. empty stream/error), ensure we don't leave it hanging or show error
      if (assistantMessage === '') {
         throw new Error("No response received from AI agent.");
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Chat error:', err);
      // Remove any partial empty message if it exists (though logic above prevents adding it if empty)
      // Actually, if we added it and then failed mid-stream, we keep it. 
      // But if we never added it, we show error.
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsLoading(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]" 
        onClick={closeChat}
      />

      {/* Sidebar - Slide from right */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[var(--background)]/90 backdrop-blur-xl border-l border-[var(--border)] shadow-2xl z-[100] flex flex-col transition-transform duration-300 animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-lavender)] to-[var(--brand-lavender-deep)] flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">YieldX AI</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button 
            onClick={closeChat}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600">
              Error: {error}
            </div>
          )}

          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 opacity-70">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-lavender)] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[var(--brand-lavender-deep)]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">How can I help you?</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-2">
                  Ask me about APY rates, risk analysis, or get a personalized strategy recommendation.
                </p>
                {account && (
                  <p className="text-xs text-green-600 mt-2 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-full inline-block">
                    Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                )}
              </div>
              <div className="grid gap-2 w-full max-w-[300px]">
                <button 
                  onClick={() => setInput("What are the best stablecoin yields right now?")}
                  className="text-xs p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--brand-lavender)] transition-colors text-left"
                >
                  "Best stablecoin yields?"
                </button>
                <button 
                  onClick={() => setInput("Analyze my wallet risk")}
                  className="text-xs p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--brand-lavender)] transition-colors text-left"
                >
                  "Analyze my wallet risk"
                </button>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === "user" 
                  ? "bg-gray-200 dark:bg-gray-700" 
                  : "bg-[var(--accent-lavender)]"
              }`}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[var(--brand-lavender-deep)]" />}
              </div>
              
              <div className={`rounded-2xl p-3 max-w-[85%] text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--brand-lavender-deep)] text-white"
                  : "glass-card bg-white/50 dark:bg-black/20 text-foreground dark:text-gray-100"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-lavender)] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[var(--brand-lavender-deep)]" />
              </div>
              <div className="glass-card bg-white/50 dark:bg-black/20 rounded-2xl p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-lavender)]" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about yields, risk, or strategies..."
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-lavender)] shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--brand-lavender-deep)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-muted-foreground">
               AI can make mistakes. Check important info.
             </p>
          </div>
        </div>
      </div>
    </>
  );
}
