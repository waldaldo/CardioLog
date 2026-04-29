import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  listReadings, getProfile, logBackup,
  saveProfile, clearAllReadings, insertReadingRaw,
  Profile, Reading,
} from '../db/repositories';

// Los respaldos se guardan localmente aquí antes de compartir.
const BACKUP_DIR = FileSystem.documentDirectory + 'backups/';

export interface BackupFile {
  name: string;
  modifiedTime: string;
}

export interface BackupPayload {
  version: number;
  exported_at: string;
  profile: Profile;
  readings: Reading[];
}

// Genera el JSON, lo guarda localmente y abre el menú de compartir del sistema.
// El usuario elige dónde guardarlo (Google Drive, correo, etc.) sin OAuth.
export async function backupNow(): Promise<{ count: number }> {
  const profile = await getProfile();
  const readings = await listReadings(10000);

  const payload: BackupPayload = {
    version: 1,
    exported_at: new Date().toISOString(),
    profile: profile!,
    readings,
  };

  await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });

  const filename = `cardiolog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const fileUri = BACKUP_DIR + filename;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Guardar respaldo de CardioLog',
  });

  await logBackup(null, readings.length);
  return { count: readings.length };
}

// Abre el selector de archivos, lee el JSON y devuelve el contenido validado.
// Lanza un error si el archivo no tiene el formato correcto.
export async function pickAndReadBackup(): Promise<BackupPayload> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('Selección cancelada');
  }

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }

  if (!parsed.profile || !Array.isArray(parsed.readings)) {
    throw new Error('El archivo no es un respaldo de CardioLog.');
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

// Lista los archivos de respaldo guardados localmente en el dispositivo.
export async function listLocalBackups(): Promise<BackupFile[]> {
  try {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    const names = await FileSystem.readDirectoryAsync(BACKUP_DIR);
    const result: BackupFile[] = [];
    for (const name of names.filter(n => n.endsWith('.json'))) {
      const info = await FileSystem.getInfoAsync(BACKUP_DIR + name);
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
