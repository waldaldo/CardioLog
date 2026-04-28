# CardioLog

Aplicación móvil para registro y seguimiento de presión arterial, construida con React Native y Expo.

## Características

- Registro de mediciones (sistólica, diastólica, pulso) con clasificación OMS en tiempo real
- Historial agrupado por día con gráfico de tendencia
- Promedios de 7 y 30 días con acceso al detalle de cada rango
- Recomendaciones de estilo de vida personalizadas según presión e IMC
- Recordatorios locales programables
- Respaldo en Google Drive (exporta e importa en JSON)
- Perfil editable con cálculo de IMC automático
- Tema oscuro

## Stack

- **Expo SDK 54** + React Native + TypeScript
- **Expo Router** — navegación basada en archivos (tabs + stack)
- **expo-sqlite** — base de datos local SQLite
- **expo-notifications** — recordatorios locales
- **expo-auth-session** + Google Drive API — respaldo en la nube
- **react-native-reanimated** — animaciones de transición sin parpadeo
- **react-native-svg** — gráfico de tendencia de presión arterial

## Cómo ejecutar

### Requisitos

- Node 18+
- Expo Go instalado en tu teléfono ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Pasos

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go. Para abrir en emulador Android presiona `a`.

> **Nota:** las notificaciones locales no están disponibles en Expo Go (limitación del SDK 54). Funcionan en builds de desarrollo o producción generadas con EAS.

### Generar APK para instalar directamente en un teléfono

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Estructura del proyecto

```
app/                          # Pantallas (Expo Router — cada archivo = una ruta)
├── (tabs)/
│   ├── index.tsx             # Inicio: última medición, promedios, gráfico
│   ├── history.tsx           # Historial agrupado por día
│   └── profile.tsx           # Perfil del usuario + menú de navegación
├── onboarding.tsx            # Configuración inicial (5 pasos)
├── record.tsx                # Registrar nueva medición
├── readings-detail.tsx       # Detalle de mediciones por rango (7 o 30 días)
├── recommendations.tsx       # Recomendaciones OMS expandibles
├── reminders.tsx             # Gestión de recordatorios
├── backup.tsx                # Respaldo en Google Drive
├── settings.tsx              # Idioma, tema, borrar datos
└── _layout.tsx               # Raíz: inicialización de SQLite + árbol de navegación

src/
├── db/
│   ├── schema.ts             # Definición de tablas SQLite
│   ├── client.ts             # Singleton de conexión a la base de datos
│   └── repositories.ts       # CRUD por entidad (lecturas, perfil, recordatorios)
├── hooks/
│   ├── useReadings.ts        # Estado y operaciones de mediciones
│   └── useProfile.ts         # Estado y operaciones del perfil
├── lib/
│   ├── oms.ts                # Clasificación OMS de presión arterial
│   ├── recommendations.ts    # Recomendaciones según presión e IMC
│   ├── i18n.ts               # Textos ES/EN + funciones de fecha y promedio
│   ├── notifications.ts      # Programación de recordatorios locales
│   └── drive.ts              # Integración con Google Drive
├── components/
│   ├── AreaChart.tsx         # Gráfico SVG de tendencia con zonas OMS
│   ├── ScreenSlide.tsx       # Animación de entrada para pantallas de stack
│   ├── TabFade.tsx           # Animación de entrada para pestañas
│   └── Logo.tsx              # Logo SVG de la app
└── theme/
    └── tokens.ts             # Colores, tipografía y espaciado base
```

## Configurar Google Drive (opcional)

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Activa la **Google Drive API**
3. Crea credenciales **OAuth 2.0** de tipo Android
4. Agrega tu Client ID en un archivo `.env` en la raíz del proyecto:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
```

## Clasificación OMS

La app clasifica cada medición según los rangos de la Organización Mundial de la Salud:

| Categoría     | Sistólica     | Diastólica    | Color    |
|---------------|---------------|---------------|----------|
| Óptima        | < 120         | < 80          | Verde    |
| Normal        | 120–129       | 80–84         | Lima     |
| Normal alta   | 130–139       | 85–89         | Amarillo |
| HTA Grado 1   | 140–159       | 90–99         | Naranja  |
| HTA Grado 2   | 160–179       | 100–109       | Rojo     |
| HTA Grado 3   | ≥ 180         | ≥ 110         | Rojo oscuro |

La clasificación aplica el criterio más alto entre sistólica y diastólica.
