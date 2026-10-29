create extension if not exists "pgcrypto";

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  content text not null default '' check (char_length(content) <= 20000),
  summary text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_user_updated on public.notes(user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

drop policy if exists "own notes select" on public.notes;
drop policy if exists "own notes insert" on public.notes;
drop policy if exists "own notes update" on public.notes;
drop policy if exists "own notes delete" on public.notes;
create policy "own notes select" on public.notes for select using (auth.uid() = user_id);
create policy "own notes insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "own notes update" on public.notes for update using (auth.uid() = user_id);
create policy "own notes delete" on public.notes for delete using (auth.uid() = user_id);

