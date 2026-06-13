import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import CryptoJS from 'crypto-js';
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

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_SIZE_WORDS = 256 / 32; // 256-bit key, 8 words (32 bits each)

interface EncryptedEnvelope {
  v: 2;
  kdf: 'pbkdf2-sha256-100k';
  salt: string;
  iv: string;
  data: string;
}

function encryptPayload(plaintext: string, password: string): EncryptedEnvelope {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: PBKDF2_KEY_SIZE_WORDS,
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return {
    v: 2,
    kdf: 'pbkdf2-sha256-100k',
    salt: salt.toString(CryptoJS.enc.Hex),
    iv: iv.toString(CryptoJS.enc.Hex),
    data: encrypted.toString(),
  };
}

function decryptPayload(payload: EncryptedEnvelope, password: string): string {
  let salt: CryptoJS.lib.WordArray;
  let iv: CryptoJS.lib.WordArray;
  try {
    salt = CryptoJS.enc.Hex.parse(payload.salt);
    iv = CryptoJS.enc.Hex.parse(payload.iv);
  } catch {
    throw new Error('wrongPassword');
  }
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: PBKDF2_KEY_SIZE_WORDS,
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  let plain: string;
  try {
    const decrypted = CryptoJS.AES.decrypt(payload.data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    plain = decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    throw new Error('wrongPassword');
  }
  // Con PBKDF2 + AES-CBC, una contraseña incorrecta producirá un texto
  // descifrado con bytes basura. JSON.parse fallaría, pero también podría
  // ocasionalmente "exito" por coincidencia. Validamos con un marcador
  // de texto plano conocido para detectar ese caso.
  if (!plain || !plain.startsWith('{"version":')) {
    throw new Error('wrongPassword');
  }
  return plain;
}

function isEncryptedEnvelope(parsed: any): parsed is EncryptedEnvelope {
  return (
    parsed &&
    parsed.v === 2 &&
    parsed.kdf === 'pbkdf2-sha256-100k' &&
    typeof parsed.salt === 'string' &&
    typeof parsed.iv === 'string' &&
    typeof parsed.data === 'string'
  );
}

export async function backupNow(encrypted = false, password = ''): Promise<{ count: number }> {
  const profile = await getProfile();
  const readings = await listReadings(10000);

  const inner = JSON.stringify({
    version: 1,
    exported_at: new Date().toISOString(),
    profile,
    readings,
  });

  let finalJson: string;
  if (encrypted) {
    if (!password) {
      throw new Error('passwordRequired');
    }
    finalJson = JSON.stringify(encryptPayload(inner, password));
  } else {
    finalJson = inner;
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
// Si está cifrado, el usuario debe proporcionar la contraseña.
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

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('invalidFile');
  }

  if (isEncryptedEnvelope(parsed)) {
    if (!password) {
      throw new Error('passwordRequired');
    }
    const plaintext = decryptPayload(parsed, password);
    try {
      parsed = JSON.parse(plaintext);
    } catch {
      throw new Error('wrongPassword');
    }
  } else if (parsed.encrypted) {
    // Envelope heredado o formato desconocido: tratar como cifrado desconocido.
    throw new Error('notBackup');
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
