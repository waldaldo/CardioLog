import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { resetDb } from '@/db/client';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/lib/i18n';
import { ScreenHeader } from '@/components/ScreenHeader';
import { getSetting, setSetting } from '@/db/repositories';
import type { FontScale } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';

const FONT_SCALE_OPTIONS: { label: string; value: FontScale }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Grande', value: 'grande' },
  { label: 'Extra Grande', value: 'xl' },
];

const AUTO_DELETE_OPTIONS = [
  { label: 'Off', value: '' },
  { label: '3 months', value: '3' },
  { label: '6 months', value: '6' },
  { label: '12 months', value: '12' },
  { label: '24 months', value: '24' },
];

export default function Settings() {
  const { lang, t, setLang } = useLang();
  const { colors, isDark, setTheme, fontScale, setFontScale } = useTheme();
  const [lockEnabled, setLockEnabled] = useState(false);
  const [autoDeleteMonths, setAutoDeleteMonths] = useState('');

  useEffect(() => {
    (async () => {
      const pin = await getSetting('lockPin');
      setLockEnabled(!!pin);
      const val = await getSetting('autoDeleteMonths');
      setAutoDeleteMonths(val || '');
    })();
  }, []);

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
    const next: Lang = lang === 'es' ? 'en' : 'es';
    await setLang(next);
  };

  const cycleFontScale = async () => {
    const currentIndex = FONT_SCALE_OPTIONS.findIndex(o => o.value === fontScale);
    const nextIndex = (currentIndex + 1) % FONT_SCALE_OPTIONS.length;
    await setFontScale(FONT_SCALE_OPTIONS[nextIndex].value);
  };

  const getFontScaleLabel = () => FONT_SCALE_OPTIONS.find(o => o.value === fontScale)?.label ?? 'Normal';

  const manageLock = () => {
    if (lockEnabled) {
      Alert.alert(t('lockEnabled'), '', [
        { text: t('cancel') },
        { text: t('changeLockPin'), onPress: () => router.push('/set-pin') },
        { text: t('removeLock'), style: 'destructive', onPress: async () => {
          await setSetting('lockPin', '');
          setLockEnabled(false);
        }},
      ]);
    } else {
      router.push('/set-pin');
    }
  };

  const cycleAutoDelete = async () => {
    const currentIndex = AUTO_DELETE_OPTIONS.findIndex(o => o.value === autoDeleteMonths);
    const nextIndex = (currentIndex + 1) % AUTO_DELETE_OPTIONS.length;
    const nextVal = AUTO_DELETE_OPTIONS[nextIndex].value;
    await setSetting('autoDeleteMonths', nextVal);
    setAutoDeleteMonths(nextVal);
  };

  const getAutoDeleteLabel = () => {
    return AUTO_DELETE_OPTIONS.find(o => o.value === autoDeleteMonths)?.label ?? 'Off';
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

  const ActionRow = ({ label, value, onPress }: { label: string; value?: string; onPress: () => void }) => (
    <Pressable onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        padding: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{label}</Text>
      {value ? (
        <View style={{
          backgroundColor: colors.accentBg,
          paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10,
          borderWidth: 1, borderColor: colors.accentBorder,
        }}>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{value}</Text>
        </View>
      ) : (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path d="M9 6l6 6-6 6" stroke={colors.textMuted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      )}
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title={t('settings')}/>

      <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
        <ToggleRow label={t('language')} value={lang === 'es' ? t('spanish') : t('english')} onToggle={toggleLang}/>
        <ToggleRow label={t('theme')} value={isDark ? t('dark') : t('light')} onToggle={() => setTheme(!isDark)}/>
        <ToggleRow label={t('fontSize')} value={getFontScaleLabel()} onToggle={cycleFontScale}/>
        <ActionRow label={t('lockSetting')} value={lockEnabled ? t('on') : t('off')} onPress={manageLock}/>
        <ActionRow label={t('autoDeleteData')} value={getAutoDeleteLabel()} onPress={cycleAutoDelete}/>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{t('version')}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>1.0.0</Text>
        </View>
      </View>

      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 }}>{t('about')}</Text>
      <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t('madeWith')} </Text>
          <Text style={{ fontSize: 16 }}>❤️</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}> {t('byWalo')}</Text>
        </View>

        <Pressable
          onPress={() => Alert.alert('Coming soon', 'Enlace a Buy me a coffee próximamente')}
          style={({ pressed }) => ({
            backgroundColor: '#FFDD00',
            padding: 12, borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
            marginTop: 8
          })}>
          <Text style={{ color: '#000000', fontWeight: '800', fontSize: 13 }}>☕ {t('buyMeACoffee')}</Text>
        </Pressable>
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