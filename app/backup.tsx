import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { backupNow, pickAndReadBackup, restoreBackup, listLocalBackups, BackupFile } from '@/lib/drive';
import { exportPdfReport, PdfPeriod } from '@/lib/pdfReport';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function Backup() {
  const { t, lang } = useLang();
  const { colors } = useTheme();
  const { readings } = useReadings();
  const { profile } = useProfile();
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [pdfPeriod, setPdfPeriod] = useState<PdfPeriod>('30d');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [encryptEnabled, setEncryptEnabled] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [importError, setImportError] = useState('');
  const [importPassword, setImportPassword] = useState('');

  const refresh = async () => {
    try {
      setFiles(await listLocalBackups());
    } catch (e) {
      console.warn('Error listando respaldos locales:', e);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onExport = async () => {
    if (encryptEnabled && !exportPassword) {
      Alert.alert(t('passwordRequiredTitle'), t('passwordRequiredBody'));
      return;
    }
    try {
      setBusy(true);
      const r = await backupNow(encryptEnabled, exportPassword);
      await refresh();
      Alert.alert(t('backupDone'), `${t('backupDoneMsg')} ${r.count} ${t('backupDoneSuffix')}`);
    } catch (e: any) {
      Alert.alert(t('saveError'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const onExportPdf = async () => {
    if (!profile) return;
    try {
      setPdfBusy(true);
      const r = await exportPdfReport(readings, profile, lang, pdfPeriod);
      Alert.alert(t('pdfDone'), `${t('pdfDoneMsg')} ${r.count} ${t('backupDoneSuffix')}`);
    } catch (e: any) {
      if (e.message === 'PRINT_TIMEOUT') {
        Alert.alert(t('pdfTimeoutTitle'), t('pdfTimeoutBody'));
      } else if (e.message !== 'cancelled') {
        Alert.alert(t('saveError'), e.message);
      }
    } finally {
      setPdfBusy(false);
    }
  };

  const tryImport = async (pwd: string) => {
    try {
      const payload = await pickAndReadBackup(pwd);
      setImportError('');
      setImportPassword('');
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
      if (code === 'passwordRequired') {
        setImportError(t('enterPasswordBody'));
        return;
      }
      if (code === 'wrongPassword') {
        setImportError(t('wrongPasswordBody'));
        return;
      }
      const msg = code === 'invalidFile' ? t('invalidFile')
        : code === 'notBackup' ? t('notBackup')
        : e.message;
      Alert.alert(t('saveError'), msg);
    }
  };

  const onImport = () => {
    setImportError('');
    setImportPassword('');
    tryImport('');
  };

  const onImportRetry = () => {
    if (!importPassword) {
      setImportError(t('enterPasswordBody'));
      return;
    }
    tryImport(importPassword);
  };

  const Banner = ({ title, desc, tint }: { title: string; desc: string; tint: 'primary' | 'secondary' | 'danger' }) => {
    const tintColor = tint === 'primary' ? colors.primary
      : tint === 'secondary' ? colors.secondary
      : colors.oms.hta2;
    return (
      <View style={{
        padding: 18, borderRadius: 20,
        backgroundColor: tintColor + '14',
        borderWidth: 1, borderColor: tintColor + '55',
        marginBottom: 10,
      }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>{desc}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title={t('backupTitle')}/>

      {/* Exportar */}
      <Banner title={t('exportData')} desc={t('exportDesc')} tint="primary"/>

      <Pressable
        onPress={() => setEncryptEnabled(!encryptEnabled)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: encryptEnabled }}
        style={({ pressed }) => ({
          flexDirection: 'row', alignItems: 'center', gap: 10,
          padding: 12, borderRadius: 12, marginBottom: 10,
          backgroundColor: colors.surfaceSubtle,
          opacity: pressed ? 0.7 : 1,
        })}>
        <View style={{
          width: 24, height: 24, borderRadius: 6,
          backgroundColor: encryptEnabled ? colors.primary : 'transparent',
          borderWidth: 2, borderColor: encryptEnabled ? colors.primary : colors.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {encryptEnabled && <Text style={{ color: colors.onPrimary, fontSize: 14, fontWeight: '800' }}>✓</Text>}
        </View>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{t('encryptBackup')}</Text>
      </Pressable>

      {encryptEnabled && (
        <View style={{ marginBottom: 10 }}>
          <TextInput
            value={exportPassword}
            onChangeText={setExportPassword}
            placeholder={t('backupPasswordPlaceholder')}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            accessibilityLabel={t('backupPassword')}
            style={{
              padding: 14, borderRadius: 12,
              backgroundColor: colors.bgCard,
              borderWidth: 1, borderColor: colors.border,
              color: colors.text, fontSize: 16,
            }}
          />
        </View>
      )}

      <Pressable onPress={onExport} disabled={busy}
        accessibilityRole="button" accessibilityLabel={t('exportBtn')}
        style={({ pressed }) => ({
          padding: 16, borderRadius: 14,
          backgroundColor: busy ? colors.surfaceRaised : colors.primaryStrong,
          alignItems: 'center', marginBottom: 20,
          opacity: pressed ? 0.85 : 1,
        })}>
        <Text style={{ color: busy ? colors.textSecondary : colors.onPrimary, fontSize: 15, fontWeight: '800' }}>
          {busy ? t('preparing') : t('exportBtn')}
        </Text>
      </Pressable>

      {/* Importar */}
      <Banner title={t('importData')} desc={t('importDesc')} tint="secondary"/>
      <Pressable onPress={onImport} disabled={busy}
        accessibilityRole="button" accessibilityLabel={t('importBtn')}
        style={({ pressed }) => ({
          padding: 16, borderRadius: 14,
          backgroundColor: colors.secondary + '22',
          borderWidth: 1.5, borderColor: colors.secondary,
          alignItems: 'center', marginBottom: 12,
          opacity: pressed ? 0.85 : 1,
        })}>
        <Text style={{ color: colors.secondary, fontSize: 15, fontWeight: '800' }}>{t('importBtn')}</Text>
      </Pressable>

      {importError !== '' && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.oms.hta2, fontSize: 13, marginBottom: 8 }}>{importError}</Text>
          <TextInput
            value={importPassword}
            onChangeText={setImportPassword}
            placeholder={t('enterPassword')}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            accessibilityLabel={t('enterPassword')}
            style={{
              padding: 14, borderRadius: 12,
              backgroundColor: colors.bgCard,
              borderWidth: 1, borderColor: colors.border,
              color: colors.text, fontSize: 16,
              marginBottom: 8,
            }}
          />
          <Pressable
            onPress={onImportRetry}
            accessibilityRole="button"
            accessibilityLabel={t('importBtn')}
            style={({ pressed }) => ({
              padding: 14, borderRadius: 12,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: colors.onPrimary, fontSize: 14, fontWeight: '700' }}>{t('importBtn')}</Text>
          </Pressable>
        </View>
      )}

      {/* Informe PDF */}
      <Banner title={t('pdfReport')} desc={t('pdfReportDesc')} tint="danger"/>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {(['all', '30d', '90d'] as PdfPeriod[]).map(p => {
          const active = pdfPeriod === p;
          return (
            <Pressable key={p} onPress={() => setPdfPeriod(p)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                backgroundColor: active ? colors.oms.hta2 + '22' : colors.surfaceSubtle,
                borderWidth: 1.5, borderColor: active ? colors.oms.hta2 : colors.border,
                opacity: pressed ? 0.85 : 1,
              })}>
              <Text style={{ color: active ? colors.oms.hta2 : colors.text, fontSize: 13, fontWeight: '700' }}>
                {t(p === 'all' ? 'pdfAll' : p === '30d' ? 'pdf30d' : 'pdf90d')}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={onExportPdf} disabled={pdfBusy || readings.length === 0 || !profile}
        accessibilityRole="button" accessibilityLabel={t('pdfExportBtn')}
        style={({ pressed }) => ({
          padding: 16, borderRadius: 14,
          backgroundColor: (pdfBusy || readings.length === 0 || !profile) ? colors.surfaceRaised : colors.oms.hta2,
          alignItems: 'center', marginBottom: 28,
          opacity: pressed ? 0.85 : 1,
        })}>
        <Text style={{
          color: (pdfBusy || readings.length === 0 || !profile) ? colors.textSecondary : '#ffffff',
          fontSize: 15, fontWeight: '800',
        }}>
          {pdfBusy ? t('preparing') : t('pdfExportBtn')}
        </Text>
      </Pressable>

      {/* Historial local */}
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
        {t('localBackups')}
      </Text>
      <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
        {files.length === 0 ? (
          <Text style={{ color: colors.textSecondary, padding: 16, textAlign: 'center', fontSize: 13 }}>
            {t('noBackups')}
          </Text>
        ) : (
          files.slice(0, 10).map((f, i) => (
            <View key={f.name} style={{
              padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
              borderBottomWidth: i < Math.min(files.length, 10) - 1 ? 1 : 0,
              borderBottomColor: colors.borderSubtle,
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.oms.optima }}/>
              <Text style={{ color: colors.text, flex: 1, fontSize: 13 }}>{f.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('es-CL') : ''}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
