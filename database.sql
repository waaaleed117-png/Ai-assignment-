-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create chats table
create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null default 'New assignment',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create messages table
create table if not exists public.messages (
  id text primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- 4. Create Policies for chats
create policy "Allow users to view their own chats" on public.chats
  for select using (auth.uid() = user_id);

create policy "Allow users to insert their own chats" on public.chats
  for insert with check (auth.uid() = user_id);

create policy "Allow users to delete their own chats" on public.chats
  for delete using (auth.uid() = user_id);

create policy "Allow users to update their own chats" on public.chats
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. Create Policies for messages
create policy "Allow users to view messages of their chats" on public.messages
  for select using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and chats.user_id = auth.uid()
    )
  );

create policy "Allow users to insert messages to their chats" on public.messages
  for insert with check (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and chats.user_id = auth.uid()
    )
  );