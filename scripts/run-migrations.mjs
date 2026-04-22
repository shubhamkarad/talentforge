// Apply supabase/migrations/*.sql against a DATABASE_URL.
// Usage: DATABASE_URL=postgres://... node scripts/run-migrations.mjs
//
// Intended for CI deploys against the remote Supabase Postgres. For local
// development use `supabase db reset` instead — this script won't reset any
// existing state, it only runs forward migrations it hasn't seen yet.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const migrationsDir = join(root, 'supabase', 'migrations');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function ensureLedger() {
  await client.query(`
    create schema if not exists _migrations;
    create table if not exists _migrations.ledger (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function applied() {
  const { rows } = await client.query('select id from _migrations.ledger');
  return new Set(rows.map((r) => r.id));
}

async function run() {
  await client.connect();
  try {
    await ensureLedger();
    const seen = await applied();

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (seen.has(file)) {
        console.log(`skip ${file}`);
        continue;
      }
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      console.log(`apply ${file}`);
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into _migrations.ledger (id) values ($1)', [file]);
        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        console.error(`failed ${file}:`, err.message);
        process.exit(1);
      }
    }
    console.log('migrations up to date');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
