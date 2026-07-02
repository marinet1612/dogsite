-- Dogram MVP database
create extension if not exists "pgcrypto";

create type public.user_role as enum ('owner', 'specialist', 'admin');
create type public.specialist_status as enum ('draft', 'pending', 'approved', 'rejected', 'blocked');
create type public.request_status as enum ('created', 'sent', 'viewed', 'accepted', 'rejected', 'cancelled', 'completed');
create type public.walk_status as enum ('active', 'full', 'completed', 'cancelled');
create type public.participant_status as enum ('requested', 'accepted', 'declined', 'cancelled');
create type public.conversation_type as enum ('request', 'walk', 'direct', 'support');
create type public.moderation_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role not null default 'owner',
  full_name text,
  avatar_url text,
  city text default 'Санкт-Петербург',
  district text,
  phone text,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dog_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  breed text,
  age_months int,
  sex text default 'unknown',
  weight numeric(6,2),
  size text default 'medium',
  activity_level text default 'medium',
  city text default 'Санкт-Петербург',
  district text,
  description text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dog_problems (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dog_profiles(id) on delete cascade,
  problem_type text not null,
  severity int check (severity between 1 and 5),
  description text,
  created_at timestamptz not null default now()
);

create table public.dog_triggers (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dog_profiles(id) on delete cascade,
  trigger_type text not null,
  reaction_type text,
  distance numeric(6,2),
  comment text,
  created_at timestamptz not null default now()
);

create table public.specialist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  public_name text not null,
  city text not null default 'Санкт-Петербург',
  districts text[] default '{}',
  experience_years int default 0,
  education text,
  description text,
  methods text,
  price_from int,
  price_to int,
  works_online boolean not null default false,
  works_offline boolean not null default true,
  works_at_client_place boolean not null default false,
  works_on_training_ground boolean not null default true,
  verification_status specialist_status not null default 'draft',
  rating numeric(2,1) default 4.8,
  reviews_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.specialist_specializations (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
  specialization_type text not null,
  unique (specialist_id, specialization_type)
);

create table public.specialist_certificates (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
  title text not null,
  issuer text,
  issue_year int,
  file_url text,
  verification_status moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.specialist_cases (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
  title text not null,
  problem_type text,
  dog_breed text,
  dog_age text,
  description_before text,
  work_process text,
  result text,
  video_url text,
  created_at timestamptz not null default now()
);

create table public.owner_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  dog_id uuid not null references public.dog_profiles(id) on delete cascade,
  specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
  problem_type text not null,
  description text,
  preferred_format text,
  city text default 'Санкт-Петербург',
  district text,
  budget int,
  status request_status not null default 'sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dog_profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entry_type text not null default 'training',
  problem_type text,
  title text,
  description text,
  reaction_level int check (reaction_level between 1 and 5),
  condition_score int check (condition_score between 1 and 5),
  trigger_distance numeric(7,2),
  duration_minutes int,
  media_url text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.walks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  dog_id uuid references public.dog_profiles(id) on delete set null,
  city text default 'Санкт-Петербург',
  district text,
  meeting_place text,
  walk_datetime timestamptz not null,
  walk_type text not null default 'calm',
  description text,
  allowed_dog_size text default 'any',
  allowed_activity_level text default 'any',
  contact_allowed boolean not null default false,
  status walk_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.walk_participants (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  dog_id uuid references public.dog_profiles(id) on delete set null,
  status participant_status not null default 'requested',
  created_at timestamptz not null default now(),
  unique (walk_id, user_id, dog_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type conversation_type not null,
  title text,
  owner_request_id uuid references public.owner_requests(id) on delete set null,
  walk_id uuid references public.walks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_url text not null,
  file_name text,
  file_type text,
  file_size int,
  created_at timestamptz not null default now()
);

create table public.message_reads (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (message_id, user_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
  request_id uuid references public.owner_requests(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  text text,
  moderation_status moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  problem_type text,
  dog_age_group text,
  excerpt text,
  content text not null,
  cover_url text,
  author_id uuid references public.profiles(id) on delete set null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  website_url text,
  created_at timestamptz not null default now()
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text not null,
  description text,
  code text not null,
  target_segment text,
  link_url text,
  starts_at date,
  ends_at date,
  copy_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  description text,
  status moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_dog_profiles_owner on public.dog_profiles(owner_id);
create index idx_specialist_profiles_status_city on public.specialist_profiles(verification_status, city);
create index idx_owner_requests_owner on public.owner_requests(owner_id);
create index idx_owner_requests_specialist on public.owner_requests(specialist_id);
create index idx_progress_entries_dog on public.progress_entries(dog_id, entry_date desc);
create index idx_walks_city_datetime on public.walks(city, walk_datetime);
create index idx_conversation_members_user on public.conversation_members(user_id);
create index idx_messages_conversation_created on public.messages(conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_dog_profiles_updated_at before update on public.dog_profiles for each row execute function public.set_updated_at();
create trigger set_specialist_profiles_updated_at before update on public.specialist_profiles for each row execute function public.set_updated_at();
create trigger set_owner_requests_updated_at before update on public.owner_requests for each row execute function public.set_updated_at();
create trigger set_progress_entries_updated_at before update on public.progress_entries for each row execute function public.set_updated_at();
create trigger set_walks_updated_at before update on public.walks for each row execute function public.set_updated_at();
create trigger set_conversations_updated_at before update on public.conversations for each row execute function public.set_updated_at();
create trigger set_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'owner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.dog_profiles enable row level security;
alter table public.dog_problems enable row level security;
alter table public.dog_triggers enable row level security;
alter table public.specialist_profiles enable row level security;
alter table public.specialist_specializations enable row level security;
alter table public.specialist_certificates enable row level security;
alter table public.specialist_cases enable row level security;
alter table public.owner_requests enable row level security;
alter table public.progress_entries enable row level security;
alter table public.walks enable row level security;
alter table public.walk_participants enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.message_reads enable row level security;
alter table public.reviews enable row level security;
alter table public.articles enable row level security;
alter table public.brands enable row level security;
alter table public.promo_codes enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer;

create or replace function public.is_conversation_member(conversation_uuid uuid)
returns boolean as $$
  select exists(select 1 from public.conversation_members where conversation_id = conversation_uuid and user_id = auth.uid());
$$ language sql security definer;

create policy "profiles read own or public basic" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert with check (id = auth.uid());

create policy "dogs owner all" on public.dog_profiles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "dog problems owner" on public.dog_problems for all using (exists(select 1 from public.dog_profiles d where d.id = dog_id and d.owner_id = auth.uid())) with check (exists(select 1 from public.dog_profiles d where d.id = dog_id and d.owner_id = auth.uid()));
create policy "dog triggers owner" on public.dog_triggers for all using (exists(select 1 from public.dog_profiles d where d.id = dog_id and d.owner_id = auth.uid())) with check (exists(select 1 from public.dog_profiles d where d.id = dog_id and d.owner_id = auth.uid()));

create policy "approved specialists public read" on public.specialist_profiles for select using (verification_status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "specialist own insert" on public.specialist_profiles for insert with check (user_id = auth.uid());
create policy "specialist own update" on public.specialist_profiles for update using (user_id = auth.uid() or public.is_admin());

create policy "specializations readable" on public.specialist_specializations for select using (true);
create policy "specializations owner write" on public.specialist_specializations for all using (exists(select 1 from public.specialist_profiles s where s.id = specialist_id and (s.user_id = auth.uid() or public.is_admin()))) with check (exists(select 1 from public.specialist_profiles s where s.id = specialist_id and (s.user_id = auth.uid() or public.is_admin())));

create policy "certificates specialist or admin" on public.specialist_certificates for all using (exists(select 1 from public.specialist_profiles s where s.id = specialist_id and (s.user_id = auth.uid() or public.is_admin()))) with check (exists(select 1 from public.specialist_profiles s where s.id = specialist_id and (s.user_id = auth.uid() or public.is_admin())));
create policy "cases public read" on public.specialist_cases for select using (true);
create policy "cases owner write" on public.specialist_cases for all using (exists(select 1 from public.specialist_profiles s where s.id = specialist_id and (s.user_id = auth.uid() or public.is_admin()))) with check (exists(select 1 from public.specialist_profiles s where s.id = specialist_id and (s.user_id = auth.uid() or public.is_admin())));

create policy "requests owner or specialist read" on public.owner_requests for select using (owner_id = auth.uid() or exists(select 1 from public.specialist_profiles s where s.id = specialist_id and s.user_id = auth.uid()) or public.is_admin());
create policy "requests owner insert" on public.owner_requests for insert with check (owner_id = auth.uid());
create policy "requests owner or specialist update" on public.owner_requests for update using (owner_id = auth.uid() or exists(select 1 from public.specialist_profiles s where s.id = specialist_id and s.user_id = auth.uid()) or public.is_admin());

create policy "progress owner all" on public.progress_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "walks public read" on public.walks for select using (true);
create policy "walks creator insert" on public.walks for insert with check (creator_id = auth.uid());
create policy "walks creator update" on public.walks for update using (creator_id = auth.uid() or public.is_admin());
create policy "walk participants related" on public.walk_participants for all using (user_id = auth.uid() or exists(select 1 from public.walks w where w.id = walk_id and w.creator_id = auth.uid()) or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "conversations members read" on public.conversations for select using (public.is_conversation_member(id) or public.is_admin());
create policy "conversations authenticated insert" on public.conversations for insert with check (auth.uid() is not null);
create policy "conversation members read own" on public.conversation_members for select using (user_id = auth.uid() or public.is_conversation_member(conversation_id) or public.is_admin());
create policy "conversation members insert authenticated" on public.conversation_members for insert with check (auth.uid() is not null);

create policy "messages members read" on public.messages for select using (public.is_conversation_member(conversation_id) or public.is_admin());
create policy "messages members insert" on public.messages for insert with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));
create policy "message attachments members read" on public.message_attachments for select using (exists(select 1 from public.messages m where m.id = message_id and public.is_conversation_member(m.conversation_id)));
create policy "message reads own" on public.message_reads for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reviews public read approved" on public.reviews for select using (moderation_status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "reviews owner insert" on public.reviews for insert with check (owner_id = auth.uid());
create policy "articles public read" on public.articles for select using (is_published = true or public.is_admin());
create policy "brands public read" on public.brands for select using (true);
create policy "promo public read" on public.promo_codes for select using (is_active = true or public.is_admin());
create policy "reports owner insert" on public.reports for insert with check (reporter_id = auth.uid());
create policy "reports admin read" on public.reports for select using (reporter_id = auth.uid() or public.is_admin());
create policy "notifications own" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime for chat messages
alter publication supabase_realtime add table public.messages;
