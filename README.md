# TensioVida — App React Native (Expo)

Scaffolding funcional de la app Android (e iOS) para registro y seguimiento de presión arterial, portado desde el prototipo HTML.

## Qué incluye este proyecto

- **Expo SDK 52** + React Native + TypeScript
- **Navegación**: Expo Router (file-based) con bottom tabs + stack
- **Base de datos local**: SQLite (`expo-sqlite`) con esquema de lecturas, perfil y recordatorios
- **Backup Google Drive**: OAuth2 con `expo-auth-session` + subida de JSON/CSV al AppDataFolder del usuario
- **Notificaciones locales**: `expo-notifications` para recordatorios de medición
- **Gráficos**: SVG nativo (`react-native-svg`) — ya portado desde el prototipo
- **Clasificación OMS**: motor idéntico al prototipo
- **Tema**: claro/oscuro, tipografía escalable, acento configurable
- **Logo**: SVG vectorial

## Pantallas portadas (funcionales)

✅ Onboarding (5 pasos, persiste en SQLite)
✅ Inicio (última lectura, promedios 7/30 días, chart 14d, recomendaciones)
✅ Registro de medición (guarda en SQLite, clasifica en vivo)
✅ Historial (lista agrupada por día + vista de gráfico)
✅ Recomendaciones OMS personalizadas
✅ Perfil con IMC calculado
✅ Recordatorios (programa notificaciones locales)
✅ Backup Google Drive (OAuth + exportar/restaurar)
✅ Ajustes

## Cómo correrlo

### Requisitos
- Node 18+
- `npm install -g expo-cli`
- Android Studio (emulador) o un teléfono Android con **Expo Go** instalado

### Pasos

```bash
cd tensiovida-app
npm install
npx expo start
```

Escanea el QR con Expo Go, o presiona `a` para abrir en el emulador Android.

### Para generar APK/AAB de producción

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview    # APK
eas build --platform android --profile production # AAB para Play Store
```

## Configuración previa necesaria

### 1. Google Drive OAuth

1. Ve a [console.cloud.google.com](https://console.cloud.google.com) → crea un proyecto
2. Activa la **Google Drive API**
3. Crea credenciales **OAuth 2.0 Client ID** tipo **Android**
4. Package name: `com.tensiovida.app` (o el que definas en `app.json`)
5. SHA-1 del keystore: `eas credentials` te lo entrega
6. Copia el **Client ID** a `.env`:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
```

### 2. Política de privacidad

Obligatoria para publicar en Play Store al manejar datos de salud. Usa un generador tipo [termly.io](https://termly.io) y agrégala en `app.json` → `extra.privacyPolicyUrl`.

## Estructura del proyecto

```
tensiovida-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Inicio
│   │   ├── history.tsx     # Historial
│   │   └── profile.tsx     # Perfil
│   ├── onboarding.tsx      # Onboarding
│   ├── record.tsx          # Registrar medición
│   ├── recommendations.tsx
│   ├── reminders.tsx
│   ├── backup.tsx
│   ├── settings.tsx
│   └── _layout.tsx         # Root layout + theme provider
├── src/
│   ├── db/
│   │   ├── schema.ts       # SQL CREATE TABLE
│   │   ├── client.ts       # SQLite wrapper
│   │   └── repositories.ts # CRUD por entidad
│   ├── lib/
│   │   ├── oms.ts          # Clasificación OMS
│   │   ├── recommendations.ts
│   │   ├── i18n.ts
│   │   ├── drive.ts        # Google Drive backup
│   │   └── notifications.ts
│   ├── components/
│   │   ├── AreaChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── BPCategoryChip.tsx
│   │   ├── Icon.tsx
│   │   └── Logo.tsx
│   ├── theme/
│   │   ├── tokens.ts       # Colores, type, spacing
│   │   └── ThemeProvider.tsx
│   └── hooks/
│       ├── useReadings.ts
│       ├── useProfile.ts
│       └── useSettings.ts
├── assets/
│   ├── icon.png
│   └── splash.png
├── app.json
├── package.json
├── tsconfig.json
└── .env.example
```

## Próximos pasos sugeridos

1. **Probar flujo completo** en Expo Go
2. **Ajustar colores/tipografía** en `src/theme/tokens.ts` si quieres afinar
3. **Crear credenciales OAuth** para habilitar Drive
4. **Diseñar iconos de app** (512×512 para Play Store) — usa el logo SVG como base
5. **Primera build con EAS** — probar en un Android real
6. **Cuenta Google Play Developer** (USD 25 único) → subir a Play Store
