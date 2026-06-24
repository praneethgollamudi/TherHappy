'use client';

import { useState, useEffect } from 'react';
import { getMoodHistory, getJournalEntries, getStreakDays, getWeekAvgMood } from '@/lib/storage';
import { getMoodConfig } from '@/lib/utils';
import { BarChart2, Flame, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MoodEntry } from '@/lib/storage';

interface ChartPoint {
  date: string;
  mood: number;
  emoji: string;
}

function buildChartData(history: MoodEntry[], days: number): ChartPoint[] {
  const data: ChartPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const ds = d.toDateString();
    const entry = history.find(e => new Date(e.date).toDateString() === ds);

    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry?.mood ?? 0,
      emoji: entry ? getMoodConfig(entry.mood).emoji : '',
    });
  }
  return data;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length || !payload[0].value) return null;
  const moodCfg = getMoodConfig(payload[0].value);
  return (
    <div className="bg-white rounded-xl shadow-lg border border-lavender-100 px-3 py-2 text-sm">
      <p className="text-slate-400 text-xs mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{moodCfg.emoji}</span>
        <span className={`font-semibold ${moodCfg.text}`}>{moodCfg.label}</span>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [streak, setStreak] = useState(0);
  const [weekAvg, setWeekAvg] = useState<number | null>(null);
  const [journalCount, setJournalCount] = useState(0);
  const [range, setRange] = useState<7 | 14 | 30>(14);
  const [moodDistribution, setMoodDistribution] = useState<Record<number, number>>({});
  const [totalCheckins, setTotalCheckins] = useState(0);

  useEffect(() => {
    const history = getMoodHistory();
    setChartData(buildChartData(history, range));
    setStreak(getStreakDays());
    setWeekAvg(getWeekAvgMood());
    setJournalCount(getJournalEntries().length);

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    history.forEach(e => { dist[e.mood] = (dist[e.mood] || 0) + 1; });
    setMoodDistribution(dist);
    setTotalCheckins(history.length);
  }, [range]);

  const hasData = totalCheckins > 0;
  const maxDist = Math.max(...Object.values(moodDistribution), 1);
  const avgDisplay = weekAvg ? weekAvg.toFixed(1) : null;
  const avgMoodCfg = weekAvg ? getMoodConfig(Math.round(weekAvg)) : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 md:pt-16">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
        </div>
        <p className="text-slate-500 text-sm">Track your mood patterns and progress over time.</p>
      </div>

      <div className="px-4 md:px-8 pb-12 space-y-6 max-w-2xl">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-4 text-center border border-white/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{streak}</p>
            <p className="text-xs text-slate-400 mt-0.5">Day Streak</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center border border-white/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              {avgMoodCfg ? <span className="text-xl">{avgMoodCfg.emoji}</span> : <TrendingUp className="w-4 h-4 text-lavender-400" />}
            </div>
            <p className="text-2xl font-bold text-slate-800">{avgDisplay ?? '—'}</p>
            <p className="text-xs text-slate-400 mt-0.5">7-Day Avg</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center border border-white/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{journalCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Journal Entries</p>
          </div>
        </div>

        {/* Mood Chart */}
        <div className="glass rounded-2xl p-5 border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm">Mood Over Time</h2>
            <div className="flex gap-1">
              {([7, 14, 30] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all
                    ${range === r ? 'bg-lavender-100 text-lavender-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>

          {!hasData ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Calendar className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Check in daily to see your mood chart</p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    interval={range === 7 ? 1 : range === 14 ? 2 : 4}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={3} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (!payload.mood) return <g key={`dot-${cx}-${cy}`} />;
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="#7c3aed"
                          stroke="white"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 6, fill: '#7c3aed', stroke: 'white', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Y-axis labels */}
          <div className="flex justify-between mt-2 px-6">
            {[1, 2, 3, 4, 5].map(v => {
              const m = getMoodConfig(v);
              return <span key={v} className="text-lg" title={m.label}>{m.emoji}</span>;
            })}
          </div>
        </div>

        {/* Mood Distribution */}
        {hasData && (
          <div className="glass rounded-2xl p-5 border border-white/60">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Mood Distribution — All Time</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(v => {
                const cfg = getMoodConfig(v);
                const count = moodDistribution[v] ?? 0;
                const pct = totalCheckins > 0 ? (count / totalCheckins) * 100 : 0;
                return (
                  <div key={v} className="flex items-center gap-3">
                    <span className="text-xl w-8 flex-shrink-0">{cfg.emoji}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${cfg.bg.replace('bg-', 'bg-')}`}
                        style={{ width: `${(count / maxDist) * 100}%`, background: `var(--tw-gradient-from, currentColor)` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 w-16 flex-shrink-0">
                      <span className="text-xs text-slate-500">{count}×</span>
                      <span className="text-xs text-slate-400">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Encouragement */}
        {!hasData && (
          <div className="glass rounded-2xl p-6 text-center border border-lavender-100">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-semibold text-slate-700 mb-2">Start tracking your journey</h3>
            <p className="text-slate-400 text-sm">
              Check in with your mood each day from the home page to start seeing patterns and insights about your mental wellbeing.
            </p>
          </div>
        )}

        {/* Insights tip */}
        {hasData && streak >= 3 && (
          <div className="bg-gradient-to-r from-lavender-50 to-pink-50 border border-lavender-100 rounded-2xl p-5">
            <p className="text-lavender-700 font-semibold text-sm mb-1">🔥 {streak}-day streak!</p>
            <p className="text-slate-500 text-sm">
              Checking in consistently helps you notice patterns and take action earlier. Keep going!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
