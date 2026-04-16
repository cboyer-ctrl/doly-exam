-- DOLY Exam Platform - Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- BATCHES
create table batches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'paused', 'archived')),
  timer_paused_at timestamptz,
  timer_pause_elapsed integer default 0
);

-- CANDIDATES
create table candidates (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid references batches(id),
  first_name text not null,
  last_name text not null,
  created_at timestamptz default now(),
  exam_started_at timestamptz,
  exam_finished_at timestamptz,
  status text default 'waiting' check (status in ('waiting', 'exam', 'finished')),
  validated boolean default null,
  validated_by text,
  validated_at timestamptz
);

-- EXAM SESSIONS (qcm + open question assignments per candidate)
create table exam_sessions (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) unique,
  batch_id uuid references batches(id),
  qcm_question_ids integer[] not null,
  open_question_ids integer[] not null,
  created_at timestamptz default now()
);

-- QCM ANSWERS
create table qcm_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id),
  question_id integer not null,
  answer_given text[] not null,
  is_correct boolean not null,
  submitted_at timestamptz default now()
);

-- OPEN ANSWERS
create table open_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id),
  question_id integer not null,
  answer_text text,
  score numeric(3,1) default null check (score >= 0 and score <= 2),
  comment text,
  graded_at timestamptz,
  submitted_at timestamptz default now()
);

-- PRACTICAL EVALUATION
create table practical_evals (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id) unique,
  score numeric(4,1) default null check (score >= 0 and score <= 10),
  comment text,
  graded_at timestamptz
);

-- INFRACTIONS (anti-cheat log)
create table infractions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id),
  type text not null,
  occurred_at timestamptz default now()
);

-- ROLES (simple fixed accounts stored in DB)
create table staff_accounts (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password_hash text not null,
  role text not null check (role in ('formateur', 'directeur'))
);

-- RLS Policies
alter table batches enable row level security;
alter table candidates enable row level security;
alter table exam_sessions enable row level security;
alter table qcm_answers enable row level security;
alter table open_answers enable row level security;
alter table practical_evals enable row level security;
alter table infractions enable row level security;
alter table staff_accounts enable row level security;

-- Allow all for now (app handles auth logic)
create policy "allow_all" on batches for all using (true);
create policy "allow_all" on candidates for all using (true);
create policy "allow_all" on exam_sessions for all using (true);
create policy "allow_all" on qcm_answers for all using (true);
create policy "allow_all" on open_answers for all using (true);
create policy "allow_all" on practical_evals for all using (true);
create policy "allow_all" on infractions for all using (true);
create policy "allow_all" on staff_accounts for all using (true);

-- Seed staff accounts (passwords hashed with bcrypt rounds=10)
-- formateur / D0LyMaT3UR_
-- directeur / @dIR3CT3UR_!
-- These will be inserted by the setup script
