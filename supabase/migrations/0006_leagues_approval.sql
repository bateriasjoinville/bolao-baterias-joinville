-- ============================================================
-- Mini-ligas: descricao + aprovação manual de membros
-- Delta sobre 0001_initial_schema.sql
-- Aplicar via SQL Editor do dashboard Supabase
-- ============================================================

-- 1) leagues.descricao
alter table leagues
  add column if not exists descricao text
  check (descricao is null or char_length(descricao) <= 500);

comment on column leagues.descricao is
  'Mensagem livre do criador da liga. Mostrada na página de detalhe e no convite. Opcional.';

-- 2) league_members.status
alter table league_members
  add column if not exists status text not null default 'aprovado'
  check (status in ('pendente','aprovado'));

alter table league_members
  alter column status set default 'pendente';

comment on column league_members.status is
  'pendente = aguardando aprovação do owner da liga · aprovado = participa do ranking interno';

create index if not exists league_members_status_pendente_idx
  on league_members(league_id) where status = 'pendente';

-- 3) Trigger de owner auto-join
create or replace function add_owner_as_league_member()
returns trigger
language plpgsql
as $$
begin
  insert into league_members (league_id, participant_id, status)
  values (new.id, new.owner_id, 'aprovado');
  return new;
end;
$$;

drop trigger if exists leagues_add_owner_member on leagues;
create trigger leagues_add_owner_member
  after insert on leagues
  for each row execute function add_owner_as_league_member();

-- 4) RLS leagues: owner ou membro APROVADO vê a liga
drop policy if exists leagues_select_own_or_member on leagues;

create policy leagues_select_own_or_approved_member on leagues
  for select to authenticated
  using (
    owner_id::text = (auth.jwt() ->> 'participant_id')
    or exists (
      select 1 from league_members lm
      where lm.league_id = leagues.id
        and lm.participant_id::text = (auth.jwt() ->> 'participant_id')
        and lm.status = 'aprovado'
    )
  );

-- 5) RLS league_members: owner vê / aprova / remove membros da própria liga
create policy league_members_select_owner_of_league on league_members
  for select to authenticated
  using (
    exists (
      select 1 from leagues l
      where l.id = league_members.league_id
        and l.owner_id::text = (auth.jwt() ->> 'participant_id')
    )
  );

create policy league_members_update_owner_of_league on league_members
  for update to authenticated
  using (
    exists (
      select 1 from leagues l
      where l.id = league_members.league_id
        and l.owner_id::text = (auth.jwt() ->> 'participant_id')
    )
  )
  with check (
    exists (
      select 1 from leagues l
      where l.id = league_members.league_id
        and l.owner_id::text = (auth.jwt() ->> 'participant_id')
    )
  );

create policy league_members_delete_owner_of_league on league_members
  for delete to authenticated
  using (
    exists (
      select 1 from leagues l
      where l.id = league_members.league_id
        and l.owner_id::text = (auth.jwt() ->> 'participant_id')
    )
  );
