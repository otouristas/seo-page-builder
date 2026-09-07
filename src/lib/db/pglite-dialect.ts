import type { PGlite } from "@electric-sql/pglite";
import {
  CompiledQuery,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type DialectAdapter,
  type Driver,
  type Kysely,
  type QueryCompiler,
  type QueryResult,
} from "kysely";

/**
 * Minimal Kysely dialect for the embedded PGLite database (dev / preview).
 * PGLite is single-connection; it serializes queries internally.
 */
export class PGliteDialect implements Dialect {
  constructor(private readonly client: PGlite) {}
  createAdapter(): DialectAdapter {
    return new PostgresAdapter();
  }
  createDriver(): Driver {
    return new PGliteDriver(this.client);
  }
  createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
    return new PostgresIntrospector(db);
  }
  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }
}

class PGliteDriver implements Driver {
  constructor(private readonly client: PGlite) {}
  async init() {}
  async acquireConnection(): Promise<DatabaseConnection> {
    return new PGliteConnection(this.client);
  }
  async beginTransaction(conn: DatabaseConnection) {
    await conn.executeQuery(CompiledQuery.raw("BEGIN"));
  }
  async commitTransaction(conn: DatabaseConnection) {
    await conn.executeQuery(CompiledQuery.raw("COMMIT"));
  }
  async rollbackTransaction(conn: DatabaseConnection) {
    await conn.executeQuery(CompiledQuery.raw("ROLLBACK"));
  }
  async releaseConnection() {}
  async destroy() {
    await this.client.close();
  }
}

class PGliteConnection implements DatabaseConnection {
  constructor(private readonly client: PGlite) {}
  async executeQuery<R>(query: CompiledQuery): Promise<QueryResult<R>> {
    const res = await this.client.query<R>(query.sql, [...query.parameters]);
    return { rows: res.rows, numAffectedRows: BigInt(res.affectedRows ?? 0) };
  }
  async *streamQuery(): AsyncIterableIterator<QueryResult<never>> {
    throw new Error("PGlite does not support streaming queries.");
  }
}
