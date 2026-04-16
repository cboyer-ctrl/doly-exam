-- Script SQL COMPLET à exécuter dans Supabase SQL Editor
-- Étape 1 : Créer toutes les tables
-- Étape 2 : Insérer les comptes staff avec mots de passe hashés

-- ═══════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

create table if not exists batches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'paused', 'archived')),
  timer_paused_at timestamptz,
  timer_pause_elapsed integer default 0
);

create table if not exists candidates (
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

create table if not exists exam_sessions (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) unique,
  batch_id uuid references batches(id),
  qcm_question_ids integer[] not null,
  open_question_ids integer[] not null,
  created_at timestamptz default now()
);

create table if not exists qcm_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id),
  question_id integer not null,
  answer_given text[] not null,
  is_correct boolean not null,
  submitted_at timestamptz default now(),
  unique(session_id, question_id)
);

create table if not exists open_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id),
  question_id integer not null,
  answer_text text,
  score numeric(3,1) default null check (score >= 0 and score <= 2),
  comment text,
  graded_at timestamptz,
  submitted_at timestamptz default now(),
  unique(session_id, question_id)
);

create table if not exists practical_evals (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id) unique,
  score numeric(4,1) default null check (score >= 0 and score <= 10),
  comment text,
  graded_at timestamptz
);

create table if not exists infractions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references exam_sessions(id),
  type text not null,
  occurred_at timestamptz default now()
);

create table if not exists staff_accounts (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password_hash text not null,
  role text not null check (role in ('formateur', 'directeur'))
);

-- ═══════════════════════════════════════════════════
-- RLS (Row Level Security) — open policies
-- ═══════════════════════════════════════════════════

alter table batches enable row level security;
alter table candidates enable row level security;
alter table exam_sessions enable row level security;
alter table qcm_answers enable row level security;
alter table open_answers enable row level security;
alter table practical_evals enable row level security;
alter table infractions enable row level security;
alter table staff_accounts enable row level security;

do $$ begin
  if not exists (select from pg_policies where tablename='batches' and policyname='allow_all') then
    create policy "allow_all" on batches for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='candidates' and policyname='allow_all') then
    create policy "allow_all" on candidates for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='exam_sessions' and policyname='allow_all') then
    create policy "allow_all" on exam_sessions for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='qcm_answers' and policyname='allow_all') then
    create policy "allow_all" on qcm_answers for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='open_answers' and policyname='allow_all') then
    create policy "allow_all" on open_answers for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='practical_evals' and policyname='allow_all') then
    create policy "allow_all" on practical_evals for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='infractions' and policyname='allow_all') then
    create policy "allow_all" on infractions for all using (true) with check (true);
  end if;
  if not exists (select from pg_policies where tablename='staff_accounts' and policyname='allow_all') then
    create policy "allow_all" on staff_accounts for all using (true) with check (true);
  end if;
end $$;

-- ═══════════════════════════════════════════════════
-- COMPTES STAFF
-- Mots de passe hashés avec bcrypt (rounds=10) :
-- formateur → D0LyMaT3UR_
-- directeur → @dIR3CT3UR_!
-- ═══════════════════════════════════════════════════

-- Mots de passe hashés SHA-256 :
-- formateur → D0LyMaT3UR_
-- directeur → @dIR3CT3UR_!
insert into staff_accounts (username, password_hash, role) values
  ('formateur', 'a355d0b83f4ea1adaad9719e456e85d6a70f725203a06ca32c881c905941750e', 'formateur'),
  ('directeur', 'c7fdef6e4778b730765fe98a3ee790bffd7e9207f82e52891d25b31e70db5f2c', 'directeur')
on conflict (username) do nothing;
