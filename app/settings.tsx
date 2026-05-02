import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { resetDb } from '@/db/client';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function Settings() {
  const { lang, t, setLang } = useLang();
  const { colors, isDark, setTheme } = useTheme();

  const onReset = () => {
    Alert.alert(t('resetTitle'), t('resetMsg'), [
      { text: t('cancel') },
      { text: t('resetData'), style: 'destructive', onPress: async () => {
        try {
          await resetDb();
          router.replace('/onboarding');
        } catch (e: any) {
          Alert.alert(t('resetError'), t('resetErrorMsg'));
        }
      }},
    ]);
  };

  const toggleLang = async () => {
    const next = lang === 'es' ? 'en' : 'es';
    await setLang(next);
  };

  const toggleTheme = async () => {
    await setTheme(!isDark);
  };

  const ToggleRow = ({ label, value, onToggle }: { label: string; value: string; onToggle: () => void }) => (
    <Pressable onPress={onToggle}
      style={{ padding: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
      <View style={{ backgroundColor: 'rgba(0,240,255,0.12)', paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)' }}>
        <Text style={{ color: '#00f0ff', fontSize: 13, fontWeight: '600' }}>{value}</Text>
      </View>
    </Pressable>
  );

  const StaticRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
      style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 20 }}>←</Text>
    </Pressable>
    <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginLeft: 12 }}>{t('settings')}</Text>
      </View>

      <View style={{ backgroundColor: colors.glassBg, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder }}>
        <ToggleRow label={t('language')} value={lang === 'es' ? t('spanish') : t('english')} onToggle={toggleLang}/>
        <ToggleRow label={t('theme')} value={isDark ? t('dark') : t('light')} onToggle={toggleTheme}/>
        <StaticRow label={t('version')} value="1.0.0"/>
      </View>

      <Pressable onPress={onReset}
        style={{ marginTop: 24, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center' }}>
        <Text style={{ color: '#ef4444', fontWeight: '700' }}>{t('resetData')}</Text>
      </Pressable>
    </ScrollView>
  );
}
