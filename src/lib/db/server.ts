import { Kysely, PostgresDialect, sql, type Dialect } from "kysely";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env.server";

export type Database = {
  gsc_rows: {
    id?: number;
    user_id: string;
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    created_at?: Date;
  };
  dataforseo_usage: { user_id: string; day: string; used: number };
  lab_events: { id?: number; kind: string; domain_hash: string | null; created_at?: Date };
};

let dbPromise: Promise<Kysely<Database>> | null = null;
let dialectPromise: Promise<Dialect> | null = null;

export function dbMode(): "postgres" | "pglite" {
  return env("DATABASE_URL") ? "postgres" : "pglite";
}

/** The Kysely dialect shared by the app tables and Better Auth. */
export function getDialect(): Promise<Dialect> {
  if (!dialectPromise) {
    dialectPromise = (async () => {
      const url = env("DATABASE_URL");
      if (url) {
        const { Pool } = await import("pg");
        return new PostgresDialect({ pool: new Pool({ connectionString: url, max: 5 }) });
      }
      const { PGlite } = await import("@electric-sql/pglite");
      const { PGliteDialect } = await import("./pglite-dialect");
      const dir = env("PGLITE_DIR") ?? path.resolve(process.cwd(), ".data/pglite");
      await mkdir(dir, { recursive: true });
      const client = await PGlite.create(dir);
      return new PGliteDialect(client);
    })();
  }
  return dialectPromise;
}

async function runMigrations(db: Kysely<Database>) {
  const dir = path.resolve(process.cwd(), "migrations");
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return;
  }
  for (const file of files) {
    const text = await readFile(path.join(dir, file), "utf8");
    const statements = text
      .split(/;\s*(?:\r?\n|$)/)
      .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
      .filter(Boolean);
    for (const statement of statements) {
      await sql.raw(statement).execute(db);
    }
  }
}

/** Singleton DB. Migrations are idempotent (`if not exists`) and run once per process. */
export function getDb(): Promise<Kysely<Database>> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const dialect = await getDialect();
      const db = new Kysely<Database>({ dialect });
      if (env("SKIP_MIGRATIONS") !== "true") await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

export function hashDomain(host: string): string {
  return createHash("sha256").update(host.toLowerCase()).digest("hex").slice(0, 16);
}

export async function recordEvent(kind: string, host?: string) {
  const db = await getDb();
  await db
    .insertInto("lab_events")
    .values({ kind, domain_hash: host ? hashDomain(host) : null })
    .execute();
}

export async function countEvents(): Promise<{ analyses: number; keywords: number; plays: number }> {
  const db = await getDb();
  const rows = await db
    .selectFrom("lab_events")
    .select(["kind", db.fn.countAll<number>().as("n")])
    .groupBy("kind")
    .execute();
  const get = (k: string) => Number(rows.find((r) => r.kind === k)?.n ?? 0);
  return { analyses: get("analyze"), keywords: get("stage"), plays: get("play") };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
