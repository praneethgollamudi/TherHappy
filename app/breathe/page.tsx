'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Check } from 'lucide-react';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  phases: { label: string; duration: number; instruction: string }[];
  cycles: number;
  benefit: string;
  color: string;
  gradient: string;
}

const EXERCISES: BreathingExercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by Navy SEALs to calm the nervous system',
    phases: [
      { label: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose' },
      { label: 'Hold', duration: 4, instruction: 'Hold your breath gently' },
      { label: 'Exhale', duration: 4, instruction: 'Breathe out slowly through your mouth' },
      { label: 'Hold', duration: 4, instruction: 'Rest before the next breath' },
    ],
    cycles: 4,
    benefit: 'Reduces stress and anxiety',
    color: '#7c3aed',
    gradient: 'from-lavender-500 to-purple-600',
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'A natural tranquilizer for the nervous system',
    phases: [
      { label: 'Inhale', duration: 4, instruction: 'Breathe in quietly through your nose' },
      { label: 'Hold', duration: 7, instruction: 'Hold your breath — be comfortable' },
      { label: 'Exhale', duration: 8, instruction: 'Exhale completely through your mouth' },
    ],
    cycles: 4,
    benefit: 'Promotes deep relaxation and sleep',
    color: '#0d9488',
    gradient: 'from-sage-500 to-teal-600',
  },
  {
    id: 'calm',
    name: 'Calm Breath',
    description: 'Simple deep breathing for everyday stress',
    phases: [
      { label: 'Inhale', duration: 5, instruction: 'Breathe in deeply, fill your lungs' },
      { label: 'Exhale', duration: 5, instruction: 'Let it all go, completely release' },
    ],
    cycles: 6,
    benefit: 'Quick stress relief anytime',
    color: '#ec4899',
    gradient: 'from-pink-400 to-rose-500',
  },
];

type PhaseType = 'inhale' | 'hold' | 'exhale';

function getPhaseType(label: string): PhaseType {
  const l = label.toLowerCase();
  if (l === 'inhale') return 'inhale';
  if (l === 'exhale') return 'exhale';
  return 'hold';
}

export default function BreathePage() {
  const [selected, setSelected] = useState<BreathingExercise>(EXERCISES[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);
  const [circleScale, setCircleScale] = useState(0.75);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = selected.phases[phase];
  const phaseType = currentPhase ? getPhaseType(currentPhase.label) : 'hold';

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setPhase(0);
    setCountdown(0);
    setCycle(0);
    setDone(false);
    setCircleScale(0.75);
  };

  const selectExercise = (ex: BreathingExercise) => {
    setSelected(ex);
    reset();
  };

  useEffect(() => {
    if (!running) return;

    const phaseDuration = selected.phases[phase].duration;
    setCountdown(phaseDuration);

    const label = selected.phases[phase].label.toLowerCase();
    if (label === 'inhale') {
      const target = 1;
      const steps = phaseDuration * 10;
      const start = circleScale;
      let step = 0;
      const ramp = setInterval(() => {
        step++;
        setCircleScale(start + (target - start) * (step / steps));
        if (step >= steps) clearInterval(ramp);
      }, 100);
    } else if (label === 'exhale') {
      const target = 0.75;
      const steps = phaseDuration * 10;
      const start = circleScale;
      let step = 0;
      const ramp = setInterval(() => {
        step++;
        setCircleScale(start + (target - start) * (step / steps));
        if (step >= steps) clearInterval(ramp);
      }, 100);
    }

    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          const nextPhase = (phase + 1) % selected.phases.length;
          const nextCycle = nextPhase === 0 ? cycle + 1 : cycle;

          if (nextPhase === 0 && nextCycle >= selected.cycles) {
            setRunning(false);
            setDone(true);
            setCircleScale(0.85);
            return 0;
          }

          setPhase(nextPhase);
          setCycle(nextCycle);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = tick;
    return () => clearInterval(tick);
  }, [running, phase]);

  const handleStart = () => {
    if (done) {
      reset();
      return;
    }
    if (!running) {
      setCountdown(selected.phases[phase].duration);
    }
    setRunning(prev => !prev);
  };

  const progress = running && currentPhase ? (1 - countdown / currentPhase.duration) : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 md:pt-16">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-sage-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
            <Wind className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Breathe</h1>
        </div>
        <p className="text-slate-500 text-sm">Guided breathing exercises to calm your mind and body.</p>
      </div>

      {/* Exercise Selector */}
      <div className="px-4 md:px-8 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {EXERCISES.map(ex => (
            <button
              key={ex.id}
              onClick={() => selectExercise(ex)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${selected.id === ex.id
                  ? 'bg-lavender-100 text-lavender-700 border-lavender-300 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-lavender-200 hover:text-lavender-600'
                }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Exercise Area */}
      <div className="flex flex-col items-center px-4 md:px-8">

        {/* Description card */}
        <div className="w-full max-w-md glass rounded-2xl p-5 mb-8 text-center border border-white/50">
          <h2 className="text-lg font-bold text-slate-800 mb-1">{selected.name}</h2>
          <p className="text-slate-500 text-sm mb-2">{selected.description}</p>
          <span className={`inline-block bg-gradient-to-r ${selected.gradient} text-white text-xs font-medium px-3 py-1 rounded-full`}>
            {selected.benefit}
          </span>
        </div>

        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center mb-10" style={{ width: 280, height: 280 }}>
          {/* Outer glow ring */}
          <div
            className="absolute rounded-full transition-all duration-1000 ease-in-out opacity-20"
            style={{
              width: 280,
              height: 280,
              background: `radial-gradient(circle, ${selected.color}, transparent)`,
              transform: `scale(${circleScale})`,
            }}
          />

          {/* Progress ring SVG */}
          <svg className="absolute" width={280} height={280} viewBox="0 0 280 280">
            <circle
              cx={140} cy={140} r={120}
              fill="none"
              stroke={`${selected.color}22`}
              strokeWidth={6}
            />
            {running && (
              <circle
                cx={140} cy={140} r={120}
                fill="none"
                stroke={selected.color}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 140 140)"
                className="transition-all duration-1000 ease-linear"
              />
            )}
          </svg>

          {/* Center circle */}
          <div
            className="relative flex flex-col items-center justify-center rounded-full shadow-2xl transition-all duration-1000 ease-in-out"
            style={{
              width: 200,
              height: 200,
              background: `linear-gradient(135deg, ${selected.color}dd, ${selected.color})`,
              transform: `scale(${circleScale})`,
              boxShadow: `0 0 40px ${selected.color}40`,
            }}
          >
            {done ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="w-10 h-10 text-white" />
                <p className="text-white font-semibold text-lg">Complete!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-white text-center px-4">
                <p className="text-2xl font-bold">
                  {running && countdown > 0 ? countdown : '—'}
                </p>
                <p className="text-sm font-semibold opacity-90">
                  {running ? currentPhase?.label : 'Ready'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Phase instruction */}
        <div className="h-12 flex items-center justify-center mb-6">
          {running && currentPhase && (
            <p className="text-slate-600 text-center text-sm font-medium max-w-xs animate-fade-in">
              {currentPhase.instruction}
            </p>
          )}
          {done && (
            <p className="text-slate-600 text-center text-sm font-medium animate-fade-in">
              Well done! {selected.cycles} cycles completed 🌿
            </p>
          )}
          {!running && !done && (
            <p className="text-slate-400 text-center text-sm">
              {cycle > 0 ? `Paused — cycle ${cycle + 1} of ${selected.cycles}` : `${selected.cycles} cycles · ${selected.phases.map(p => p.duration).join('-')} seconds`}
            </p>
          )}
        </div>

        {/* Cycle progress dots */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: selected.cycles }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                ${i < cycle ? 'opacity-100' : 'opacity-30'}`}
              style={{ background: selected.color }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleStart}
            className="w-16 h-16 flex items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`, boxShadow: `0 8px 24px ${selected.color}40` }}
          >
            {done ? (
              <RotateCcw className="w-6 h-6" />
            ) : running ? (
              <Pause className="w-6 h-6" fill="white" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" fill="white" />
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-10 max-w-sm w-full glass rounded-2xl p-5 mb-8 border border-white/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tips for best results</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-lavender-400 flex-shrink-0">•</span>Find a comfortable seated position</li>
            <li className="flex gap-2"><span className="text-lavender-400 flex-shrink-0">•</span>Place one hand on your belly to feel it rise</li>
            <li className="flex gap-2"><span className="text-lavender-400 flex-shrink-0">•</span>Close your eyes or soften your gaze</li>
            <li className="flex gap-2"><span className="text-lavender-400 flex-shrink-0">•</span>Let go of tension with each exhale</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
