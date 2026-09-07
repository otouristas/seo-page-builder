-- Anonymous product events that power the live counters on the landing page.
create table if not exists lab_events (
  id          serial primary key,
  kind        text not null,
  domain_hash text,
  created_at  timestamptz not null default now()
);
create index if not exists lab_events_kind_idx on lab_events (kind);
