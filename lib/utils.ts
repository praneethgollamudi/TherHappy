export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Up late tonight';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export const AFFIRMATIONS = [
  "You are worthy of love and belonging.",
  "Every step forward, no matter how small, counts.",
  "It's okay to not be okay — healing takes time.",
  "You have survived every difficult day so far.",
  "Your feelings are valid and deserve space.",
  "You deserve peace, rest, and happiness.",
  "Progress, not perfection.",
  "You are enough, exactly as you are.",
  "Asking for help is a sign of courage.",
  "This feeling is temporary — it will pass.",
  "Be gentle with yourself today.",
  "You matter more than you know.",
  "Your story isn't over yet.",
  "Small acts of self-care add up.",
  "You are not alone in this journey.",
  "Breathe. This moment will pass.",
  "It's okay to rest and recharge.",
  "Your best is always enough.",
  "You are more capable than you believe.",
  "Today is a new beginning.",
  "You are deeply loved.",
  "One day, one breath, one step at a time.",
  "Your mental health is your greatest wealth.",
  "It's brave to reach out and ask for support.",
  "You deserve all the care you give to others.",
  "Growth happens slowly, and that's okay.",
  "You are resilient beyond measure.",
  "Every emotion deserves to be heard.",
  "You have the strength to keep going.",
  "Today, choose to be kind to yourself.",
];

export function getTodayAffirmation(): string {
  const day = new Date().getDate() - 1;
  return AFFIRMATIONS[day % AFFIRMATIONS.length];
}

export const MOOD_CONFIG = [
  { value: 1, emoji: '😔', label: 'Struggling', color: 'rose', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  { value: 2, emoji: '😕', label: 'Low', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'lime', bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300' },
  { value: 5, emoji: '😊', label: 'Great', color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
];

export function getMoodConfig(value: number) {
  return MOOD_CONFIG.find(m => m.value === value) ?? MOOD_CONFIG[2];
}
