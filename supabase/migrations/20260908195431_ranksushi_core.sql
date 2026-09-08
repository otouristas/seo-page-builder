-- RankSushi v1. Service-side writes, owner-scoped reads, no browser credential access.
create extension if not exists pgcrypto;
create table public.workspaces(id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users(id) on delete cascade, owner_email text not null default '', name text not null default 'My workspace', created_at timestamptz not null default now());
create table public.projects(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,name text not null,url text not null,description text not null default '',country text not null default 'US',language text not null default 'en',gsc_property text,weekly_scan boolean not null default false,scan_limit int not null default 20 check(scan_limit between 1 and 200),email_digest boolean not null default false,created_at timestamptz not null default now(),unique(id,workspace_id));
create table public.subscriptions(workspace_id uuid primary key references public.workspaces(id) on delete cascade,stripe_customer text unique,stripe_subscription text unique,plan text not null default 'free' check(plan in ('free','maki','nigiri','omakase')),status text not null default 'inactive',period_start timestamptz,period_end timestamptz,cancel_at_period_end boolean not null default false,updated_at timestamptz not null default now());
create table public.jobs(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,kind text not null check(kind in ('crawl','recheck','gsc-sync','draft','ai-check','serp','report','pagespeed')),status text not null default 'queued' check(status in ('queued','running','completed','partial','failed','cancelled')),stage text not null default 'Waiting to start',input jsonb not null default '{}',output jsonb,error text,provider_id text,dispatched_at timestamptz,usage_kind text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade);
create table public.page_snapshots(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,job_id uuid not null references public.jobs(id) on delete cascade,url text not null,snapshot jsonb not null,created_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade,unique(job_id,url));
create table public.opportunities(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,finding_key text not null,title text not null,detail text not null,page_url text not null,effort text not null default 'small',status text not null default 'open' check(status in ('open','in-progress','applied','verified')),evidence jsonb not null,verified_at timestamptz,created_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade,unique(project_id,finding_key,page_url));
create table public.drafts(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,title text not null,kind text not null,metadata jsonb not null default '{}',source_job uuid unique references public.jobs(id),created_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade);
create table public.draft_revisions(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,draft_id uuid not null references public.drafts(id) on delete cascade,version int not null check(version>0),content text not null,created_at timestamptz not null default now(),unique(draft_id,version));
create table public.gsc_daily(id bigint generated always as identity primary key,workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,property text not null,date date not null,dataset text not null check(dataset in ('totals','detail','csv')),dimension_key text not null,query text not null default '',page text not null default '',country text not null default '',device text not null default '',search_type text not null default 'web',clicks double precision not null default 0 check(clicks>=0),impressions double precision not null default 0 check(impressions>=0),position double precision not null default 0 check(position>=0),created_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade,unique(project_id,property,date,dataset,dimension_key));
create table public.ai_checks(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,job_id uuid not null unique references public.jobs(id),provider text not null,model text not null,prompt text not null,answer text not null,citations jsonb not null default '[]',mentions jsonb not null default '[]',market text not null,status text not null default 'measured',created_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade);
create table public.reports(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null,job_id uuid unique references public.jobs(id),title text not null,payload jsonb not null,share_hash text unique,share_expires_at timestamptz,created_at timestamptz not null default now(),foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade);
create table public.usage_counters(workspace_id uuid not null references public.workspaces(id) on delete cascade,kind text not null,period text not null,amount int not null default 0 check(amount>=0),primary key(workspace_id,kind,period));
create table public.usage_reservations(key text primary key,workspace_id uuid not null references public.workspaces(id) on delete cascade,kind text not null,period text not null,amount int not null check(amount>=0),settled boolean not null default false,created_at timestamptz not null default now());
-- Credentials, replay records and global rate buckets have no authenticated read policy.
create table public.integrations(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null references public.projects(id) on delete cascade,provider text not null,credentials text not null,status text not null default 'connected',updated_at timestamptz not null default now(),unique(project_id,provider));
create table public.oauth_states(hash text primary key,workspace_id uuid not null references public.workspaces(id) on delete cascade,project_id uuid not null references public.projects(id) on delete cascade,user_id uuid not null,verifier text not null,expires_at timestamptz not null);
create table public.webhook_events(id text primary key,provider text not null,status text not null default 'pending',payload jsonb not null default '{}',created_at timestamptz not null default now(),processed_at timestamptz);
create table public.rate_buckets(key text primary key,amount int not null default 0,expires_at timestamptz not null);
create table public.product_events(id bigint generated always as identity primary key,workspace_id uuid references public.workspaces(id) on delete cascade,event text not null,metadata jsonb not null default '{}',created_at timestamptz not null default now());
create table public.email_events(key text primary key,workspace_id uuid references public.workspaces(id) on delete cascade,recipient text not null,provider_id text,status text not null default 'pending',created_at timestamptz not null default now());
create table public.email_suppressions(email text primary key,reason text not null,created_at timestamptz not null default now());
create index jobs_pending_idx on public.jobs(status,created_at);
create index snapshots_project_idx on public.page_snapshots(project_id,created_at desc);
create index gsc_period_idx on public.gsc_daily(project_id,dataset,date);
create index projects_workspace_idx on public.projects(workspace_id);
create index opportunities_workspace_idx on public.opportunities(workspace_id);
create index jobs_workspace_idx on public.jobs(workspace_id);
create index snapshots_workspace_idx on public.page_snapshots(workspace_id);
create index drafts_workspace_idx on public.drafts(workspace_id);
create index revisions_workspace_idx on public.draft_revisions(workspace_id);
create index gsc_workspace_idx on public.gsc_daily(workspace_id);
create index ai_workspace_idx on public.ai_checks(workspace_id);
create index reports_workspace_idx on public.reports(workspace_id);
-- Owner checks use a database membership relation, never mutable JWT user_metadata.
alter table public.workspaces enable row level security;
create policy own_workspace on public.workspaces for select to authenticated using(owner_id=(select auth.uid()));
DO $$ declare t text; begin
 foreach t in array array['projects','subscriptions','jobs','page_snapshots','opportunities','drafts','draft_revisions','gsc_daily','ai_checks','reports','usage_counters'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy workspace_owner_read on public.%I for select to authenticated using (workspace_id in (select id from public.workspaces where owner_id=(select auth.uid())))',t);
 end loop;
 foreach t in array array['usage_reservations','integrations','oauth_states','webhook_events','rate_buckets','product_events','email_events','email_suppressions'] loop execute format('alter table public.%I enable row level security',t); end loop;
END $$;
revoke all on public.workspaces,public.projects,public.subscriptions,public.jobs,public.page_snapshots,public.opportunities,public.drafts,public.draft_revisions,public.gsc_daily,public.ai_checks,public.reports,public.usage_counters,public.usage_reservations,public.integrations,public.oauth_states,public.webhook_events,public.rate_buckets,public.product_events,public.email_events,public.email_suppressions from anon,authenticated;
grant select on public.workspaces,public.projects,public.subscriptions,public.jobs,public.page_snapshots,public.opportunities,public.drafts,public.draft_revisions,public.gsc_daily,public.ai_checks,public.reports,public.usage_counters to authenticated;
grant all on public.workspaces,public.projects,public.subscriptions,public.jobs,public.page_snapshots,public.opportunities,public.drafts,public.draft_revisions,public.gsc_daily,public.ai_checks,public.reports,public.usage_counters,public.usage_reservations,public.integrations,public.oauth_states,public.webhook_events,public.rate_buckets,public.product_events,public.email_events,public.email_suppressions to service_role;
grant usage,select on sequence public.gsc_daily_id_seq,public.product_events_id_seq to service_role;
-- RPCs run with invoker permissions and are executable ONLY by service_role.
create function public.reserve_usage(p_workspace uuid,p_kind text,p_period text,p_amount int,p_limit int,p_key text) returns boolean language plpgsql security invoker set search_path='' as $$
 declare current_amount int;
 begin
 if p_amount<0 or p_limit<0 then raise exception 'invalid allowance'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace::text||p_kind||p_period,0));
 if exists(select 1 from public.usage_reservations where key=p_key and workspace_id=p_workspace and kind=p_kind and period=p_period) then return true; end if;
 insert into public.usage_counters(workspace_id,kind,period) values(p_workspace,p_kind,p_period) on conflict do nothing;
 select amount into current_amount from public.usage_counters where workspace_id=p_workspace and kind=p_kind and period=p_period for update;
 if current_amount+p_amount>p_limit then return false; end if;
 update public.usage_counters set amount=amount+p_amount where workspace_id=p_workspace and kind=p_kind and period=p_period;
 insert into public.usage_reservations(key,workspace_id,kind,period,amount) values(p_key,p_workspace,p_kind,p_period,p_amount);
 return true;
 end $$;
create function public.settle_usage(p_key text,p_actual int) returns void language plpgsql security invoker set search_path='' as $$
 declare r public.usage_reservations%rowtype;
 begin
 select * into r from public.usage_reservations where key=p_key for update;
 if not found or r.settled then return; end if;
 if p_actual<0 or p_actual>r.amount then raise exception 'invalid settlement'; end if;
 update public.usage_counters set amount=amount-r.amount+p_actual where workspace_id=r.workspace_id and kind=r.kind and period=r.period;
 update public.usage_reservations set amount=p_actual,settled=true where key=p_key;
 end $$;
create function public.take_rate(p_key text,p_limit int,p_seconds int) returns boolean language plpgsql security invoker set search_path='' as $$
 declare n int;
 begin
 insert into public.rate_buckets(key,amount,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds)) on conflict(key) do update set amount=case when public.rate_buckets.expires_at<now() then 1 else public.rate_buckets.amount+1 end,expires_at=case when public.rate_buckets.expires_at<now() then now()+make_interval(secs=>p_seconds) else public.rate_buckets.expires_at end returning amount into n;
 return n<=p_limit;
 end $$;
create function public.save_draft_revision(p_draft uuid,p_workspace uuid,p_content text) returns public.draft_revisions language plpgsql security invoker set search_path='' as $$
 declare next_version int; r public.draft_revisions;
 begin
 perform 1 from public.drafts where id=p_draft and workspace_id=p_workspace for update;
 if not found then raise exception 'draft not found'; end if;
 select coalesce(max(version),0)+1 into next_version from public.draft_revisions where draft_id=p_draft;
 insert into public.draft_revisions(workspace_id,draft_id,version,content) values(p_workspace,p_draft,next_version,p_content) returning * into r;
 return r;
 end $$;
revoke execute on function public.reserve_usage(uuid,text,text,int,int,text),public.settle_usage(text,int),public.take_rate(text,int,int),public.save_draft_revision(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_usage(uuid,text,text,int,int,text),public.settle_usage(text,int),public.take_rate(text,int,int),public.save_draft_revision(uuid,uuid,text) to service_role;
-- Private export bucket; all file reads go through checked, expiring server URLs.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('reports','reports',false,10000000,array['application/pdf','text/csv','application/json']) on conflict(id) do nothing;

create function public.create_project(p_workspace uuid,p_limit int,p_data jsonb) returns public.projects language plpgsql security invoker set search_path='' as $$
 declare r public.projects;
 begin
 perform 1 from public.workspaces where id=p_workspace for update;
 if not found then raise exception 'workspace missing'; end if;
 if (select count(*) from public.projects where workspace_id=p_workspace)>=p_limit then raise exception 'project_limit'; end if;
 insert into public.projects(workspace_id,name,url,description,country,language) values(p_workspace,p_data->>'name',p_data->>'url',p_data->>'description',p_data->>'country',p_data->>'language') returning * into r;
 return r;
 end $$;
create function public.replace_gsc_day(p_project uuid,p_workspace uuid,p_property text,p_date date,p_rows jsonb) returns void language plpgsql security invoker set search_path='' as $$
 begin
 perform 1 from public.projects where id=p_project and workspace_id=p_workspace and gsc_property=p_property for update;
 if not found then raise exception 'property changed or project missing'; end if;
 delete from public.gsc_daily where project_id=p_project and property=p_property and date=p_date and dataset in ('totals','detail');
 insert into public.gsc_daily(project_id,workspace_id,property,date,dataset,dimension_key,query,page,country,device,clicks,impressions,position)
 select p_project,p_workspace,p_property,p_date,r.dataset,r.dimension_key,r.query,r.page,r.country,r.device,r.clicks,r.impressions,r.position from jsonb_to_recordset(p_rows) as r(dataset text,dimension_key text,query text,page text,country text,device text,clicks double precision,impressions double precision,position double precision);
 end $$;
revoke execute on function public.create_project(uuid,int,jsonb),public.replace_gsc_day(uuid,uuid,text,date,jsonb) from public,anon,authenticated;
grant execute on function public.create_project(uuid,int,jsonb),public.replace_gsc_day(uuid,uuid,text,date,jsonb) to service_role;
alter table public.jobs add column usage_reserved int not null default 0,add column usage_consumed int not null default 0,add column provider_attempted boolean not null default false;
create function public.queue_job(p_id uuid,p_workspace uuid,p_project uuid,p_kind text,p_input jsonb,p_usage text,p_amount int,p_period text,p_limit int) returns public.jobs language plpgsql security invoker set search_path='' as $$
 declare r public.jobs;
 begin
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,1));
 select * into r from public.jobs where id=p_id;
 if found then
  if r.workspace_id<>p_workspace or r.project_id<>p_project or r.kind<>p_kind or r.input<>p_input then raise exception 'idempotency_conflict'; end if;
  return r;
 end if;
 perform 1 from public.projects where id=p_project and workspace_id=p_workspace;
 if not found then raise exception 'project missing'; end if;
 if p_usage is not null and not public.reserve_usage(p_workspace,p_usage,p_period,p_amount,p_limit,p_id::text) then raise exception 'quota_exhausted'; end if;
 insert into public.jobs(id,workspace_id,project_id,kind,input,usage_kind,usage_reserved) values(p_id,p_workspace,p_project,p_kind,p_input,p_usage,p_amount) returning * into r;
 return r;
 end $$;
revoke execute on function public.queue_job(uuid,uuid,uuid,text,jsonb,text,int,text,int) from public,anon,authenticated;
grant execute on function public.queue_job(uuid,uuid,uuid,text,jsonb,text,int,text,int) to service_role;
create function public.create_generated_draft(p_workspace uuid,p_project uuid,p_job uuid,p_title text,p_kind text,p_content text,p_metadata jsonb default '{}') returns uuid language plpgsql security invoker set search_path='' as $$
 declare d uuid;
 begin
 perform 1 from public.jobs where id=p_job and workspace_id=p_workspace and project_id=p_project for update;
 if not found then raise exception 'job not found'; end if;
 select id into d from public.drafts where source_job=p_job;
 if d is not null then return d; end if;
 insert into public.drafts(workspace_id,project_id,source_job,title,kind,metadata) values(p_workspace,p_project,p_job,p_title,p_kind,p_metadata) returning id into d;
 insert into public.draft_revisions(workspace_id,draft_id,version,content) values(p_workspace,d,1,p_content);
 return d;
 end $$;
revoke execute on function public.create_generated_draft(uuid,uuid,uuid,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_generated_draft(uuid,uuid,uuid,text,text,text,jsonb) to service_role;
alter table public.subscriptions add column synced_at timestamptz;
create table public.checkout_intents(id uuid primary key default gen_random_uuid(),workspace_id uuid not null unique references public.workspaces(id) on delete cascade,plan text not null,session_id text,session_url text,expires_at timestamptz not null);
alter table public.checkout_intents enable row level security;
revoke all on public.checkout_intents from anon,authenticated;
grant all on public.checkout_intents to service_role;
create function public.checkout_intent(p_workspace uuid,p_plan text) returns public.checkout_intents language plpgsql security invoker set search_path='' as $$
 declare r public.checkout_intents;
 begin
 perform 1 from public.workspaces where id=p_workspace for update;
 insert into public.checkout_intents(workspace_id,plan,expires_at) values(p_workspace,p_plan,now()+interval '1 hour') on conflict(workspace_id) do update set id=gen_random_uuid(),plan=excluded.plan,session_id=null,session_url=null,expires_at=excluded.expires_at where public.checkout_intents.expires_at<now();
 select * into r from public.checkout_intents where workspace_id=p_workspace;
 return r;
 end $$;
create function public.sync_subscription(p_workspace uuid,p_observed timestamptz,p_state jsonb) returns void language plpgsql security invoker set search_path='' as $$
 begin
 insert into public.subscriptions(workspace_id,stripe_customer,stripe_subscription,plan,status,period_start,period_end,cancel_at_period_end,synced_at)
 values(p_workspace,p_state->>'stripe_customer',p_state->>'stripe_subscription',p_state->>'plan',p_state->>'status',(p_state->>'period_start')::timestamptz,(p_state->>'period_end')::timestamptz,(p_state->>'cancel_at_period_end')::boolean,p_observed)
 on conflict(workspace_id) do update set stripe_customer=excluded.stripe_customer,stripe_subscription=excluded.stripe_subscription,plan=excluded.plan,status=excluded.status,period_start=excluded.period_start,period_end=excluded.period_end,cancel_at_period_end=excluded.cancel_at_period_end,synced_at=excluded.synced_at,updated_at=now()
 where (public.subscriptions.synced_at is null or public.subscriptions.synced_at<=p_observed) and (public.subscriptions.stripe_customer is null or public.subscriptions.stripe_customer=excluded.stripe_customer);
 end $$;
revoke execute on function public.checkout_intent(uuid,text),public.sync_subscription(uuid,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.checkout_intent(uuid,text),public.sync_subscription(uuid,timestamptz,jsonb) to service_role;
create table public.free_audits(hash text primary key,snapshot jsonb not null,expires_at timestamptz not null);
alter table public.free_audits enable row level security;
revoke all on public.free_audits from anon,authenticated;
grant all on public.free_audits to service_role;
create function public.adopt_free_audit(p_hash text,p_workspace uuid,p_project uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
 declare r public.free_audits; p public.projects; j uuid;
 begin
 select * into p from public.projects where id=p_project and workspace_id=p_workspace for update;
 if not found then raise exception 'project missing'; end if;
 select * into r from public.free_audits where hash=p_hash and expires_at>now() for update;
 if not found or r.snapshot->>'url'<>p.url then return null; end if;
 j:=gen_random_uuid();
 if not public.reserve_usage(p_workspace,'pages','free-lifetime',1,1,j::text) then return null; end if;
 insert into public.jobs(id,workspace_id,project_id,kind,status,stage,input,output,usage_reserved,usage_consumed) values(j,p_workspace,p_project,'crawl','completed','Free page audit saved','{"kind":"crawl","limit":1}',jsonb_build_object('successful',1,'source','Public HTML response'),1,1);
 insert into public.page_snapshots(workspace_id,project_id,job_id,url,snapshot) values(p_workspace,p_project,j,r.snapshot->>'finalUrl',r.snapshot);
 perform public.settle_usage(j::text,1);
 delete from public.free_audits where hash=p_hash;
 return r.snapshot;
 end $$;
revoke execute on function public.adopt_free_audit(text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.adopt_free_audit(text,uuid,uuid) to service_role;
create table public.provider_receipts(job_id uuid not null references public.jobs(id) on delete cascade,operation text not null,status text not null check(status in ('started','completed')),response jsonb,created_at timestamptz not null default now(),primary key(job_id,operation));
alter table public.provider_receipts enable row level security;
revoke all on public.provider_receipts from anon,authenticated;
grant all on public.provider_receipts to service_role;
-- Composite foreign keys enforce ownership even if a service write is malformed.
alter table public.jobs add unique(id,workspace_id);
alter table public.drafts add unique(id,workspace_id);
alter table public.page_snapshots add foreign key(job_id,workspace_id) references public.jobs(id,workspace_id) on delete cascade;
alter table public.draft_revisions add foreign key(draft_id,workspace_id) references public.drafts(id,workspace_id) on delete cascade;
alter table public.drafts add foreign key(source_job,workspace_id) references public.jobs(id,workspace_id);
alter table public.ai_checks add foreign key(job_id,workspace_id) references public.jobs(id,workspace_id);
alter table public.reports add foreign key(job_id,workspace_id) references public.jobs(id,workspace_id);
alter table public.integrations add foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade;
alter table public.oauth_states add foreign key(project_id,workspace_id) references public.projects(id,workspace_id) on delete cascade;
-- Search demand is derived only from detailed, observed records in the selected property.
create function public.gsc_opportunity_signals(p_project uuid,p_workspace uuid,p_property text,p_since date) returns table(query text,page text,clicks double precision,impressions double precision,"position" double precision) language sql security invoker set search_path='' as $$
 select g.query,g.page,sum(g.clicks),sum(g.impressions),case when sum(g.impressions)>0 then sum(g.position*g.impressions)/sum(g.impressions) else 0 end
 from public.gsc_daily g where g.project_id=p_project and g.workspace_id=p_workspace and g.property=p_property and g.dataset='detail' and g.date>=p_since and g.query<>'' and g.page<>''
 group by g.query,g.page having sum(g.impressions)>=20 order by sum(g.impressions) desc limit 30
 $$;
revoke execute on function public.gsc_opportunity_signals(uuid,uuid,text,date) from public,anon,authenticated;
grant execute on function public.gsc_opportunity_signals(uuid,uuid,text,date) to service_role;
