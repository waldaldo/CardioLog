import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  listReadings, getProfile, logBackup,
  saveProfile, clearAllReadings, insertReadingRaw,
  Profile, Reading,
} from '../db/repositories';

export interface BackupFile {
  name: string;
  modifiedTime: string;
}

export interface BackupPayload {
  version: number;
  exported_at: string;
  profile: Profile;
  readings: Reading[];
  encrypted?: boolean;
}

function xorEncrypt(data: string, key: string): string {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return String.fromCharCode(...result);
}

function toBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1] ?? 0, b2 = bytes[i + 2] ?? 0;
    result += chars[b0 >> 2] + chars[((b0 & 3) << 4) | (b1 >> 4)] + (i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=') + (i + 2 < bytes.length ? chars[b2 & 63] : '=');
  }
  return result;
}

function fromBase64(b64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const e0 = chars.indexOf(clean[i]), e1 = chars.indexOf(clean[i + 1] ?? '=');
    const e2 = chars.indexOf(clean[i + 2] ?? '='), e3 = chars.indexOf(clean[i + 3] ?? '=');
    bytes.push((e0 << 2) | (e1 >> 4), ((e1 & 15) << 4) | (e2 >> 2), ((e2 & 3) << 6) | e3);
  }
  return String.fromCharCode(...bytes.slice(0, -1));
}

export async function backupNow(encrypted = false, password = ''): Promise<{ count: number }> {
  const profile = await getProfile();
  const readings = await listReadings(10000);

  let json = JSON.stringify({ version: 1, exported_at: new Date().toISOString(), profile, readings });
  let finalJson = json;

  if (encrypted && password) {
    const key = password.repeat(16).slice(0, 16);
    finalJson = JSON.stringify({
      encrypted: true,
      data: toBase64(xorEncrypt(json, key)),
    });
  }

  const filename = `cardiolog-backup-${new Date().toISOString().slice(0, 10)}${encrypted ? '-encrypted' : ''}.json`;

  const cacheUri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(cacheUri, finalJson);

  const docUri = FileSystem.documentDirectory + filename;
  await FileSystem.copyAsync({ from: cacheUri, to: docUri });

  await Sharing.shareAsync(cacheUri, {
    mimeType: 'application/json',
    dialogTitle: 'Guardar respaldo de CardioLog',
  });

  await logBackup(null, readings.length);
  return { count: readings.length };
}

// Abre el selector de archivos, lee el JSON y devuelve el contenido validado.
// Si está cifrado con XOR+Base64, el usuario debe proporcionar la contraseña.
export async function pickAndReadBackup(password = ''): Promise<BackupPayload> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('cancelled');
  }

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('invalidFile');
  }

  if (!parsed.profile && !parsed.readings && !parsed.encrypted) {
    throw new Error('notBackup');
  }

  if (parsed.encrypted) {
    if (!password) {
      throw new Error('passwordRequired');
    }
    const key = password.repeat(16).slice(0, 16);
    const decrypted = xorEncrypt(fromBase64(parsed.data), key);
    try {
      parsed = JSON.parse(decrypted);
    } catch {
      throw new Error('wrongPassword');
    }
  }

  if (!parsed.profile || !Array.isArray(parsed.readings)) {
    throw new Error('notBackup');
  }

  return parsed as BackupPayload;
}

// Reemplaza el perfil y todas las mediciones con los datos del respaldo.
export async function restoreBackup(payload: BackupPayload): Promise<{ count: number }> {
  await saveProfile(payload.profile);
  await clearAllReadings();
  for (const r of payload.readings) {
    await insertReadingRaw(r);
  }
  return { count: payload.readings.length };
}

// Lista los archivos de respaldo guardados en documentDirectory.
export async function listLocalBackups(): Promise<BackupFile[]> {
  try {
    const dir = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
    const backups = dir.filter(n => n.startsWith('cardiolog-backup-') && n.endsWith('.json'));
    const result: BackupFile[] = [];
    for (const name of backups) {
      const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + name);
      result.push({
        name,
        modifiedTime: info.exists && info.modificationTime
          ? new Date(info.modificationTime * 1000).toISOString()
          : '',
      });
    }
    return result.sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime));
  } catch {
    return [];
  }
}
