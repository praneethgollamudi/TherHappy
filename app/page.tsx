'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, BookOpen, Wind, BarChart2, Flame, LifeBuoy, ChevronRight, Sparkles } from 'lucide-react';
import { saveMood, getTodayMood, getStreakDays, getJournalEntries } from '@/lib/storage';
import { getGreeting, getTodayAffirmation, getMoodConfig, MOOD_CONFIG } from '@/lib/utils';
import type { JournalEntry } from '@/lib/storage';

const FEATURE_CARDS = [
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'Talk with Aria',
    subtitle: 'AI-powered compassionate support',
    gradient: 'from-lavender-500 to-purple-600',
    bg: 'from-lavender-50 to-purple-50',
    iconBg: 'bg-lavender-500',
  },
  {
    href: '/journal',
    icon: BookOpen,
    title: 'Journal',
    subtitle: 'Write freely, think clearly',
    gradient: 'from-rose-400 to-pink-500',
    bg: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-400',
  },
  {
    href: '/breathe',
    icon: Wind,
    title: 'Breathe',
    subtitle: 'Guided breathing exercises',
    gradient: 'from-sage-400 to-teal-500',
    bg: 'from-sage-50 to-teal-50',
    iconBg: 'bg-sage-500',
  },
  {
    href: '/insights',
    icon: BarChart2,
    title: 'Insights',
    subtitle: 'Track your mood journey',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-400',
  },
];

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [affirmation, setAffirmation] = useState('');
  const [streak, setStreak] = useState(0);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [savedMood, setSavedMood] = useState(false);

  useEffect(() => {
    setAffirmation(getTodayAffirmation());
    setStreak(getStreakDays());
    setRecentEntries(getJournalEntries().slice(0, 2));
    const todayMood = getTodayMood();
    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setSavedMood(true);
    }
  }, []);

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
    saveMood(value);
    setSavedMood(true);
    setStreak(getStreakDays());
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-600 via-purple-600 to-pink-500 opacity-95" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        <div className="relative px-6 pt-12 pb-8 md:pt-16">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lavender-200 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-white text-sm font-semibold">{streak} day streak</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            {greeting} 👋
          </h1>
          <p className="text-lavender-200 text-lg">
            {savedMood ? "You've checked in today. Keep it up!" : "How are you feeling right now?"}
          </p>
        </div>

        {/* Mood Selector - floating */}
        <div className="relative mx-4 md:mx-8 -mb-8 z-10">
          <div className="glass rounded-2xl p-5 shadow-xl shadow-lavender-200/40">
            <p className="text-center text-slate-500 text-sm font-medium mb-4">
              {savedMood ? 'Update your mood' : 'How are you feeling?'}
            </p>
            <div className="flex justify-around">
              {MOOD_CONFIG.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 mood-btn group
                    ${selectedMood === mood.value
                      ? `${mood.bg} border-2 ${mood.border} scale-110 shadow-md`
                      : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                >
                  <span className="text-2xl md:text-3xl mood-emoji transition-transform duration-200">
                    {mood.emoji}
                  </span>
                  <span className={`text-[10px] font-medium ${selectedMood === mood.value ? mood.text : 'text-slate-400'}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="px-4 md:px-8 pt-16 pb-8 space-y-8">

        {/* Feature Cards Grid */}
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Your Wellness Toolkit</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {FEATURE_CARDS.map(({ href, icon: Icon, title, subtitle, bg, iconBg }) => (
              <Link
                key={href}
                href={href}
                className={`feature-card bg-gradient-to-br ${bg} rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md group`}
              >
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-slate-700 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Today's Affirmation */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lavender-600 via-purple-600 to-pink-500 p-6 shadow-lg shadow-lavender-200/50">
            <div className="absolute top-0 right-0 opacity-10 text-9xl font-bold text-white select-none pointer-events-none">✨</div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lavender-200 text-xs font-semibold uppercase tracking-wider mb-1.5">Today's Affirmation</p>
                <p className="text-white text-lg font-medium leading-snug">"{affirmation}"</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Journal Entries */}
        {recentEntries.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Recent Journal Entries</h2>
              <Link href="/journal" className="flex items-center gap-1 text-lavender-600 text-sm font-medium hover:text-lavender-700">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const moodCfg = entry.mood ? getMoodConfig(entry.mood) : null;
                return (
                  <Link
                    key={entry.id}
                    href={`/journal?id=${entry.id}`}
                    className="flex items-start gap-3 glass rounded-xl p-4 hover:shadow-md transition-all group"
                  >
                    {moodCfg && (
                      <span className="text-2xl flex-shrink-0">{moodCfg.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm group-hover:text-lavender-700 transition-colors truncate">
                        {entry.title || 'Untitled Entry'}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">
                        {entry.content.slice(0, 80)}…
                      </p>
                      <p className="text-lavender-400 text-xs mt-1.5">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1 group-hover:text-lavender-400 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Start (if no entries) */}
        {recentEntries.length === 0 && (
          <section>
            <div className="glass rounded-2xl p-6 border border-lavender-100 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-semibold text-slate-700 mb-1">Start your wellness journey</h3>
              <p className="text-slate-500 text-sm mb-4">Check in daily, journal your thoughts, and let Aria support you.</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Link href="/chat" className="bg-lavender-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-lavender-700 transition-colors">
                  Chat with Aria
                </Link>
                <Link href="/journal" className="bg-white text-lavender-700 text-sm font-medium px-4 py-2 rounded-xl border border-lavender-200 hover:bg-lavender-50 transition-colors">
                  Write in Journal
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Crisis Banner */}
        <section>
          <Link href="/resources" className="flex items-center justify-between glass rounded-xl px-4 py-3 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors group">
            <div className="flex items-center gap-3">
              <LifeBuoy className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-700">In crisis? Help is here.</p>
                <p className="text-xs text-rose-500">Crisis resources & hotlines available 24/7</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      </div>
    </div>
  );
}
