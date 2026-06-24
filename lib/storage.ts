export interface MoodEntry {
  date: string;
  mood: number;
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: number;
  prompt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// --- Mood ---

export function saveMood(mood: number, note?: string): void {
  const entry: MoodEntry = { date: new Date().toISOString(), mood, note };
  const history = getMoodHistory();
  const today = new Date().toDateString();
  const filtered = history.filter(e => new Date(e.date).toDateString() !== today);
  filtered.push(entry);
  localStorage.setItem('th_moodHistory', JSON.stringify(filtered));
}

export function getMoodHistory(): MoodEntry[] {
  try { return JSON.parse(localStorage.getItem('th_moodHistory') || '[]'); }
  catch { return []; }
}

export function getTodayMood(): MoodEntry | null {
  const history = getMoodHistory();
  const today = new Date().toDateString();
  return history.find(e => new Date(e.date).toDateString() === today) ?? null;
}

export function getWeekAvgMood(): number | null {
  const history = getMoodHistory();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recent = history.filter(e => new Date(e.date) >= weekAgo);
  if (recent.length === 0) return null;
  return recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
}

// --- Journal ---

export function saveJournalEntry(entry: Omit<JournalEntry, 'id'>): JournalEntry {
  const newEntry: JournalEntry = { ...entry, id: Date.now().toString() };
  const entries = getJournalEntries();
  entries.unshift(newEntry);
  localStorage.setItem('th_journalEntries', JSON.stringify(entries));
  return newEntry;
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>): void {
  const entries = getJournalEntries().map(e => e.id === id ? { ...e, ...updates } : e);
  localStorage.setItem('th_journalEntries', JSON.stringify(entries));
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter(e => e.id !== id);
  localStorage.setItem('th_journalEntries', JSON.stringify(entries));
}

export function getJournalEntries(): JournalEntry[] {
  try { return JSON.parse(localStorage.getItem('th_journalEntries') || '[]'); }
  catch { return []; }
}

// --- Chat ---

export function saveChatMessages(messages: ChatMessage[]): void {
  localStorage.setItem('th_chatMessages', JSON.stringify(messages));
}

export function getChatMessages(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem('th_chatMessages') || '[]'); }
  catch { return []; }
}

export function clearChatMessages(): void {
  localStorage.removeItem('th_chatMessages');
}

// --- Streak ---

export function getStreakDays(): number {
  const history = getMoodHistory();
  if (!history.length) return 0;

  const uniqueDays = [...new Set(history.map(e => new Date(e.date).toDateString()))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (uniqueDays[i] === expected.toDateString()) streak++;
    else break;
  }
  return streak;
}
