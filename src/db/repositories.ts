// src/db/repositories.ts — Typed CRUD

import { getDb } from './client';
import { classifyBP } from '../lib/oms';

export interface Profile {
  name: string;
  age: number;
  sex: 'M' | 'F';
  weight_kg: number;
  height_cm: number;
  goal_sys: number;
}

export interface Reading {
  id: string;
  ts: string;           // ISO datetime
  sys: number;
  dia: number;
  pulse: number;
  moment: 'morning' | 'afternoon' | 'evening' | null;
  note: string;
  category_id: string;
}

export interface Reminder {
  id: number;
  time_hhmm: string;    // "08:00"
  label: string;
  days_mask: number;    // bitmask Mon..Sun
  enabled: boolean;
  notification_id: string | null;
}

// ---------- Profile ----------
export async function getProfile(): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Profile>(`SELECT * FROM profile WHERE id = 1`);
  return row ?? null;
}

export async function saveProfile(p: Profile): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO profile(id, name, age, sex, weight_kg, height_cm, goal_sys)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, age=excluded.age, sex=excluded.sex,
       weight_kg=excluded.weight_kg, height_cm=excluded.height_cm,
       goal_sys=excluded.goal_sys`,
    [p.name, p.age, p.sex, p.weight_kg, p.height_cm, p.goal_sys]
  );
}

// ---------- Readings ----------
export async function listReadings(limit = 500): Promise<Reading[]> {
  const db = await getDb();
  return db.getAllAsync<Reading>(
    `SELECT * FROM readings ORDER BY ts ASC LIMIT ?`, [limit]
  );
}

export async function addReading(r: Omit<Reading, 'id' | 'category_id'>): Promise<Reading> {
  const db = await getDb();
  const id = `r-${Date.now()}`;
  const cat = classifyBP(r.sys, r.dia);
  await db.runAsync(
    `INSERT INTO readings(id, ts, sys, dia, pulse, moment, note, category_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, r.ts, r.sys, r.dia, r.pulse, r.moment, r.note, cat.id]
  );
  return { ...r, id, category_id: cat.id };
}

export async function deleteReading(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM readings WHERE id = ?`, [id]);
}

export async function readingsSince(isoDate: string): Promise<Reading[]> {
  const db = await getDb();
  return db.getAllAsync<Reading>(
    `SELECT * FROM readings WHERE ts >= ? ORDER BY ts ASC`, [isoDate]
  );
}

// ---------- Reminders ----------
export async function listReminders(): Promise<Reminder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM reminders ORDER BY time_hhmm ASC`);
  return rows.map(r => ({ ...r, enabled: !!r.enabled }));
}

export async function getReminderById(id: number): Promise<Reminder | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(`SELECT * FROM reminders WHERE id = ?`, [id]);
  return row ? { ...row, enabled: !!row.enabled } : null;
}

export async function upsertReminder(r: Omit<Reminder, 'id'> & { id?: number }): Promise<number> {
  const db = await getDb();
  if (r.id) {
    await db.runAsync(
      `UPDATE reminders SET time_hhmm=?, label=?, days_mask=?, enabled=?, notification_id=?
       WHERE id=?`,
      [r.time_hhmm, r.label, r.days_mask, r.enabled ? 1 : 0, r.notification_id, r.id]
    );
    return r.id;
  }
  const res = await db.runAsync(
    `INSERT INTO reminders(time_hhmm, label, days_mask, enabled, notification_id)
     VALUES (?, ?, ?, ?, ?)`,
    [r.time_hhmm, r.label, r.days_mask, r.enabled ? 1 : 0, r.notification_id]
  );
  return res.lastInsertRowId;
}

// ---------- Settings ----------
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key=?`, [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, value]
  );
}

// ---------- Backups ----------
export async function logBackup(driveFileId: string | null, recordCount: number, status = 'ok') {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO backups(drive_file_id, record_count, status) VALUES (?, ?, ?)`,
    [driveFileId, recordCount, status]
  );
}

export async function listBackups(limit = 20) {
  const db = await getDb();
  return db.getAllAsync<any>(
    `SELECT * FROM backups ORDER BY ts DESC LIMIT ?`, [limit]
  );
}
