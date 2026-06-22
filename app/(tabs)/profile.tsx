import { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useProfile } from '@/hooks/useProfile';
import { bmiOf, bmiCategory } from '@/lib/oms';
import { TabFade } from '@/components/TabFade';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function Profile() {
  const { profile, save, refresh } = useProfile();
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ weight_kg: '', height_cm: '', age: '' });

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!profile) return null;
  const bmi = bmiOf(profile.weight_kg, profile.height_cm);

  const startEdit = () => {
    setDraft({
      weight_kg: String(profile.weight_kg),
      height_cm: String(profile.height_cm),
      age: String(profile.age),
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    const w = parseFloat(draft.weight_kg);
    const h = parseFloat(draft.height_cm);
    const a = parseInt(draft.age, 10);
    if (!w || !h || !a || w < 20 || w > 300 || h < 50 || h > 250 || a < 1 || a > 120) {
      Alert.alert(t('invalidData'), t('invalidDataMsg'));
      return;
    }
    await save({ ...profile, weight_kg: w, height_cm: h, age: a });
    setEditing(false);
  };

  const items = [
    { label: t('historyNav'), nav: '/readings-detail?days=30' },
    { label: t('recommendationsNav'), nav: '/recommendations' },
    { label: t('remindersNav'), nav: '/reminders' },
    { label: t('backupNav'), nav: '/backup' },
    { label: t('settingsNav'), nav: '/settings' },
  ];

  const inputStyle = {
    color: colors.primary, fontSize: 18, fontWeight: '800' as const,
    borderBottomWidth: 1, borderBottomColor: colors.primary,
    paddingVertical: 2, minWidth: 50, textAlign: 'center' as const,
  };

  return (
    <TabFade>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 16 }}>{t('profile')}</Text>

        <View style={{
          padding: 20, borderRadius: 20, alignItems: 'center',
          backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, marginBottom: 14,
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryStrong,
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Text style={{ color: colors.onPrimary, fontSize: 28, fontWeight: '800' }}>
              {(profile.name || '?').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{profile.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {editing ? (
              <TextInput
                value={draft.age}
                onChangeText={v => setDraft(d => ({ ...d, age: v }))}
                keyboardType="number-pad"
                accessibilityLabel={t('onbAge')}
                style={[inputStyle, { fontSize: 14, color: colors.text }]}
              />
            ) : `${profile.age} ${t('years')}`}
            {' · '}{profile.sex === 'M' ? t('male') : t('female')}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
            {editing ? (
              <>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <TextInput
                    value={draft.weight_kg}
                    onChangeText={v => setDraft(d => ({ ...d, weight_kg: v }))}
                    keyboardType="decimal-pad"
                    accessibilityLabel={t('weight')}
                    style={inputStyle}
                  />
                  <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 }}>{t('weight').toUpperCase()}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{t('weightUnit')}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <TextInput
                    value={draft.height_cm}
                    onChangeText={v => setDraft(d => ({ ...d, height_cm: v }))}
                    keyboardType="number-pad"
                    accessibilityLabel={t('height')}
                    style={inputStyle}
                  />
                  <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 }}>{t('height').toUpperCase()}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{t('heightUnit')}</Text>
                </View>
                <Stat label={t('bmi')} value={bmiOf(parseFloat(draft.weight_kg)||profile.weight_kg, parseFloat(draft.height_cm)||profile.height_cm).toFixed(1)}
                  unit={bmiCategory(bmiOf(parseFloat(draft.weight_kg)||profile.weight_kg, parseFloat(draft.height_cm)||profile.height_cm), lang)}/>
              </>
            ) : (
              <>
                <Stat label={t('weight')} value={`${profile.weight_kg}`} unit={t('weightUnit')}/>
                <Stat label={t('height')} value={`${profile.height_cm}`} unit={t('heightUnit')}/>
                <Stat label={t('bmi')} value={bmi.toFixed(1)} unit={bmiCategory(bmi, lang)}/>
              </>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            {editing ? (
              <>
                <Pressable onPress={saveEdit}
                  accessibilityRole="button" accessibilityLabel={t('save')}
                  style={({ pressed }) => ({ paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primaryStrong, opacity: pressed ? 0.85 : 1 })}>
                  <Text style={{ color: colors.onPrimary, fontWeight: '800', fontSize: 14 }}>{t('save')}</Text>
                </Pressable>
                <Pressable onPress={() => setEditing(false)}
                  accessibilityRole="button" accessibilityLabel={t('cancel')}
                  style={({ pressed }) => ({ paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.85 : 1 })}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{t('cancel')}</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={startEdit}
                accessibilityRole="button" accessibilityLabel={t('editData')}
                style={({ pressed }) => ({
                  paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12,
                  backgroundColor: colors.accentBg, borderWidth: 1, borderColor: colors.accentBorder,
                  opacity: pressed ? 0.85 : 1,
                })}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('editData')}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
          {items.map((it, i) => (
            <Pressable key={it.label} onPress={() => router.push(it.nav as any)}
              accessibilityRole="button" accessibilityLabel={it.label}
              style={({ pressed }) => ({
                padding: 16, flexDirection: 'row', alignItems: 'center',
                borderBottomWidth: i < items.length - 1 ? 1 : 0,
                borderBottomColor: colors.borderSubtle,
                opacity: pressed ? 0.7 : 1,
              })}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{it.label}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 6l6 6-6 6" stroke={colors.textMuted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </TabFade>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{unit}</Text>
    </View>
  );
}
