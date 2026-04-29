import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { backupNow, pickAndReadBackup, restoreBackup, listLocalBackups, BackupFile } from '@/lib/drive';
import { ScreenSlide } from '@/components/ScreenSlide';
import { palette } from '@/theme/tokens';

export default function Backup() {
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      setFiles(await listLocalBackups());
    } catch (e) {
      console.warn('Error listando respaldos locales:', e);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onExport = async () => {
    try {
      setBusy(true);
      const r = await backupNow();
      await refresh();
      Alert.alert('Listo', `Respaldo de ${r.count} mediciones generado.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };

  const onImport = async () => {
    try {
      // Primero leemos y validamos el archivo antes de preguntar
      const payload = await pickAndReadBackup();
      const count = payload.readings.length;
      const date = payload.exported_at.slice(0, 10);

      Alert.alert(
        'Restaurar respaldo',
        `El archivo contiene ${count} mediciones exportadas el ${date}.\n\nEsto reemplazará tu perfil y todas las mediciones actuales. ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              try {
                setBusy(true);
                const r = await restoreBackup(payload);
                Alert.alert('Listo', `Se restauraron ${r.count} mediciones correctamente.`);
              } catch (e: any) {
                Alert.alert('Error al restaurar', e.message);
              } finally {
                setBusy(false);
              }
            },
          },
        ]
      );
    } catch (e: any) {
      if (e.message !== 'Selección cancelada') {
        Alert.alert('Error', e.message);
      }
    }
  };

  return (
    <ScreenSlide>
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
                   style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginLeft: 12 }}>Respaldo</Text>
      </View>

      {/* Exportar */}
      <View style={{
        padding: 18, borderRadius: 20,
        backgroundColor: 'rgba(0,240,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.25)',
        marginBottom: 10,
      }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 }}>Exportar datos</Text>
        <Text style={{ color: palette.textSecondary, fontSize: 13, lineHeight: 20 }}>
          Genera un archivo JSON con tus mediciones y perfil. Puedes guardarlo en Google Drive, enviarlo por correo o compartirlo donde quieras.
        </Text>
      </View>
      <Pressable onPress={onExport} disabled={busy}
                 style={{
                   padding: 16, borderRadius: 14,
                   backgroundColor: busy ? 'rgba(0,240,255,0.4)' : '#00f0ff',
                   alignItems: 'center', marginBottom: 20,
                 }}>
        <Text style={{ color: '#07070a', fontSize: 15, fontWeight: '800' }}>
          {busy ? 'Preparando…' : 'Exportar respaldo'}
        </Text>
      </Pressable>

      {/* Importar */}
      <View style={{
        padding: 18, borderRadius: 20,
        backgroundColor: 'rgba(167,139,250,0.08)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
        marginBottom: 10,
      }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 }}>Importar respaldo</Text>
        <Text style={{ color: palette.textSecondary, fontSize: 13, lineHeight: 20 }}>
          Restaura tus datos desde un archivo de respaldo anterior. Reemplazará las mediciones actuales.
        </Text>
      </View>
      <Pressable onPress={onImport} disabled={busy}
                 style={{
                   padding: 16, borderRadius: 14,
                   backgroundColor: 'rgba(167,139,250,0.15)',
                   borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)',
                   alignItems: 'center', marginBottom: 28,
                 }}>
        <Text style={{ color: '#a78bfa', fontSize: 15, fontWeight: '800' }}>Seleccionar archivo</Text>
      </Pressable>

      {/* Historial local */}
      <Text style={{ color: palette.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
        RESPALDOS EN ESTE DISPOSITIVO
      </Text>
      <View style={{ backgroundColor: palette.glassBg, borderRadius: 16, borderWidth: 1, borderColor: palette.glassBorder }}>
        {files.length === 0 ? (
          <Text style={{ color: palette.textMuted, padding: 16, textAlign: 'center' }}>
            Aún no hay respaldos generados
          </Text>
        ) : (
          files.slice(0, 10).map((f, i) => (
            <View key={f.name} style={{
              padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
              borderBottomWidth: i < Math.min(files.length, 10) - 1 ? 1 : 0,
              borderBottomColor: 'rgba(255,255,255,0.05)',
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }}/>
              <Text style={{ color: '#fff', flex: 1, fontSize: 12 }}>{f.name}</Text>
              <Text style={{ color: palette.textMuted, fontSize: 11 }}>
                {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('es-CL') : ''}
              </Text>
            </View>
          ))
        )}
      </View>

    </ScrollView>
    </ScreenSlide>
  );
}
