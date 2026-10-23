-- GWD Community V1 — native discussion with moderation (Gate C, missão #15).
-- REVIEW PROPOSAL: Helena applies to the GWD DB after backup (docs/execution/RELEASE_DEPLOY_RUNBOOK.md).
-- Additive only: no existing table is altered. Rollback: drop the 4 objects at the end of this file.
-- Trust model unchanged (schema.sql): the API verifies the Supabase JWT, then SET LOCAL ROLE gwd_api
-- with request.jwt.claim.sub; RLS scopes every read/write to that participant.
-- No points are awarded for posting (anti-spam); helpful-answer XP needs an approved moderation flow later.
begin;
create table gwd.community_spaces (
 id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
 title text not null,
 description text not null default '',
 -- null = every participant who accepted the rules; otherwise only holders of that capability.
 required_capability text check (required_capability in ('SOCIAL_MEDIA','AFFILIATE','AUTHORIZED_SELLER','MENTOR','TEAM_LEAD')),
 position integer not null default 100,
 archived boolean not null default false
);
create table gwd.community_posts (
 id uuid primary key default gen_random_uuid(),
 space_id text not null references gwd.community_spaces(id),
 author_id uuid not null references gwd.participants(id) on delete cascade,
 -- Display name copied server-side from the author's own participant row (participants RLS stays own-row).
 author_name text not null check (char_length(author_name) between 1 and 120),
 parent_id uuid references gwd.community_posts(id) on delete cascade,
 body text not null check (char_length(btrim(body)) between 2 and 2000),
 created_at timestamptz not null default now(),
 removed_at timestamptz,          -- author removed it
 hidden_at timestamptz            -- moderation (reports threshold or operator); never writable by gwd_api
);
create index community_posts_space_idx on gwd.community_posts (space_id, created_at desc) where parent_id is null;
create index community_posts_parent_idx on gwd.community_posts (parent_id, created_at);
create index community_posts_author_idx on gwd.community_posts (author_id, created_at desc);
create table gwd.community_reports (
 post_id uuid not null references gwd.community_posts(id) on delete cascade,
 reporter_id uuid not null references gwd.participants(id) on delete cascade,
 reason text not null check (reason in ('SPAM','RESPEITO','PRIVACIDADE','PROMESSA_RENDIMENTO','OUTRO')),
 created_at timestamptz not null default now(),
 primary key (post_id, reporter_id)
);
alter table gwd.community_spaces enable row level security;
alter table gwd.community_posts enable row level security;
alter table gwd.community_reports enable row level security;
revoke all on gwd.community_spaces, gwd.community_posts, gwd.community_reports from public, anon, authenticated;

-- A participant may read a space only after accepting the rules, and capability spaces only with that capability.
create function gwd.community_can_access(space text) returns boolean language sql stable security invoker set search_path = '' as $$
 select exists (select 1 from gwd.community_memberships m where m.participant_id = (select auth.uid()))
   and exists (select 1 from gwd.community_spaces s where s.id = space and not s.archived and (s.required_capability is null
     or exists (select 1 from gwd.participant_capabilities pc where pc.participant_id = (select auth.uid()) and pc.capability = s.required_capability)))
$$;
revoke execute on function gwd.community_can_access(text) from public, anon, authenticated;
grant execute on function gwd.community_can_access(text) to gwd_api;

grant select on gwd.community_spaces to gwd_api;
create policy spaces_read on gwd.community_spaces for select to gwd_api using (not archived);

grant select on gwd.community_posts to gwd_api;
grant insert (space_id, author_id, author_name, parent_id, body) on gwd.community_posts to gwd_api;
grant update (removed_at) on gwd.community_posts to gwd_api;
create policy posts_read on gwd.community_posts for select to gwd_api using (
 author_id = (select auth.uid()) or (removed_at is null and hidden_at is null and gwd.community_can_access(space_id)));
create policy posts_insert on gwd.community_posts for insert to gwd_api with check (
 author_id = (select auth.uid()) and gwd.community_can_access(space_id));
create policy posts_own_update on gwd.community_posts for update to gwd_api
 using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));

grant select, insert (post_id, reporter_id, reason) on gwd.community_reports to gwd_api;
create policy reports_own_read on gwd.community_reports for select to gwd_api using (reporter_id = (select auth.uid()));
create policy reports_insert on gwd.community_reports for insert to gwd_api with check (reporter_id = (select auth.uid()));

-- Three distinct reports hide a post until an operator reviews it (owner-only function; gwd_api cannot set hidden_at).
create function gwd.community_hide_reported() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if (select count(*) from gwd.community_reports r where r.post_id = new.post_id) >= 3 then
  update gwd.community_posts set hidden_at = coalesce(hidden_at, now()) where id = new.post_id;
 end if;
 return new;
end $$;
revoke execute on function gwd.community_hide_reported() from public, anon, authenticated, gwd_api;
create trigger community_reports_hide after insert on gwd.community_reports for each row execute function gwd.community_hide_reported();

insert into gwd.community_spaces (id, title, description, position) values
 ('geral', 'Geral', 'Conversa aberta da comunidade GWD: partilhas, dúvidas e conquistas.', 10),
 ('apresentacoes', 'Apresentações', 'Diz quem és, de onde vens e o que queres construir no digital.', 20),
 ('academy', 'Dúvidas da Academy', 'Perguntas sobre episódios, leituras e quizzes da GWD Academy.', 30)
on conflict do nothing;
commit;
-- ROLLBACK (only if no real posts must be kept):
-- begin; drop trigger community_reports_hide on gwd.community_reports; drop function gwd.community_hide_reported();
-- drop table gwd.community_reports; drop table gwd.community_posts; drop function gwd.community_can_access(text);
-- drop table gwd.community_spaces; commit;
