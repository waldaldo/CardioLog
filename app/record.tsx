// app/record.tsx — Log a new reading

import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP } from '@/lib/oms';
import { palette } from '@/theme/tokens';

export default function RecordScreen() {
  const { add } = useReadings();
  const [sys, setSys] = useState(132);
  const [dia, setDia] = useState(84);
  const [pulse, setPulse] = useState(74);
  const [moment, setMoment] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const cat = classifyBP(sys, dia);

  const save = async () => {
    try {
      await add({
        ts: new Date().toISOString(),
        sys, dia, pulse, moment, note: '',
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo guardar la medición. Intenta de nuevo.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
                   style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginLeft: 12 }}>Registrar medición</Text>
      </View>

      <View style={{
        padding: 16, borderRadius: 16, alignItems: 'center',
        backgroundColor: cat.color + '22', borderWidth: 1, borderColor: cat.color + '55',
        marginBottom: 12,
      }}>
        <Text style={{ color: cat.color, fontSize: 14, fontWeight: '800' }}>{cat.label.es}</Text>
        <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }}>{cat.rangeText} mmHg</Text>
      </View>

      <Stepper label="Sistólica" unit="mmHg" value={sys} setValue={setSys} min={70} max={220} color="#00f0ff"/>
      <Stepper label="Diastólica" unit="mmHg" value={dia} setValue={setDia} min={40} max={140} color="#a78bfa"/>
      <Stepper label="Pulso" unit="lpm" value={pulse} setValue={setPulse} min={30} max={200} color="#ef4444"/>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 20 }}>
        {(['morning', 'afternoon', 'evening'] as const).map(m => (
          <Pressable key={m} onPress={() => setMoment(m)}
                     style={{
                       flex: 1, padding: 12, borderRadius: 12, alignItems: 'center',
                       backgroundColor: moment === m ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)',
                       borderWidth: 1, borderColor: moment === m ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                     }}>
            <Text style={{ color: moment === m ? '#00f0ff' : palette.textSecondary, fontWeight: '600', fontSize: 12 }}>
              {m === 'morning' ? 'Mañana' : m === 'afternoon' ? 'Tarde' : 'Noche'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={save}
                 style={{ padding: 18, borderRadius: 14, backgroundColor: '#00f0ff', alignItems: 'center' }}>
        <Text style={{ color: '#07070a', fontSize: 16, fontWeight: '800' }}>Guardar</Text>
      </Pressable>
    </ScrollView>
  );
}

interface StepperProps {
  label: string; unit: string; value: number;
  setValue: (v: number) => void; min: number; max: number; color: string;
}
function Stepper({ label, unit, value, setValue, min, max, color }: StepperProps) {
  return (
    <View style={{
      padding: 16, borderRadius: 16, marginBottom: 10,
      backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: palette.textSecondary, fontSize: 13, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: palette.textMuted, fontSize: 11 }}>{unit}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <StepBtn label="–" onPress={() => setValue(Math.max(min, value - 1))}/>
        <Text style={{ flex: 1, textAlign: 'center', color, fontSize: 48, fontWeight: '800' }}>{value}</Text>
        <StepBtn label="+" onPress={() => setValue(Math.min(max, value + 1))}/>
      </View>
    </View>
  );
}

function StepBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}
               style={{
                 width: 44, height: 44, borderRadius: 12,
                 backgroundColor: 'rgba(255,255,255,0.06)',
                 borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                 alignItems: 'center', justifyContent: 'center',
               }}>
      <Text style={{ color: '#fff', fontSize: 22 }}>{label}</Text>
    </Pressable>
  );
}
