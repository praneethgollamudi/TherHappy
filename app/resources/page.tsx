'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Globe, ChevronDown, ChevronUp, Heart, Shield, Sun, Moon, Zap, BookHeart } from 'lucide-react';

const CRISIS_RESOURCES = [
  { name: 'National Suicide & Crisis Lifeline', number: '988', action: 'Call or Text', color: 'rose', description: 'Available 24/7 for anyone in distress.' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', action: 'Text', color: 'purple', description: 'Free text-based crisis support anytime.' },
  { name: 'SAMHSA Helpline', number: '1-800-662-4357', action: 'Call', color: 'teal', description: 'Free mental health & substance use referrals.' },
  { name: 'Trevor Project (LGBTQ+ Youth)', number: '1-866-488-7386', action: 'Call', color: 'pink', description: 'Crisis support for LGBTQ+ young people.' },
  { name: 'Veterans Crisis Line', number: 'Call 988, Press 1', action: 'Call', color: 'slate', description: '24/7 crisis support for veterans & families.' },
];

interface CopingStrategy {
  icon: React.ElementType;
  title: string;
  color: string;
  tips: string[];
}

const COPING_STRATEGIES: CopingStrategy[] = [
  {
    icon: Zap,
    title: 'Grounding (5-4-3-2-1)',
    color: 'amber',
    tips: [
      '5 things you can SEE around you right now',
      '4 things you can TOUCH',
      '3 things you can HEAR',
      '2 things you can SMELL',
      '1 thing you can TASTE',
      'This exercise brings your mind into the present moment.',
    ],
  },
  {
    icon: Sun,
    title: 'Behavioral Activation',
    color: 'orange',
    tips: [
      'Do one small, achievable activity — even just making tea',
      'Go outside, even for 5 minutes of sunlight',
      'Call or text a friend you trust',
      'Move your body — a short walk counts',
      'Do something creative: draw, cook, write',
    ],
  },
  {
    icon: Moon,
    title: 'Sleep Hygiene',
    color: 'indigo',
    tips: [
      'Maintain a consistent sleep-wake time',
      'Avoid screens 30 mins before bed',
      'Keep your bedroom cool and dark',
      'Try progressive muscle relaxation lying down',
      'Limit caffeine after noon',
    ],
  },
  {
    icon: Shield,
    title: 'Challenging Negative Thoughts',
    color: 'teal',
    tips: [
      'Notice the thought: "I\'m noticing I\'m thinking..."',
      'Ask: Is this thought 100% factually true?',
      'Ask: What would I tell a friend thinking this?',
      'Find one piece of evidence against the thought',
      'Replace with a balanced, compassionate thought',
    ],
  },
  {
    icon: Heart,
    title: 'Self-Compassion Practice',
    color: 'rose',
    tips: [
      'Place a hand on your heart and breathe deeply',
      'Say: "This is a moment of suffering. Suffering is part of being human."',
      'Ask: "What do I need right now to care for myself?"',
      'Write yourself a letter of encouragement',
      'Treat yourself as you would treat a dear friend',
    ],
  },
  {
    icon: BookHeart,
    title: 'Journaling Prompts for Hard Days',
    color: 'purple',
    tips: [
      'What am I feeling right now? Where in my body?',
      'What triggered this feeling?',
      'What do I need that I\'m not getting?',
      'Write about a time you got through something hard',
      'What is one small act of kindness I can do for myself?',
    ],
  },
];

const WELLNESS_APPS = [
  { name: 'Headspace', type: 'Meditation & Mindfulness', url: 'https://www.headspace.com' },
  { name: 'Calm', type: 'Sleep & Relaxation', url: 'https://www.calm.com' },
  { name: 'Woebot', type: 'CBT-based AI Support', url: 'https://woebothealth.com' },
  { name: 'NOCD', type: 'OCD & Anxiety Therapy', url: 'https://www.treatmyocd.com' },
  { name: 'BetterHelp', type: 'Online Therapy', url: 'https://www.betterhelp.com' },
  { name: 'Open Path Collective', type: 'Affordable Therapy', url: 'https://openpathcollective.org' },
];

function StrategyCard({ strategy }: { strategy: CopingStrategy }) {
  const [open, setOpen] = useState(false);
  const { icon: Icon, title, color, tips } = strategy;

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const iconBgMap: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    teal: 'bg-teal-100 text-teal-600',
    rose: 'bg-rose-100 text-rose-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${colorMap[color]}`}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgMap[color]}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 space-y-2 animate-slide-up">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="opacity-50 flex-shrink-0 mt-0.5">→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 md:pt-16">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
        </div>
        <p className="text-slate-500 text-sm">Help, tools, and strategies for your mental health.</p>
      </div>

      <div className="px-4 md:px-8 pb-12 space-y-8 max-w-2xl">

        {/* Crisis Resources */}
        <section>
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl overflow-hidden">
            <div className="bg-rose-100 px-5 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-600" />
              <h2 className="font-bold text-rose-800 text-sm uppercase tracking-wider">If You're in Crisis — Help is Here</h2>
            </div>
            <div className="p-5 space-y-3">
              {CRISIS_RESOURCES.map((r, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex items-start justify-between gap-3 border border-rose-100">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{r.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">{r.action}</span>
                    {r.number.startsWith('1-') || r.number === '988' ? (
                      <a
                        href={`tel:${r.number.replace(/\D/g, '')}`}
                        className="flex items-center gap-1 text-slate-700 font-semibold text-xs hover:text-rose-600 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> {r.number}
                      </a>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
                        <MessageSquare className="w-3 h-3" /> {r.number}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coping Strategies */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Coping Strategies</h2>
          <div className="space-y-3">
            {COPING_STRATEGIES.map((s, i) => (
              <StrategyCard key={i} strategy={s} />
            ))}
          </div>
        </section>

        {/* Mental Wellness Apps & Services */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Helpful Apps & Services</h2>
          <div className="grid grid-cols-2 gap-3">
            {WELLNESS_APPS.map((app, i) => (
              <a
                key={i}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-4 hover:shadow-md transition-all group border border-white/60"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-slate-700 text-sm group-hover:text-lavender-700 transition-colors">{app.name}</p>
                  <Globe className="w-3 h-3 text-slate-300 group-hover:text-lavender-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-slate-400 text-xs">{app.type}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Self-Care Reminder */}
        <section>
          <div className="bg-gradient-to-br from-lavender-600 to-pink-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-3">💛</div>
            <h3 className="font-bold text-lg mb-2">You are not alone</h3>
            <p className="text-lavender-100 text-sm leading-relaxed">
              Reaching out for help is one of the bravest things you can do.
              Whether you talk to Aria, write in your journal, or call a crisis line —
              you are taking care of yourself, and that matters.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
