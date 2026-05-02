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
}

// Genera el JSON, lo escribe en cacheDirectory (siempre existe) y abre el menú de compartir.
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

  const filename = `cardiolog-backup-${new Date().toISOString().slice(0, 10)}.json`;

  // cacheDirectory siempre existe — no necesita makeDirectoryAsync
  const cacheUri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(cacheUri, JSON.stringify(payload, null, 2));

  // Copia al documentDirectory para persistir en la lista de respaldos locales
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
export async function pickAndReadBackup(): Promise<BackupPayload> {
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
