'use client';

import { useState, useEffect, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { Send, Trash2, Heart, RefreshCw, AlertCircle, KeyRound, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { getChatMessages, saveChatMessages, clearChatMessages } from '@/lib/storage';
import type { ChatMessage } from '@/lib/storage';

const SYSTEM_PROMPT = `You are Aria, a warm and compassionate mental wellness companion for TherHappy. You provide emotional support, a safe space to express feelings, and evidence-based coping strategies.

Core principles:
- Listen actively and with genuine empathy
- Validate emotions without judgment before offering suggestions
- Ask thoughtful, open-ended questions that help users explore their feelings
- Offer practical, evidence-based coping strategies when appropriate
- Be warm, human, and concise — never robotic or clinical

Important boundaries:
- You are NOT a replacement for professional therapy or medical care
- Always encourage professional help for serious, persistent, or complex issues
- If someone expresses thoughts of self-harm, suicide, or is in crisis, IMMEDIATELY respond with compassion AND provide crisis resources: National Suicide Prevention Lifeline (call or text 988), Crisis Text Line (text HOME to 741741). Stay present with them.

Your communication style:
- Conversational and warm, never clinical or overly formal
- Reflect back what you hear before offering suggestions: "It sounds like you're feeling..."
- Use "I" statements: "I hear that..." "I can understand why..."
- Keep responses focused — 2-4 short paragraphs is usually best
- End most responses with a gentle question to continue the conversation
- You are a supportive presence, not a fixer.`;

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed and don't know where to start.",
  "I've been feeling really anxious lately.",
  "I need help managing my stress.",
  "I'm struggling with negative thoughts about myself.",
  "I had a really hard day and need to talk.",
  "How can I improve my sleep when I'm anxious?",
];

const API_KEY_STORAGE = 'th_anthropicKey';

function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-gradient-to-br from-lavender-100 to-pink-100 rounded-full flex items-center justify-center mb-5 animate-float">
        <KeyRound className="w-7 h-7 text-lavender-500" />
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-2">Set up Aria</h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Aria is powered by Claude AI. Enter your own Anthropic API key to start chatting.
        Your key stays in your browser — it's never sent to any server.
      </p>

      <div className="w-full space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Anthropic API Key
          </label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-lavender-50 border border-lavender-200 focus:border-lavender-400 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-all pr-10"
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAgreed(a => !a)}
            className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer
              ${agreed ? 'bg-lavender-600 border-lavender-600' : 'border-slate-300 group-hover:border-lavender-400'}`}
          >
            {agreed && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-slate-500 text-sm leading-relaxed">
            I understand my API key is stored <strong>only in my browser</strong> and never shared with anyone.
          </span>
        </label>

        <button
          onClick={() => key && agreed && onSave(key.trim())}
          disabled={!key.trim() || !agreed}
          className="w-full bg-gradient-to-r from-lavender-600 to-purple-600 text-white font-semibold py-3 rounded-xl disabled:opacity-40 hover:opacity-90 transition-all shadow-md shadow-lavender-200/50"
        >
          Start chatting with Aria
        </button>

        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-lavender-600 hover:text-lavender-700 text-sm font-medium"
        >
          Get your free API key <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

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
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) setApiKey(stored);
    setMessages(getChatMessages());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streamingContent]);

  const handleSaveKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
  };

  const handleClearKey = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey(null);
  };

  const handleSend = async (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || loading || !apiKey) return;

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

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: updated.map(m => ({ role: m.role, content: m.content })),
      });

      let fullText = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
          setStreamingContent(fullText);
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
      setError(msg.includes('401') ? 'Invalid API key. Please check and try again.' : msg);
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

  if (!apiKey) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-lavender-100 px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Aria</h1>
            <p className="text-xs text-slate-400">Your wellness companion</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ApiKeySetup onSave={handleSaveKey} />
        </div>
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
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
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearKey}
            title="Change API key"
            className="p-2 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-all"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 text-sm font-medium transition-colors p-2 rounded-lg hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
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
