// app/backup.tsx — Google Drive backup UI

import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { signIn, signOut, connectedEmail, backupNow, listDriveBackups } from '@/lib/drive';
import { palette } from '@/theme/tokens';

export default function Backup() {
  const [email, setEmail] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      setEmail(await connectedEmail());
      setFiles(await listDriveBackups());
    } catch (e) {
      console.warn('Error actualizando estado de Drive:', e);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onConnect = async () => {
    try {
      setBusy(true);
      const ok = await signIn();
      if (ok) await refresh();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally { setBusy(false); }
  };

  const onBackup = async () => {
    try {
      setBusy(true);
      const r = await backupNow();
      Alert.alert('Listo', `Respaldo subido: ${r.count} registros`);
      await refresh();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
                   style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginLeft: 12 }}>Respaldo</Text>
      </View>

      <View style={{
        padding: 20, borderRadius: 20, alignItems: 'center',
        backgroundColor: 'rgba(0,240,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.25)',
        marginBottom: 14,
      }}>
        {email ? (
          <>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Conectado a Google Drive</Text>
            <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 4 }}>{email}</Text>
            <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 8 }}>
              {files.length} respaldos en la nube
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
              Conecta con Google Drive
            </Text>
            <Pressable onPress={onConnect} disabled={busy}
                       style={{ padding: 14, borderRadius: 12, backgroundColor: '#00f0ff' }}>
              <Text style={{ color: '#07070a', fontWeight: '800' }}>Iniciar sesión</Text>
            </Pressable>
          </>
        )}
      </View>

      {email && (
        <>
          <Pressable onPress={onBackup} disabled={busy}
                     style={{ padding: 18, borderRadius: 14, backgroundColor: '#00f0ff', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: '#07070a', fontSize: 15, fontWeight: '800' }}>
              {busy ? 'Subiendo…' : 'Respaldar ahora'}
            </Text>
          </Pressable>

          <Pressable onPress={async () => {
            try {
              await signOut();
              await refresh();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ color: palette.textMuted }}>Cerrar sesión de Google</Text>
          </Pressable>

          <Text style={{ color: palette.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 12, marginBottom: 8 }}>
            HISTORIAL EN LA NUBE
          </Text>
          <View style={{ backgroundColor: palette.glassBg, borderRadius: 16, borderWidth: 1, borderColor: palette.glassBorder }}>
            {files.length === 0 && (
              <Text style={{ color: palette.textMuted, padding: 16, textAlign: 'center' }}>
                Aún no hay respaldos
              </Text>
            )}
            {files.slice(0, 10).map((f, i) => (
              <View key={f.id} style={{
                padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
                borderBottomWidth: i < files.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)',
              }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }}/>
                <Text style={{ color: '#fff', flex: 1, fontSize: 12 }}>{f.name}</Text>
                <Text style={{ color: palette.textMuted, fontSize: 11 }}>
                  {new Date(f.modifiedTime).toLocaleDateString('es-CL')}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
