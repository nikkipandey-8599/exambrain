-- ════════════════════════════════════════════
-- ExamBrain — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════

-- Sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  local_id text not null,
  topic text,
  summary text,
  exam_content jsonb,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, local_id)
);

-- Results table
create table if not exists results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_local_id text not null,
  answers jsonb,
  created_at timestamptz default now(),
  unique(user_id, session_local_id)
);

-- Row Level Security
alter table sessions enable row level security;
alter table results enable row level security;

-- Policies: users can only see/edit their own data
create policy "Users own sessions" on sessions
  for all using (auth.uid() = user_id);

create policy "Users own results" on results
  for all using (auth.uid() = user_id);
