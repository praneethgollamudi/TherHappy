-- ============================================================
-- TherHappy — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New query
-- ============================================================

-- Mood entries (one per user per day, upsert-safe)
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood        SMALLINT    NOT NULL CHECK (mood >= 1 AND mood <= 5),
  note        TEXT,
  entry_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, entry_date)
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mood_own" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);

-- Journal entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT        NOT NULL DEFAULT '',
  content     TEXT        NOT NULL DEFAULT '',
  mood        SMALLINT    CHECK (mood >= 1 AND mood <= 5),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_own" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at on journal edits
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_journal_updated_at ON public.journal_entries;
CREATE TRIGGER trg_journal_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
