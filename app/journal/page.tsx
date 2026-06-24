'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PlusCircle, Trash2, BookOpen, ChevronLeft, Lightbulb, X, Loader2 } from 'lucide-react';
import { getJournalEntries, getJournalEntry, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/lib/db';
import { getMoodConfig, MOOD_CONFIG } from '@/lib/utils';
import type { DbJournalEntry } from '@/lib/db';

const JOURNAL_PROMPTS = [
  "What are three things you're grateful for today?",
  "What emotion is taking up the most space right now?",
  "Describe a moment today where you felt at peace.",
  "What's one thing you'd like to let go of?",
  "Write a letter of compassion to yourself.",
  "What does your inner critic say, and what does your inner friend say?",
  "What small win can you celebrate today?",
  "What would you tell a friend going through what you're experiencing?",
  "Describe your ideal tomorrow.",
  "What are you afraid of, and what would courage look like?",
  "What's one thing you need right now?",
  "How have you grown in the past year?",
];

function JournalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [entries, setEntries] = useState<DbJournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<DbJournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    getJournalEntries().then(data => {
      setEntries(data);
      setLoadingEntries(false);
      const id = searchParams.get('id');
      if (id) {
        const found = data.find(e => e.id === id);
        if (found) openEntry(found);
      }
    });
  }, [searchParams]);

  const openEntry = (entry: DbJournalEntry) => {
    setActiveEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedMood(entry.mood ?? null);
    setIsEditing(false);
    setIsNew(false);
    setShowPrompt(false);
  };

  const startNew = () => {
    setActiveEntry(null);
    setTitle('');
    setContent('');
    setSelectedMood(null);
    setIsEditing(true);
    setIsNew(true);
    setShowPrompt(false);
    router.push('/journal');
  };

  const handleSave = useCallback(async () => {
    if (!content.trim() && !title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: title || `Entry — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        content,
        mood: selectedMood ?? null,
      };

      if (isNew) {
        const saved = await createJournalEntry(data);
        setActiveEntry(saved);
        setIsNew(false);
        const updated = await getJournalEntries();
        setEntries(updated);
      } else if (activeEntry) {
        await updateJournalEntry(activeEntry.id, data);
        const updated = await getJournalEntries();
        setEntries(updated);
        const refreshed = updated.find(e => e.id === activeEntry.id) ?? null;
        setActiveEntry(refreshed);
      }
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }, [activeEntry, title, content, selectedMood, isNew]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;
    await deleteJournalEntry(id);
    setEntries(await getJournalEntries());
    if (activeEntry?.id === id) { setActiveEntry(null); setIsEditing(false); }
  };

  const getPrompt = () => {
    const p = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setCurrentPrompt(p);
    setShowPrompt(true);
  };

  const usePrompt = () => {
    setContent(prev => prev ? `${prev}\n\n${currentPrompt}\n` : `${currentPrompt}\n`);
    setShowPrompt(false);
  };

  const showList = !isEditing && !activeEntry;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Entry List */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-80 bg-white/60 border-r border-lavender-100 flex-shrink-0`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-lavender-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lavender-600" />
            <h1 className="font-bold text-slate-800 text-lg">Journal</h1>
          </div>
          <button onClick={startNew} className="flex items-center gap-1.5 bg-lavender-600 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-lavender-700 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingEntries && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 text-lavender-400 animate-spin" />
            </div>
          )}
          {!loadingEntries && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-slate-600 font-semibold mb-1">Your journal awaits</p>
              <p className="text-slate-400 text-sm">Writing about your thoughts helps you process and understand them.</p>
              <button onClick={startNew} className="mt-4 text-lavender-600 font-semibold text-sm hover:text-lavender-700">
                Write your first entry →
              </button>
            </div>
          )}
          {entries.map((entry) => {
            const moodCfg = entry.mood ? getMoodConfig(entry.mood) : null;
            const isActive = activeEntry?.id === entry.id;
            return (
              <button key={entry.id} onClick={() => openEntry(entry)}
                className={`w-full text-left p-3.5 rounded-xl transition-all group ${isActive ? 'bg-lavender-100 border border-lavender-200' : 'hover:bg-lavender-50 border border-transparent'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {moodCfg && <span className="text-lg flex-shrink-0">{moodCfg.emoji}</span>}
                    <p className="font-semibold text-slate-700 text-sm truncate">{entry.title || 'Untitled'}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(entry.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-400 text-xs truncate mb-1">{entry.content.slice(0, 60)}</p>
                <p className="text-lavender-400 text-[10px]">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor / View */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showList ? 'hidden md:flex' : 'flex'}`}>
        {/* Toolbar */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-lavender-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveEntry(null); setIsEditing(false); router.push('/journal'); }}
              className="md:hidden flex items-center gap-1 text-lavender-600 font-medium text-sm">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {!isEditing && activeEntry && (
              <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-lavender-600 hover:text-lavender-700">Edit</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <button onClick={getPrompt} className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                  <Lightbulb className="w-4 h-4" /> Prompt
                </button>
                <button onClick={handleSave} disabled={(!content.trim() && !title.trim()) || saving}
                  className="flex items-center gap-1.5 bg-lavender-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-lavender-700 disabled:opacity-40 transition-colors shadow-sm">
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {showPrompt && (
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start justify-between gap-3 animate-slide-up">
            <div className="flex gap-2 min-w-0">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-sm italic">"{currentPrompt}"</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={usePrompt} className="text-amber-700 font-semibold text-xs hover:text-amber-800 whitespace-nowrap">Use this</button>
              <button onClick={() => setShowPrompt(false)}><X className="w-4 h-4 text-amber-400 hover:text-amber-600" /></button>
            </div>
          </div>
        )}

        {!isEditing && !activeEntry && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
            <div className="text-5xl mb-4 animate-float">✍️</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Select an entry or start writing</h2>
            <p className="text-slate-400 text-sm max-w-sm">Your thoughts deserve space. Choose an entry on the left or create a new one.</p>
            <button onClick={startNew} className="mt-6 flex items-center gap-2 bg-lavender-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-lavender-700 transition-colors shadow-md">
              <PlusCircle className="w-4 h-4" /> New Entry
            </button>
          </div>
        )}

        {isEditing && (
          <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6 space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">How are you feeling?</p>
              <div className="flex gap-2 flex-wrap">
                {MOOD_CONFIG.map(m => (
                  <button key={m.value} onClick={() => setSelectedMood(prev => prev === m.value ? null : m.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all
                      ${selectedMood === m.value ? `${m.bg} ${m.text} ${m.border} border font-semibold shadow-sm` : 'border-slate-200 text-slate-500 hover:border-lavender-200 hover:text-lavender-600'}`}>
                    <span>{m.emoji}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
              className="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 bg-transparent border-none focus:outline-none" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write freely… there's no right or wrong way to journal." autoFocus
              className="w-full flex-1 text-slate-700 placeholder-slate-300 bg-transparent border-none focus:outline-none resize-none text-base leading-relaxed min-h-[50vh]" />
          </div>
        )}

        {!isEditing && activeEntry && (
          <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <p className="text-slate-400 text-sm">{new Date(activeEntry.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {activeEntry.mood && (
                  <span className={`flex items-center gap-1 text-sm ${getMoodConfig(activeEntry.mood).text} ${getMoodConfig(activeEntry.mood).bg} px-2.5 py-0.5 rounded-full font-medium`}>
                    {getMoodConfig(activeEntry.mood).emoji} {getMoodConfig(activeEntry.mood).label}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-4">{activeEntry.title || 'Untitled Entry'}</h1>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">{activeEntry.content}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JournalPage() {
  return <Suspense><JournalContent /></Suspense>;
}
