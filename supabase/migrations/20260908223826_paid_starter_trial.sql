-- Payment evidence is server-written. Owner read policies remain in force.
alter table public.subscriptions
  add column paid_through timestamptz,
  add column trial_start timestamptz,
  add column trial_end timestamptz,
  add column trial_invoice text,
  add column trial_used_at timestamptz;
alter table public.checkout_intents add column trial boolean not null default false;

drop function public.checkout_intent(uuid,text);
create function public.checkout_intent(p_workspace uuid,p_plan text,p_trial boolean default false)
returns public.checkout_intents language plpgsql security invoker set search_path='' as $$
declare r public.checkout_intents;
begin
  perform 1 from public.workspaces where id=p_workspace for update;
  if p_plan not in ('maki','nigiri','omakase') then raise exception 'Invalid plan'; end if;
  if p_trial and exists(select 1 from public.subscriptions where workspace_id=p_workspace and (trial_used_at is not null or stripe_subscription is not null)) then
    raise exception 'This workspace is not eligible for another trial';
  end if;
  insert into public.checkout_intents(workspace_id,plan,trial,expires_at)
  values(p_workspace,p_plan,p_trial,now()+interval '1 hour')
  on conflict(workspace_id) do update set id=gen_random_uuid(),plan=excluded.plan,trial=excluded.trial,session_id=null,session_url=null,expires_at=excluded.expires_at
  where public.checkout_intents.expires_at<now();
  select * into r from public.checkout_intents where workspace_id=p_workspace;
  return r;
end $$;

create or replace function public.sync_subscription(p_workspace uuid,p_observed timestamptz,p_state jsonb)
returns void language plpgsql security invoker set search_path='' as $$
begin
  -- Serialize billing and checkout eligibility for the same workspace.
  perform 1 from public.workspaces where id=p_workspace for update;
  insert into public.subscriptions(workspace_id,stripe_customer,stripe_subscription,plan,status,period_start,period_end,cancel_at_period_end,synced_at,paid_through,trial_start,trial_end,trial_invoice,trial_used_at)
  values(p_workspace,p_state->>'stripe_customer',p_state->>'stripe_subscription',p_state->>'plan',p_state->>'status',(p_state->>'period_start')::timestamptz,(p_state->>'period_end')::timestamptz,(p_state->>'cancel_at_period_end')::boolean,p_observed,(p_state->>'paid_through')::timestamptz,(p_state->>'trial_start')::timestamptz,(p_state->>'trial_end')::timestamptz,p_state->>'trial_invoice',case when p_state->>'trial_invoice' is not null then p_observed end)
  on conflict(workspace_id) do update set
    stripe_customer=excluded.stripe_customer,stripe_subscription=excluded.stripe_subscription,
    plan=excluded.plan,status=excluded.status,period_start=excluded.period_start,period_end=excluded.period_end,
    cancel_at_period_end=excluded.cancel_at_period_end,synced_at=excluded.synced_at,updated_at=now(),
    paid_through=excluded.paid_through,
    -- A webhook retry, plan change, or dashboard edit cannot extend a paid trial.
    trial_start=case when public.subscriptions.stripe_subscription=excluded.stripe_subscription then coalesce(public.subscriptions.trial_start,excluded.trial_start) else excluded.trial_start end,
    trial_end=case when public.subscriptions.stripe_subscription=excluded.stripe_subscription then least(public.subscriptions.trial_end,excluded.trial_end) else excluded.trial_end end,
    trial_invoice=excluded.trial_invoice,
    trial_used_at=coalesce(public.subscriptions.trial_used_at,excluded.trial_used_at)
  where (public.subscriptions.synced_at is null or public.subscriptions.synced_at<=p_observed)
    and (public.subscriptions.stripe_customer is null or public.subscriptions.stripe_customer=excluded.stripe_customer);
end $$;
revoke execute on function public.checkout_intent(uuid,text,boolean),public.sync_subscription(uuid,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.checkout_intent(uuid,text,boolean),public.sync_subscription(uuid,timestamptz,jsonb) to service_role;
