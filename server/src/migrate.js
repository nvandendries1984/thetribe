// Migration runner: applies migrations in order, tracks in 'migrations' collection
import fs from 'fs';
import path from 'path';
import { connectDB, getConnection } from './db/index.js';

async function getAppliedMigrations(db) {
  return db.collection('migrations').find().sort({ appliedAt: 1 }).toArray();
}

async function runMigrations() {
  await connectDB();
  const db = getConnection().db;
  const migrationsDir = path.resolve('migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => /^V\d+_.*\.js$/.test(f))
    .sort();
  const applied = await getAppliedMigrations(db);
  const appliedNames = new Set(applied.map(m => m.name));
  for (const file of files) {
    if (appliedNames.has(file)) continue;
    const migration = await import(path.join(migrationsDir, file));
    if (typeof migration.up === 'function') {
      await migration.up(db);
      await db.collection('migrations').insertOne({
        name: file,
        appliedAt: new Date(),
      });
      console.log(`Applied migration: ${file}`);
    }
  }
  process.exit(0);
}

runMigrations().catch(e => {
  console.error(e);
  process.exit(1);
});
