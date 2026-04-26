// src/db/client.ts — SQLite client wrapper

import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL, DEFAULT_SETTINGS } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;
let _pending: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_pending) return _pending;
  _pending = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync('cardiolog.db');
      await db.execAsync(SCHEMA_SQL);
      for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        await db.runAsync(
          `INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)`,
          [k, v]
        );
      }
      _db = db;
      return db;
    } finally {
      _pending = null;
    }
  })();
  return _pending;
}

export async function resetDb() {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS readings;
    DROP TABLE IF EXISTS profile;
    DROP TABLE IF EXISTS reminders;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS backups;
  `);
  _db = null;
  _pending = null;
  await getDb();
}
