import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DbMoodEntry {
  id: string;
  user_id: string;
  mood: number;
  note: string | null;
  entry_date: string;
  created_at: string;
}

export interface DbJournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: number | null;
  created_at: string;
  updated_at: string;
}

// ── Mood ───────────────────────────────────────────────────────────────────

export async function saveMood(mood: number, note?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('mood_entries').upsert(
    { user_id: user.id, mood, note: note ?? null, entry_date: today },
    { onConflict: 'user_id,entry_date' }
  );
  if (error) throw error;
}

export async function getTodayMood(): Promise<DbMoodEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .maybeSingle();
  return data;
}

export async function getMoodHistory(days = 60): Promise<DbMoodEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', since.toISOString().split('T')[0])
    .order('entry_date', { ascending: true });

  if (error) return [];
  return data ?? [];
}

export function calcStreak(history: DbMoodEntry[]): number {
  if (!history.length) return 0;
  const days = [...new Set(history.map(e => e.entry_date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (days[i] === expected.toISOString().split('T')[0]) streak++;
    else break;
  }
  return streak;
}

export function calcWeekAvg(history: DbMoodEntry[]): number | null {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const recent = history.filter(e => e.entry_date >= cutoffStr);
  if (!recent.length) return null;
  return recent.reduce((s, e) => s + e.mood, 0) / recent.length;
}

// ── Journal ────────────────────────────────────────────────────────────────

export async function getJournalEntries(): Promise<DbJournalEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getJournalEntry(id: string): Promise<DbJournalEntry | null> {
  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data;
}

export async function createJournalEntry(
  entry: Pick<DbJournalEntry, 'title' | 'content' | 'mood'>
): Promise<DbJournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ user_id: user.id, ...entry })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<Pick<DbJournalEntry, 'title' | 'content' | 'mood'>>
): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw error;
}
