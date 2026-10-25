-- GWD partners — order events (26/10/2026): signed, idempotent order events from the Novidades.Store checkout
-- (XPayments webhook) → attributed sale → pending commission → reversal on refund / chargeback.
-- Additive. REVIEW PROPOSAL: Helena applies AFTER 2026-10-25-partners-v1.sql. Rollback at the end.
-- No commission without conditions: an accrual is written only when the operator set commission_bps and
-- confirmation_days for an ACTIVE programme (values decided by the direction, never defaults).
begin;
alter table gwd.offer_programs
  add column commission_bps integer check (commission_bps between 0 and 10000),
  add column confirmation_days integer check (confirmation_days between 0 and 365);

-- Every event received once (idempotency on the sender's event id).
create table gwd.order_events (
  event_id text primary key check (char_length(event_id) between 8 and 120),
  reference text not null check (char_length(reference) between 4 and 120),
  status text not null,
  outcome text not null,
  received_at timestamptz not null default now()
);
alter table gwd.order_events enable row level security;
revoke all on gwd.order_events from public, anon, authenticated, gwd_api;

alter table gwd.attributed_sales
  add column offer_slug text,
  add column amount_minor bigint,
  add column currency text,
  add column updated_at timestamptz not null default now();

create function gwd.record_order_event(p_event_id text, p_reference text, p_status text, p_offer_slug text,
  p_amount_minor bigint, p_currency text, p_ref text)
returns text language plpgsql security definer set search_path = gwd, pg_temp as $$
declare
  v_participant uuid; v_program gwd.offer_programs; v_sale_status text; v_outcome text;
begin
  if p_status not in ('approved', 'refunded', 'chargeback', 'canceled', 'failed', 'pending') then
    raise exception 'invalid status' using errcode = '22023';
  end if;
  if exists (select 1 from gwd.order_events where event_id = p_event_id) then return 'duplicate'; end if;
  select r.participant_id into v_participant from gwd.referrals r where r.code = p_ref;
  -- attribution only through a link the member generated for this offer
  if v_participant is null or not exists (select 1 from gwd.referral_links l where l.participant_id = v_participant and l.offer_slug = p_offer_slug) then
    v_outcome := 'unattributed';
  elsif p_status in ('approved', 'refunded', 'chargeback') then
    v_sale_status := case p_status when 'approved' then 'APPROVED' when 'refunded' then 'REFUNDED' else 'CHARGEBACK' end;
    insert into gwd.attributed_sales (participant_id, aro_order_id, status, offer_slug, amount_minor, currency)
    values (v_participant, p_reference, v_sale_status, p_offer_slug, p_amount_minor, p_currency)
    on conflict (aro_order_id) do update set status = excluded.status, updated_at = now()
      where gwd.attributed_sales.participant_id = excluded.participant_id;
    select * into v_program from gwd.offer_programs where offer_slug = p_offer_slug and kind = 'AFFILIATE';
    if p_status = 'approved' then
      if v_program.status = 'ACTIVE' and v_program.commission_bps is not null and v_program.confirmation_days is not null then
        insert into gwd.accrual_ledger (participant_id, aro_order_id, event_key, amount_minor, currency, status)
        values (v_participant, p_reference, 'accrual:' || p_reference, round(p_amount_minor * v_program.commission_bps / 10000.0), p_currency, 'PENDING')
        on conflict (event_key) do nothing;
        v_outcome := 'attributed_pending_commission';
      else
        v_outcome := 'attributed_no_commission_terms';
      end if;
    else
      -- refund / chargeback: the commission is reversed (append-only: original marked, reversal line added)
      update gwd.accrual_ledger set status = 'REVERSED' where event_key = 'accrual:' || p_reference and status <> 'REVERSED';
      insert into gwd.accrual_ledger (participant_id, aro_order_id, event_key, amount_minor, currency, status)
      select participant_id, aro_order_id, 'reversal:' || p_reference, -amount_minor, currency, 'REVERSED'
        from gwd.accrual_ledger where event_key = 'accrual:' || p_reference
      on conflict (event_key) do nothing;
      v_outcome := 'reversed';
    end if;
  else
    v_outcome := 'ignored_status';
  end if;
  insert into gwd.order_events (event_id, reference, status, outcome) values (p_event_id, p_reference, p_status, v_outcome);
  if v_participant is not null and v_outcome <> 'unattributed' then
    insert into gwd.audit_events (participant_id, action) values (v_participant, 'partner.order.' || p_status);
  end if;
  return v_outcome;
end $$;
revoke all on function gwd.record_order_event(text, text, text, text, bigint, text, text) from public, anon, authenticated;
grant execute on function gwd.record_order_event(text, text, text, text, bigint, text, text) to gwd_api;

-- Operator: programme with structured terms (commission and confirmation period confirmed by the direction).
create function gwd.ops_set_program_terms(p_slug text, p_kind text, p_commission_bps integer, p_confirmation_days integer)
returns boolean language plpgsql security definer set search_path = gwd, pg_temp as $$
begin
  if not gwd.is_operator() then raise exception 'operator only' using errcode = '42501'; end if;
  update gwd.offer_programs set commission_bps = p_commission_bps, confirmation_days = p_confirmation_days, updated_at = now()
   where offer_slug = p_slug and kind = p_kind;
  return found;
end $$;
revoke all on function gwd.ops_set_program_terms(text, text, integer, integer) from public, anon, authenticated;
grant execute on function gwd.ops_set_program_terms(text, text, integer, integer) to gwd_api;
commit;
-- ROLLBACK:
-- begin; drop function gwd.ops_set_program_terms(text, text, integer, integer);
-- drop function gwd.record_order_event(text, text, text, text, bigint, text, text); drop table gwd.order_events;
-- alter table gwd.attributed_sales drop column offer_slug, drop column amount_minor, drop column currency, drop column updated_at;
-- alter table gwd.offer_programs drop column commission_bps, drop column confirmation_days; commit;
