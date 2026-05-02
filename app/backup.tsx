import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { backupNow, pickAndReadBackup, restoreBackup, listLocalBackups, BackupFile } from '@/lib/drive';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function Backup() {
  const { t } = useLang();
  const { colors } = useTheme();
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
        Alert.alert(t('backupDone'), `${t('backupDoneMsg')} ${r.count} ${t('backupDoneSuffix')}`);
    } catch (e: any) {
      Alert.alert(t('saveError'), e.message);
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
          t('restoreTitle'),
          `${t('restoreMsgPrefix')} ${count} ${t('restoreMsgMiddle')} ${date}.\n\n${t('restoreMsgSuffix')}`,
        [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('restore'),
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              const r = await restoreBackup(payload);
              Alert.alert(t('backupDone'), `${t('restoreDone')} ${r.count} ${t('restoreDoneSuffix')}`);
              } catch (e: any) {
                Alert.alert(t('restoreError'), e.message);
              } finally {
                setBusy(false);
              }
            },
          },
        ]
      );
    } catch (e: any) {
      const code = e.message;
      if (code === 'cancelled') return;
      const msg = code === 'invalidFile' ? t('invalidFile')
        : code === 'notBackup' ? t('notBackup')
        : e.message;
      Alert.alert(t('saveError'), msg);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
      style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 20 }}>←</Text>
    </Pressable>
    <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginLeft: 12 }}>{t('backupTitle')}</Text>
      </View>

      {/* Exportar */}
      <View style={{
        padding: 18, borderRadius: 20,
        backgroundColor: 'rgba(0,240,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.25)',
        marginBottom: 10,
      }}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 }}>{t('exportData')}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
        {t('exportDesc')}
      </Text>
      </View>
      <Pressable onPress={onExport} disabled={busy}
                 style={{
                   padding: 16, borderRadius: 14,
                   backgroundColor: busy ? 'rgba(0,240,255,0.4)' : '#00f0ff',
                   alignItems: 'center', marginBottom: 20,
                 }}>
        <Text style={{ color: '#07070a', fontSize: 15, fontWeight: '800' }}>
          {busy ? t('preparing') : t('exportBtn')}
        </Text>
      </Pressable>

      {/* Importar */}
      <View style={{
        padding: 18, borderRadius: 20,
        backgroundColor: 'rgba(167,139,250,0.08)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
        marginBottom: 10,
      }}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 }}>{t('importData')}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
        {t('importDesc')}
      </Text>
      </View>
      <Pressable onPress={onImport} disabled={busy}
                 style={{
                   padding: 16, borderRadius: 14,
                   backgroundColor: 'rgba(167,139,250,0.15)',
                   borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)',
                   alignItems: 'center', marginBottom: 28,
                 }}>
        <Text style={{ color: '#a78bfa', fontSize: 15, fontWeight: '800' }}>{t('importBtn')}</Text>
      </Pressable>

      {/* Historial local */}
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
        {t('localBackups')}
      </Text>
      <View style={{ backgroundColor: colors.glassBg, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder }}>
        {files.length === 0 ? (
      <Text style={{ color: colors.textMuted, padding: 16, textAlign: 'center' }}>
        {t('noBackups')}
      </Text>
        ) : (
          files.slice(0, 10).map((f, i) => (
            <View key={f.name} style={{
              padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
        borderBottomWidth: i < Math.min(files.length, 10) - 1 ? 1 : 0,
        borderBottomColor: colors.borderSubtle,
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }}/>
        <Text style={{ color: colors.text, flex: 1, fontSize: 12 }}>{f.name}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('es-CL') : ''}
              </Text>
            </View>
          ))
        )}
      </View>

      </ScrollView>
    );
  }
