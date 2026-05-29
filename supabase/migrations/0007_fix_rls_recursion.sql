-- ============================================================
-- Fix de recursão RLS (Postgres 42P17) nas policies de mini-ligas
-- Cria funções SECURITY DEFINER que bypassam RLS pra checar
-- ownership e approved membership sem disparar policies em loop.
-- Recria as 4 policies que cruzavam leagues ↔ league_members.
-- Aplicar via SQL Editor do dashboard Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Helper: is_league_owner
-- ------------------------------------------------------------
create or replace function is_league_owner(
  p_league_id uuid,
  p_participant_id text
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from leagues
    where id = p_league_id
      and owner_id::text = p_participant_id
  );
$$;

revoke execute on function is_league_owner(uuid, text) from public;
grant execute on function is_league_owner(uuid, text)
  to authenticated, service_role;

comment on function is_league_owner(uuid, text) is
  'SECURITY DEFINER pra evitar recursão de RLS quando usado em policies de league_members. Bypassa RLS internamente.';

-- ------------------------------------------------------------
-- 2) Helper: is_approved_member
-- ------------------------------------------------------------
create or replace function is_approved_member(
  p_league_id uuid,
  p_participant_id text
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from league_members
    where league_id = p_league_id
      and participant_id::text = p_participant_id
      and status = 'aprovado'
  );
$$;

revoke execute on function is_approved_member(uuid, text) from public;
grant execute on function is_approved_member(uuid, text)
  to authenticated, service_role;

comment on function is_approved_member(uuid, text) is
  'SECURITY DEFINER pra evitar recursão de RLS quando usado em policy de leagues. Bypassa RLS internamente.';

-- ------------------------------------------------------------
-- 3) leagues SELECT: owner OU is_approved_member
-- ------------------------------------------------------------
drop policy if exists leagues_select_own_or_approved_member on leagues;

create policy leagues_select_own_or_approved_member on leagues
  for select to authenticated
  using (
    owner_id::text = (auth.jwt() ->> 'participant_id')
    or is_approved_member(id, (auth.jwt() ->> 'participant_id'))
  );

-- ------------------------------------------------------------
-- 4) league_members: owner via is_league_owner (3 policies)
-- ------------------------------------------------------------
drop policy if exists league_members_select_owner_of_league on league_members;

create policy league_members_select_owner_of_league on league_members
  for select to authenticated
  using (
    is_league_owner(league_id, (auth.jwt() ->> 'participant_id'))
  );

drop policy if exists league_members_update_owner_of_league on league_members;

create policy league_members_update_owner_of_league on league_members
  for update to authenticated
  using (
    is_league_owner(league_id, (auth.jwt() ->> 'participant_id'))
  )
  with check (
    is_league_owner(league_id, (auth.jwt() ->> 'participant_id'))
  );

drop policy if exists league_members_delete_owner_of_league on league_members;

create policy league_members_delete_owner_of_league on league_members
  for delete to authenticated
  using (
    is_league_owner(league_id, (auth.jwt() ->> 'participant_id'))
  );
