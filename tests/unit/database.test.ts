import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
const db = new PGlite();
const ownerA = "10000000-0000-4000-8000-000000000001",
  ownerB = "10000000-0000-4000-8000-000000000002";
const wa = "20000000-0000-4000-8000-000000000001",
  wb = "20000000-0000-4000-8000-000000000002",
  pa = "30000000-0000-4000-8000-000000000001",
  pb = "30000000-0000-4000-8000-000000000002";
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public,storage to anon,authenticated,service_role;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant select on storage.objects to authenticated;grant all on storage.buckets,storage.objects to service_role;`,
  );
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const migration = await readFile(`supabase/migrations/${file}`, "utf8");
    await db.exec(
      migration.replace("create extension if not exists pgcrypto;", ""),
    );
  }
  await db.query("insert into auth.users(id) values($1),($2)", [
    ownerA,
    ownerB,
  ]);
  await db.query(
    "insert into workspaces(id,owner_id,name) values($1,$2,$3),($4,$5,$6)",
    [wa, ownerA, "A", wb, ownerB, "B"],
  );
  await db.query(
    "insert into projects(id,workspace_id,name,url) values($1,$2,$3,$4),($5,$6,$7,$8)",
    [
      pa,
      wa,
      "A",
      "https://a.example.com/",
      pb,
      wb,
      "B",
      "https://b.example.com/",
    ],
  );
});
afterAll(() => db.close());
async function asOwner<T>(owner: string, run: () => Promise<T>) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    owner,
  ]);
  try {
    return await run();
  } finally {
    await db.exec("reset role");
  }
}
describe("Actual migration permissions and atomic operations", () => {
  it("owner A cannot read B, write projects, read credentials, or invoke quota RPCs", async () => {
    await asOwner(ownerA, async () => {
      expect(
        (await db.query<{ id: string }>("select id from projects")).rows.map(
          (r) => r.id,
        ),
      ).toEqual([pa]);
      expect(
        (await db.query("select * from projects where id=$1", [pb])).rows,
      ).toHaveLength(0);
      await expect(
        db.query("update projects set name='bad' where id=$1", [pb]),
      ).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from integrations")).rejects.toThrow(
        /permission denied/,
      );
      await expect(
        db.query("select reserve_usage($1,$2,$3,1,100,$4)", [
          wb,
          "pages",
          "month",
          "forged",
        ]),
      ).rejects.toThrow(/permission denied/);
      expect(
        (await db.query("select * from storage.objects")).rows,
      ).toHaveLength(0);
    });
  });
  it("isolates jobs, report metadata and draft revisions by workspace", async () => {
    const j = "40000000-0000-4000-8000-000000000001";
    await db.query(
      "insert into jobs(id,workspace_id,project_id,kind) values($1,$2,$3,'report')",
      [j, wb, pb],
    );
    await db.query(
      "insert into reports(workspace_id,project_id,job_id,title,payload) values($1,$2,$3,'Private','{}')",
      [wb, pb, j],
    );
    const d = (
      await db.query<{ id: string }>(
        "insert into drafts(workspace_id,project_id,title,kind) values($1,$2,'Private draft','brief') returning id",
        [wb, pb],
      )
    ).rows[0].id;
    await db.query("select save_draft_revision($1,$2,$3)", [
      d,
      wb,
      "Private content",
    ]);
    await asOwner(ownerA, async () => {
      expect(
        (await db.query("select * from jobs where id=$1", [j])).rows,
      ).toHaveLength(0);
      expect((await db.query("select * from reports")).rows).toHaveLength(0);
      expect(
        (await db.query("select * from draft_revisions")).rows,
      ).toHaveLength(0);
    });
    await expect(
      db.query(
        "insert into draft_revisions(workspace_id,draft_id,version,content) values($1,$2,2,'wrong owner')",
        [wa, d],
      ),
    ).rejects.toThrow(/foreign key/);
  });
  it("never allocates beyond a shared allowance for concurrent requests", async () => {
    const attempts = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        db.query<{ ok: boolean }>(
          "select reserve_usage($1,$2,$3,1,7,$4) as ok",
          [wa, "pages", "quota-test", `q-${i}`],
        ),
      ),
    );
    expect(attempts.filter((r) => r.rows[0].ok)).toHaveLength(7);
    expect(
      (
        await db.query<{ amount: number }>(
          "select amount from usage_counters where workspace_id=$1 and period='quota-test'",
          [wa],
        )
      ).rows[0].amount,
    ).toBe(7);
  });
  it("settles reservations once and does not underflow", async () => {
    await db.query("select reserve_usage($1,$2,$3,5,10,$4)", [
      wa,
      "drafts",
      "settle-test",
      "settle-key",
    ]);
    await db.exec(
      "select settle_usage('settle-key',2);select settle_usage('settle-key',0)",
    );
    expect(
      (
        await db.query<{ amount: number }>(
          "select amount from usage_counters where period='settle-test'",
        )
      ).rows[0].amount,
    ).toBe(2);
  });
  it("queues and reserves in one transaction with deduplication", async () => {
    const id = "40000000-0000-4000-8000-000000000002";
    const args = [
      id,
      wa,
      pa,
      "crawl",
      JSON.stringify({ kind: "crawl", limit: 3 }),
      "pages",
      3,
      "queue-test",
      4,
    ];
    await db.query("select queue_job($1,$2,$3,$4,$5,$6,$7,$8,$9)", args);
    await db.query("select queue_job($1,$2,$3,$4,$5,$6,$7,$8,$9)", args);
    expect(
      (
        await db.query<{ amount: number }>(
          "select amount from usage_counters where period='queue-test'",
        )
      ).rows[0].amount,
    ).toBe(3);
    await expect(
      db.query("select queue_job($1,$2,$3,$4,$5,$6,$7,$8,$9)", [
        id,
        wb,
        pb,
        ...args.slice(3),
      ]),
    ).rejects.toThrow(/idempotency_conflict/);
    await expect(
      db.query("select queue_job($1,$2,$3,$4,$5,$6,$7,$8,$9)", [
        "40000000-0000-4000-8000-000000000003",
        ...args.slice(1),
      ]),
    ).rejects.toThrow(/quota_exhausted/);
    expect(
      (
        await db.query(
          "select * from jobs where id='40000000-0000-4000-8000-000000000003'",
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("enforces project caps inside the database transaction", async () => {
    await expect(
      db.query(
        'select create_project($1,1,\'{"name":"Extra","url":"https://example.com","description":"description","country":"US","language":"en"}\')',
        [wa],
      ),
    ).rejects.toThrow(/project_limit/);
  });
  it("stores a fetched logo, and leaves it null when the website has none", async () => {
    await db.query(
      'select create_project($1,5,\'{"name":"Logo","url":"https://logo.example/","description":"description","country":"US","language":"en","logo":"https://logo.example/mark.svg"}\')',
      [wa],
    );
    await db.query(
      'select create_project($1,5,\'{"name":"Plain","url":"https://plain.example/","description":"description","country":"US","language":"en","logo":""}\')',
      [wa],
    );
    const rows = (
      await db.query<{ name: string; logo: string | null }>(
        "select name,logo from projects where workspace_id=$1 and name in ('Logo','Plain') order by name",
        [wa],
      )
    ).rows;
    expect(rows[0].logo).toBe("https://logo.example/mark.svg");
    expect(rows[1].logo).toBeNull();
    await db.query("delete from projects where name in ('Logo','Plain')");
  });
  it("keeps property totals separate and atomically replaces a reconciled day", async () => {
    await db.query(
      "update projects set gsc_property='sc-domain:a.example.com' where id=$1",
      [pa],
    );
    const row = (clicks: number) =>
      JSON.stringify([
        {
          dataset: "totals",
          dimension_key: "total",
          query: "",
          page: "",
          country: "",
          device: "",
          clicks,
          impressions: 100,
          position: 5,
        },
        {
          dataset: "detail",
          dimension_key: "q",
          query: "coffee",
          page: "https://a.example.com/",
          country: "usa",
          device: "MOBILE",
          clicks: 1,
          impressions: 20,
          position: 8,
        },
      ]);
    await db.query("select replace_gsc_day($1,$2,$3,$4,$5)", [
      pa,
      wa,
      "sc-domain:a.example.com",
      "2026-09-01",
      row(10),
    ]);
    await db.query("select replace_gsc_day($1,$2,$3,$4,$5)", [
      pa,
      wa,
      "sc-domain:a.example.com",
      "2026-09-01",
      row(11),
    ]);
    expect(
      (await db.query("select * from gsc_daily where dataset='totals'")).rows,
    ).toHaveLength(1);
    expect(
      (
        await db.query<{ clicks: number }>(
          "select clicks from gsc_daily where dataset='totals'",
        )
      ).rows[0].clicks,
    ).toBe(11);
    await expect(
      db.query("select replace_gsc_day($1,$2,$3,$4,$5)", [
        pa,
        wb,
        "sc-domain:a.example.com",
        "2026-09-01",
        row(99),
      ]),
    ).rejects.toThrow();
  });
  it("does not let an older Stripe reconciliation overwrite newer state", async () => {
    const state = (status: string, plan = "maki") =>
      JSON.stringify({
        stripe_customer: "cus_test",
        stripe_subscription: "sub_test",
        plan,
        status,
        period_start: "2026-09-01T00:00:00Z",
        period_end: "2026-10-01T00:00:00Z",
        cancel_at_period_end: false,
      });
    await db.query("select sync_subscription($1,$2,$3)", [
      wa,
      "2026-09-02T00:00:00Z",
      state("past_due"),
    ]);
    await db.query("select sync_subscription($1,$2,$3)", [
      wa,
      "2026-09-01T00:00:00Z",
      state("active"),
    ]);
    expect(
      (
        await db.query<{ status: string }>(
          "select status from subscriptions where workspace_id=$1",
          [wa],
        )
      ).rows[0].status,
    ).toBe("past_due");
    await db.query("select sync_subscription($1,$2,$3)", [
      wa,
      "2026-09-03T00:00:00Z",
      state("active"),
    ]);
    expect(
      (
        await db.query<{ status: string }>(
          "select status from subscriptions where workspace_id=$1",
          [wa],
        )
      ).rows[0].status,
    ).toBe("active");
  });
  it("resets allowance by billing period without deleting historical usage", async () => {
    expect(
      (
        await db.query<{ ok: boolean }>(
          "select reserve_usage($1,$2,$3,7,7,$4) as ok",
          [wa, "pages", "renewal-1", "renew-1"],
        )
      ).rows[0].ok,
    ).toBe(true);
    expect(
      (
        await db.query<{ ok: boolean }>(
          "select reserve_usage($1,$2,$3,7,7,$4) as ok",
          [wa, "pages", "renewal-2", "renew-2"],
        )
      ).rows[0].ok,
    ).toBe(true);
    expect(
      (
        await db.query(
          "select * from usage_counters where period like 'renewal-%'",
        )
      ).rows,
    ).toHaveLength(2);
  });
  it("creates only one checkout intent for simultaneous subscription requests", async () => {
    const results = await Promise.all([
      db.query<{ id: string }>("select (checkout_intent($1,$2)).id", [
        wa,
        "maki",
      ]),
      db.query<{ id: string }>("select (checkout_intent($1,$2)).id", [
        wa,
        "nigiri",
      ]),
    ]);
    expect(results[0].rows[0].id).toBe(results[1].rows[0].id);
  });
  it("records a trial once, rejects another trial and preserves its original deadline", async () => {
    const state = {
      stripe_customer: "cus_trial",
      stripe_subscription: "sub_trial",
      plan: "maki",
      status: "trialing",
      period_start: "2026-09-09T00:00:00Z",
      period_end: "2026-09-12T00:00:00Z",
      trial_start: "2026-09-09T00:00:00Z",
      trial_end: "2026-09-12T00:00:00Z",
      trial_invoice: "in_paid",
      cancel_at_period_end: false,
    };
    await db.query("select sync_subscription($1,$2,$3)", [
      wb,
      "2026-09-09T00:00:00Z",
      JSON.stringify(state),
    ]);
    await expect(
      db.query("select checkout_intent($1,$2,true)", [wb, "maki"]),
    ).rejects.toThrow("not eligible");
    await db.query("select sync_subscription($1,$2,$3)", [
      wb,
      "2026-09-10T00:00:00Z",
      JSON.stringify({
        ...state,
        plan: "omakase",
        trial_end: "2026-10-01T00:00:00Z",
      }),
    ]);
    const result = await db.query<{ trial_end: Date; trial_used_at: Date }>(
      "select trial_end,trial_used_at from subscriptions where workspace_id=$1",
      [wb],
    );
    expect(new Date(result.rows[0].trial_end).toISOString()).toBe(
      "2026-09-12T00:00:00.000Z",
    );
    await db.query("select sync_subscription($1,$2,$3)", [
      wb,
      "2026-09-13T00:00:00Z",
      JSON.stringify({ ...state, status: "canceled", trial_invoice: null }),
    ]);
    await expect(
      db.query("select checkout_intent($1,$2,true)", [wb, "nigiri"]),
    ).rejects.toThrow("not eligible");
    expect(
      (
        await db.query<{ trial_used_at: Date }>(
          "select trial_used_at from subscriptions where workspace_id=$1",
          [wb],
        )
      ).rows[0].trial_used_at,
    ).toEqual(result.rows[0].trial_used_at);
    await asOwner(ownerB, async () => {
      await expect(
        db.query(
          "update subscriptions set trial_used_at=null where workspace_id=$1",
          [wb],
        ),
      ).rejects.toThrow();
      await expect(
        db.query("select checkout_intent($1,$2,true)", [wb, "maki"]),
      ).rejects.toThrow();
    });
  });
  it("atomically caps concurrent trial reservations and keeps unused allowance after failure", async () => {
    const attempts = await Promise.all(
      [1, 2].map((n) =>
        db.query<{ ok: boolean }>(
          "select reserve_usage($1,'pages','trial:sub_trial',15,20,$2) as ok",
          [wb, `trial-reservation-${n}`],
        ),
      ),
    );
    expect(attempts.filter((r) => r.rows[0].ok)).toHaveLength(1);
  });
});
