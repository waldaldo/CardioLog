import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { resetDb } from '@/db/client';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';

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
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => ({
        padding: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{label}</Text>
      <View style={{
        backgroundColor: colors.accentBg,
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10,
        borderWidth: 1, borderColor: colors.accentBorder,
      }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{value}</Text>
      </View>
    </Pressable>
  );

  const StaticRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title={t('settings')}/>

      <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
        <ToggleRow label={t('language')} value={lang === 'es' ? t('spanish') : t('english')} onToggle={toggleLang}/>
        <ToggleRow label={t('theme')} value={isDark ? t('dark') : t('light')} onToggle={toggleTheme}/>
        <StaticRow label={t('version')} value="1.0.0"/>
      </View>

      <Pressable onPress={onReset}
        accessibilityRole="button" accessibilityLabel={t('resetData')}
        style={({ pressed }) => ({
          marginTop: 24, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: colors.oms.hta2,
          alignItems: 'center', opacity: pressed ? 0.7 : 1,
        })}>
        <Text style={{ color: colors.oms.hta2, fontWeight: '700', fontSize: 14 }}>{t('resetData')}</Text>
      </Pressable>
    </ScrollView>
  );
}
