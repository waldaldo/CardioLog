// app/settings.tsx

import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { getSetting, setSetting } from '@/db/repositories';
import { resetDb } from '@/db/client';
import { palette } from '@/theme/tokens';

export default function Settings() {
  const [lang, setLang] = useState('es');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    (async () => {
      try {
        setLang((await getSetting('lang')) ?? 'es');
        setTheme((await getSetting('theme')) ?? 'dark');
      } catch (e) {
        console.warn('Error cargando ajustes:', e);
      }
    })();
  }, []);

  const onReset = () => {
    Alert.alert('Borrar todos los datos', '¿Estás seguro? Esto elimina tu perfil y mediciones.', [
      { text: 'Cancelar' },
      { text: 'Borrar', style: 'destructive', onPress: async () => {
        try {
          await resetDb();
          router.replace('/onboarding');
        } catch (e: any) {
          Alert.alert('Error', 'No se pudo reiniciar la base de datos.');
        }
      }},
    ]);
  };

  const toggleLang = async () => {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    try { await setSetting('lang', next); } catch { /* ignore */ }
  };

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { await setSetting('theme', next); } catch { /* ignore */ }
  };

  const ToggleRow = ({ label, value, onToggle }: { label: string; value: string; onToggle: () => void }) => (
    <Pressable onPress={onToggle}
               style={{ padding: 16, flexDirection: 'row', alignItems: 'center',
                        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
      <View style={{ backgroundColor: 'rgba(0,240,255,0.12)', paddingHorizontal: 12, paddingVertical: 4,
                     borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)' }}>
        <Text style={{ color: '#00f0ff', fontSize: 13, fontWeight: '600' }}>{value}</Text>
      </View>
    </Pressable>
  );

  const StaticRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 13 }}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
                   style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginLeft: 12 }}>Ajustes</Text>
      </View>

      <View style={{ backgroundColor: palette.glassBg, borderRadius: 16, borderWidth: 1, borderColor: palette.glassBorder }}>
        <ToggleRow label="Idioma" value={lang === 'es' ? 'Español' : 'English'} onToggle={toggleLang}/>
        <ToggleRow label="Tema" value={theme === 'dark' ? 'Oscuro' : 'Claro'} onToggle={toggleTheme}/>
        <StaticRow label="Versión" value="1.0.0"/>
      </View>

      <Pressable onPress={onReset}
                 style={{ marginTop: 24, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center' }}>
        <Text style={{ color: '#ef4444', fontWeight: '700' }}>Borrar todos los datos</Text>
      </Pressable>
    </ScrollView>
  );
}
