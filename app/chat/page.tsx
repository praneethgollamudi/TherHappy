'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Heart, RefreshCw, AlertCircle } from 'lucide-react';
import { getChatMessages, saveChatMessages, clearChatMessages } from '@/lib/storage';
import type { ChatMessage } from '@/lib/storage';

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed and don't know where to start.",
  "I've been feeling really anxious lately.",
  "I need help managing my stress.",
  "I'm struggling with negative thoughts about myself.",
  "I had a really hard day and need to talk.",
  "How can I improve my sleep when I'm anxious?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
        <Heart className="w-4 h-4 text-white" fill="white" />
      </div>
      <div className="bg-white border border-lavender-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="typing-dot w-2 h-2 bg-lavender-400 rounded-full animate-typing"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(getChatMessages());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streamingContent]);

  const handleSend = async (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setError(null);
    setStreamingContent('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamingContent(fullText);
                }
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
      };

      const withAssistant = [...updated, assistantMessage];
      setMessages(withAssistant);
      saveChatMessages(withAssistant);
      setStreamingContent('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearChatMessages();
    setMessages([]);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-screen md:h-screen overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-lavender-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-lavender-200/50">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Aria</h1>
            <p className="text-xs text-emerald-500 font-medium">Online — here for you</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 text-sm font-medium transition-colors p-2 rounded-lg hover:bg-rose-50"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-lavender-100 to-pink-100 rounded-full flex items-center justify-center mb-6 animate-float">
              <Heart className="w-10 h-10 text-lavender-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Hi, I'm Aria</h2>
            <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
              I'm here to listen without judgment and support you through whatever you're feeling. What's on your mind today?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-sm text-slate-600 bg-white hover:bg-lavender-50 border border-lavender-100 hover:border-lavender-300 rounded-xl px-4 py-3 transition-all hover:shadow-sm group"
                >
                  <span className="group-hover:text-lavender-700 transition-colors">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isEmpty && (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Heart className="w-4 h-4 text-white" fill="white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user'
                      ? 'message-bubble-user text-white rounded-br-sm'
                      : 'message-bubble-aria text-slate-700 rounded-bl-sm'
                    }`}
                >
                  {msg.content}
                  {msg.timestamp && (
                    <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-lavender-300' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && !streamingContent && <TypingIndicator />}

            {streamingContent && (
              <div className="flex items-end gap-2 animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <div className="message-bubble-aria max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-0.5 h-4 bg-lavender-400 ml-0.5 animate-pulse" />
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-4 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-700 text-sm font-medium">Couldn't reach Aria</p>
              <p className="text-rose-500 text-xs mt-0.5">{error}</p>
              {error.includes('ANTHROPIC_API_KEY') && (
                <p className="text-rose-500 text-xs mt-2">
                  Add your API key to <code className="bg-rose-100 px-1 rounded">.env.local</code>:
                  <br /><code className="bg-rose-100 px-1 rounded">ANTHROPIC_API_KEY=your_key_here</code>
                </p>
              )}
              <button
                onClick={() => setError(null)}
                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-medium mt-2"
              >
                <RefreshCw className="w-3 h-3" /> Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-lavender-100 px-4 md:px-8 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-lavender-50 border border-lavender-200 focus-within:border-lavender-400 focus-within:bg-white rounded-2xl transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none max-h-32 focus:outline-none"
              style={{ height: 'auto' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-gradient-to-br from-lavender-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-lavender-200/50 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-slate-300 text-[10px] mt-2">
          Aria is an AI companion — not a licensed therapist. In crisis? Call or text <strong>988</strong>.
        </p>
      </div>
    </div>
  );
}
