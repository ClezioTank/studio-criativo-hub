create type public.app_role as enum ('admin','user');

create table public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  type text not null default 'Outro',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key,
  full_name text,
  email text,
  studio_id uuid references public.studios(id) on delete set null,
  studio_type text,
  plan text not null default 'free' check (plan in ('free','beta','pro')),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive','trialing','active','past_due','canceled')),
  payment_source text check (payment_source in ('paddle','manual')),
  is_active boolean not null default true,
  is_tester boolean not null default false,
  admin_note text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  company text,
  email text,
  whatsapp text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  description text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'Kz' check (currency in ('Kz','BRL','USD','EUR')),
  start_date date,
  deadline date,
  status text not null default 'Planejamento' check (status in ('Planejamento','Aguardando cliente','Em andamento','Em revisão','Entregue','Concluído','Cancelado')),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'A fazer' check (status in ('A fazer','Em andamento','Concluída')),
  priority text not null default 'Normal' check (priority in ('Baixa','Normal','Alta')),
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'Kz' check (currency in ('Kz','BRL','USD','EUR')),
  delivery_time text,
  valid_until date,
  notes text,
  status text not null default 'Rascunho' check (status in ('Rascunho','Enviada','Aceita','Recusada','Alteração solicitada')),
  client_message text,
  public_token text not null unique default replace(gen_random_uuid()::text,'-',''),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.proposal_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  position int not null default 0
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  studio_id uuid references public.studios(id) on delete set null,
  type text not null check (type in ('Bug','Sugestão','Dificuldade','Outro')),
  message text not null,
  status text not null default 'Novo' check (status in ('Novo','Em análise','Resolvido')),
  internal_note text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric(14,2) not null default 0,
  currency text not null default 'Kz' check (currency in ('Kz','BRL','USD','EUR')),
  method text not null default 'Manual' check (method in ('Paddle','Manual')),
  status text not null default 'Pendente' check (status in ('Pago','Pendente','Cancelado')),
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  studio_id uuid references public.studios(id) on delete set null,
  event text not null,
  entity text,
  description text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.studios, public.profiles, public.clients, public.projects, public.tasks, public.proposals, public.proposal_items, public.feedback, public.payments, public.activity_logs to authenticated;
grant select on public.user_roles to authenticated;
grant all on public.studios, public.profiles, public.user_roles, public.clients, public.projects, public.tasks, public.proposals, public.proposal_items, public.feedback, public.payments, public.activity_logs to service_role;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_studio_owner(_studio_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.studios where id = _studio_id and owner_id = auth.uid())
$$;

alter table public.studios enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;
alter table public.feedback enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

create policy "own studio" on public.studios for all to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (owner_id = auth.uid());

create policy "own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "insert own profile" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admin update profile" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "studio clients" on public.clients for all to authenticated
  using (public.is_studio_owner(studio_id) or public.has_role(auth.uid(),'admin'))
  with check (public.is_studio_owner(studio_id));
create policy "studio projects" on public.projects for all to authenticated
  using (public.is_studio_owner(studio_id) or public.has_role(auth.uid(),'admin'))
  with check (public.is_studio_owner(studio_id));
create policy "studio tasks" on public.tasks for all to authenticated
  using (public.is_studio_owner(studio_id) or public.has_role(auth.uid(),'admin'))
  with check (public.is_studio_owner(studio_id));
create policy "studio proposals" on public.proposals for all to authenticated
  using (public.is_studio_owner(studio_id) or public.has_role(auth.uid(),'admin'))
  with check (public.is_studio_owner(studio_id));
create policy "studio proposal items" on public.proposal_items for all to authenticated
  using (exists (select 1 from public.proposals p where p.id = proposal_id and (public.is_studio_owner(p.studio_id) or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.proposals p where p.id = proposal_id and public.is_studio_owner(p.studio_id)));

create policy "own feedback read" on public.feedback for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own feedback insert" on public.feedback for insert to authenticated
  with check (user_id = auth.uid());
create policy "admin feedback update" on public.feedback for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "payments read" on public.payments for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "payments admin insert" on public.payments for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));
create policy "payments admin update" on public.payments for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "payments admin delete" on public.payments for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "activity read" on public.activity_logs for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "activity insert own" on public.activity_logs for insert to authenticated
  with check (user_id = auth.uid());

create index on public.clients (studio_id);
create index on public.projects (studio_id);
create index on public.tasks (studio_id);
create index on public.proposals (studio_id);
create index on public.activity_logs (created_at desc);