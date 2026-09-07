create table if not exists gsc_rows (
  id           serial primary key,
  user_id      text not null,
  query        text not null,
  clicks       integer not null default 0,
  impressions  integer not null default 0,
  ctr          double precision not null default 0,
  position     double precision not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists gsc_rows_user_id_idx on gsc_rows (user_id);

create table if not exists dataforseo_usage (
  user_id   text not null,
  day       date not null,
  used      integer not null default 0,
  primary key (user_id, day)
);
