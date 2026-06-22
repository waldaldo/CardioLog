export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('M','F')),
  weight_kg REAL NOT NULL,
  height_cm REAL NOT NULL,
  goal_sys INTEGER NOT NULL DEFAULT 130,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS readings (
  id TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  sys INTEGER NOT NULL,
  dia INTEGER NOT NULL,
  pulse INTEGER NOT NULL,
  moment TEXT CHECK (moment IN ('morning','afternoon','evening')),
  note TEXT DEFAULT '',
  category_id TEXT NOT NULL,
  synced_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings(ts DESC);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_hhmm TEXT NOT NULL,
  label TEXT NOT NULL,
  days_mask INTEGER NOT NULL DEFAULT 127,
  enabled INTEGER NOT NULL DEFAULT 1,
  notification_id TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  drive_file_id TEXT,
  record_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok'
);
`;

export const DEFAULT_SETTINGS: Record<string, string> = {
  lang: 'es',
  theme: 'dark',
  accent: 'cyan',
  autoBackup: '1',
  backupFrequency: 'daily',
};
