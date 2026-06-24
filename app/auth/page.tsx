'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Eye, EyeOff, AlertCircle } from 'lucide-react';

type Tab = 'signin' | 'signup';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // AuthProvider will handle the redirect
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg.includes('Invalid login') ? 'Incorrect email or password.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-lavender-200 rounded-full mix-blend-multiply opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-lavender-200/50 mb-4 animate-float">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">TherHappy</h1>
          <p className="text-slate-400 text-sm mt-1">Your mental wellness companion</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl shadow-xl shadow-lavender-100/40 p-8 border border-white/60">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all
                  ${tab === t ? 'bg-white text-lavender-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-lavender-50 border border-lavender-200 focus:border-lavender-400 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full bg-lavender-50 border border-lavender-200 focus:border-lavender-400 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-rose-600 text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 animate-fade-in">
                <p className="text-emerald-700 text-xs">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lavender-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md shadow-lavender-200/50 hover:opacity-90 disabled:opacity-50 transition-all mt-2"
            >
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-5 leading-relaxed">
            By continuing, you agree to keep your account secure.
            <br />
            Your data is encrypted and private.
          </p>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          In crisis? Call or text <strong className="text-slate-600">988</strong> anytime.
        </p>
      </div>
    </div>
  );
}
