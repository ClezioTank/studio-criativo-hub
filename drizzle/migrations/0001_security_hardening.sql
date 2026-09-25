-- Harden access control without changing the original schema migration.
-- All application data stays protected by RLS; these helpers centralize ownership checks.

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_active = true
  )
$$;

create or replace function public.is_studio_owner(_studio_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_active_user()
    and exists (
      select 1 from public.studios where id = _studio_id and owner_id = auth.uid()
    )
$$;

-- RLS cannot restrict individual columns. This trigger leaves ordinary users able
-- to maintain their display name only; onboarding and administrative writes use
-- trusted server-side service-role code.
create or replace function public.enforce_profile_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if auth.role() <> 'authenticated' then
    raise exception 'profile writes require authentication';
  end if;

  if tg_op = 'INSERT' then
    if new.id <> auth.uid()
      or new.studio_id is not null
      or new.studio_type is not null
      or new.onboarded is distinct from false
      or new.plan is distinct from 'free'
      or new.subscription_status is distinct from 'inactive'
      or new.payment_source is not null
      or new.is_active is distinct from true
      or new.is_tester is distinct from false
      or new.admin_note is not null then
      raise exception 'only a default profile may be created';
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or new.studio_id is distinct from old.studio_id
    or new.studio_type is distinct from old.studio_type
    or new.onboarded is distinct from old.onboarded
    or new.plan is distinct from old.plan
    or new.subscription_status is distinct from old.subscription_status
    or new.payment_source is distinct from old.payment_source
    or new.is_active is distinct from old.is_active
    or new.is_tester is distinct from old.is_tester
    or new.admin_note is distinct from old.admin_note
    or new.created_at is distinct from old.created_at then
    raise exception 'profile field is managed by the server';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_write on public.profiles;
create trigger enforce_profile_write
before insert or update on public.profiles
for each row execute function public.enforce_profile_write();

-- Preserve the existing nullable foreign keys while rejecting mismatched studio
-- references, including direct PostgREST writes.
create or replace function public.enforce_project_client_studio()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_id is not null and not exists (
    select 1 from public.clients where id = new.client_id and studio_id = new.studio_id
  ) then raise exception 'project client must belong to the same studio'; end if;
  return new;
end;
$$;

create or replace function public.enforce_task_project_studio()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects where id = new.project_id and studio_id = new.studio_id
  ) then raise exception 'task project must belong to the same studio'; end if;
  return new;
end;
$$;

create or replace function public.enforce_proposal_references()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_id is not null and not exists (
    select 1 from public.clients where id = new.client_id and studio_id = new.studio_id
  ) then raise exception 'proposal client must belong to the same studio'; end if;
  if new.project_id is not null and not exists (
    select 1 from public.projects where id = new.project_id and studio_id = new.studio_id
  ) then raise exception 'proposal project must belong to the same studio'; end if;
  return new;
end;
$$;

create or replace function public.enforce_feedback_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.has_role(auth.uid(), 'admin') then return new; end if;
  if new.user_id <> auth.uid()
    or new.internal_note is not null
    or new.status is distinct from 'Novo'
    or (new.studio_id is not null and not public.is_studio_owner(new.studio_id)) then
    raise exception 'feedback may only be submitted for the current user and studio';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_activity_log_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.has_role(auth.uid(), 'admin') then return new; end if;
  if new.user_id is distinct from auth.uid()
    or (new.studio_id is not null and not public.is_studio_owner(new.studio_id)) then
    raise exception 'activity must belong to the current user and studio';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_project_client_studio on public.projects;
create trigger enforce_project_client_studio before insert or update of studio_id, client_id on public.projects
for each row execute function public.enforce_project_client_studio();
drop trigger if exists enforce_task_project_studio on public.tasks;
create trigger enforce_task_project_studio before insert or update of studio_id, project_id on public.tasks
for each row execute function public.enforce_task_project_studio();
drop trigger if exists enforce_proposal_references on public.proposals;
create trigger enforce_proposal_references before insert or update of studio_id, client_id, project_id on public.proposals
for each row execute function public.enforce_proposal_references();
drop trigger if exists enforce_feedback_write on public.feedback;
create trigger enforce_feedback_write before insert or update on public.feedback
for each row execute function public.enforce_feedback_write();
drop trigger if exists enforce_activity_log_write on public.activity_logs;
create trigger enforce_activity_log_write before insert or update on public.activity_logs
for each row execute function public.enforce_activity_log_write();

-- Explicitly revoke mutation grants from regular users where mutations are not
-- part of the product surface. RLS remains the primary data-isolation layer.
revoke insert, update, delete on public.user_roles from authenticated;
revoke insert, update, delete on public.payments from authenticated;

-- Replace broad original policies with operation-specific ownership policies.
drop policy if exists "own studio" on public.studios;
drop policy if exists "own profile" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
drop policy if exists "admin update profile" on public.profiles;
drop policy if exists "read own roles" on public.user_roles;
drop policy if exists "studio clients" on public.clients;
drop policy if exists "studio projects" on public.projects;
drop policy if exists "studio tasks" on public.tasks;
drop policy if exists "studio proposals" on public.proposals;
drop policy if exists "studio proposal items" on public.proposal_items;
drop policy if exists "own feedback read" on public.feedback;
drop policy if exists "own feedback insert" on public.feedback;
drop policy if exists "admin feedback update" on public.feedback;
drop policy if exists "payments read" on public.payments;
drop policy if exists "payments admin insert" on public.payments;
drop policy if exists "payments admin update" on public.payments;
drop policy if exists "payments admin delete" on public.payments;
drop policy if exists "activity read" on public.activity_logs;
drop policy if exists "activity insert own" on public.activity_logs;

create policy "studio owner read" on public.studios for select to authenticated
  using (public.is_studio_owner(id));
create policy "studio owner insert" on public.studios for insert to authenticated
  with check (public.is_active_user() and owner_id = auth.uid());
create policy "studio owner update" on public.studios for update to authenticated
  using (public.is_studio_owner(id)) with check (owner_id = auth.uid());
create policy "studio owner delete" on public.studios for delete to authenticated
  using (public.is_studio_owner(id));
create policy "studio admin manage" on public.studios for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));

create policy "profile own read" on public.profiles for select to authenticated
  using (public.is_active_user() and id = auth.uid());
create policy "profile own insert" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profile own update" on public.profiles for update to authenticated
  using (public.is_active_user() and id = auth.uid()) with check (id = auth.uid());
create policy "profile admin manage" on public.profiles for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));

create policy "role own read" on public.user_roles for select to authenticated
  using (public.is_active_user() and user_id = auth.uid());
create policy "role admin manage" on public.user_roles for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));

create policy "clients owner manage" on public.clients for all to authenticated
  using (public.is_studio_owner(studio_id)) with check (public.is_studio_owner(studio_id));
create policy "clients admin manage" on public.clients for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));
create policy "projects owner manage" on public.projects for all to authenticated
  using (public.is_studio_owner(studio_id)) with check (public.is_studio_owner(studio_id));
create policy "projects admin manage" on public.projects for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));
create policy "tasks owner manage" on public.tasks for all to authenticated
  using (public.is_studio_owner(studio_id)) with check (public.is_studio_owner(studio_id));
create policy "tasks admin manage" on public.tasks for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));
create policy "proposals owner manage" on public.proposals for all to authenticated
  using (public.is_studio_owner(studio_id)) with check (public.is_studio_owner(studio_id));
create policy "proposals admin manage" on public.proposals for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));
create policy "proposal items owner manage" on public.proposal_items for all to authenticated
  using (exists (select 1 from public.proposals p where p.id = proposal_id and public.is_studio_owner(p.studio_id)))
  with check (exists (select 1 from public.proposals p where p.id = proposal_id and public.is_studio_owner(p.studio_id)));
create policy "proposal items admin manage" on public.proposal_items for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));

create policy "feedback own read" on public.feedback for select to authenticated
  using (public.is_active_user() and user_id = auth.uid());
create policy "feedback own insert" on public.feedback for insert to authenticated
  with check (public.is_active_user() and user_id = auth.uid()
    and (studio_id is null or public.is_studio_owner(studio_id)));
create policy "feedback admin manage" on public.feedback for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));

create policy "payments own read" on public.payments for select to authenticated
  using (public.is_active_user() and user_id = auth.uid());
create policy "payments admin manage" on public.payments for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));

create policy "activity own read" on public.activity_logs for select to authenticated
  using (public.is_active_user() and user_id = auth.uid());
create policy "activity own insert" on public.activity_logs for insert to authenticated
  with check (public.is_active_user() and user_id = auth.uid()
    and (studio_id is null or public.is_studio_owner(studio_id)));
create policy "activity admin manage" on public.activity_logs for all to authenticated
  using (public.is_active_user() and public.has_role(auth.uid(), 'admin'))
  with check (public.is_active_user() and public.has_role(auth.uid(), 'admin'));
