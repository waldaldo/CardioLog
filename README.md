# CardioLog

Aplicación móvil para registro y seguimiento de presión arterial, construida con React Native y Expo. Disponible para **Android** e **iOS**.

**Diseñada con dos principios no negociables: simplicidad y privacidad.**
Todos los datos se almacenan exclusivamente en el dispositivo. La app no tiene servidores propios, no requiere cuenta, no recopila datos de uso, no envía analíticas y no accede a internet en ningún momento. Lo que registras es tuyo y solo tuyo.

## Características

- Registro de mediciones (sistólica, diastólica, pulso) con clasificación OMS en tiempo real
- Historial agrupado por día con gráfico de tendencia
- Promedios de 7 y 30 días con métricas de variabilidad (desvío estándar y coeficiente de variación) en el detalle
- Recomendaciones de estilo de vida personalizadas según presión e IMC
- Recordatorios locales programables (sin internet)
- Pantalla de bloqueo con PIN (hash PBKDF2) y biometría
- Onboarding guiado de 5 pasos para nueva configuración
- Exportar respaldo en JSON (con cifrado AES-256 opcional) o PDF, e importar desde archivo
- Perfil editable con cálculo de IMC automático
- Tema oscuro y claro con cambio en tiempo real
- Soporte completo para iOS y Android

## Privacidad

CardioLog no recopila, transmite ni almacena ningún dato personal fuera del dispositivo.

| Aspecto | Detalle |
|---|---|
| Almacenamiento | SQLite local — los datos nunca salen del dispositivo sin acción explícita del usuario |
| Red | La app no realiza ninguna conexión a internet en modo normal de uso |
| Cuentas | No requiere registro ni inicio de sesión de ningún tipo |
| Analíticas | Sin telemetría, sin seguimiento de uso, sin crashlytics |
| Respaldo | El usuario genera el archivo y elige manualmente dónde guardarlo (Drive, correo, USB, etc.) |
| Terceros | No se integra ningún SDK de publicidad, métricas ni redes sociales |

El código es abierto y auditable.

## Stack

- **Expo SDK 54** + React Native + TypeScript
- **Expo Router** — navegación basada en archivos (tabs + stack)
- **expo-sqlite** — base de datos local SQLite
- **expo-notifications** — recordatorios locales
- **expo-document-picker** + **expo-sharing** — exportar e importar respaldos sin OAuth
- **expo-print** — generación del informe PDF
- **expo-local-authentication** — bloqueo con PIN y biometría
- **expo-localization** — detección automática de idioma del dispositivo
- **crypto-js** — hash PBKDF2 del PIN y cifrado AES-256 de respaldos
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

### Generar APK con EAS (nube)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### Generar APK local con Android Studio

Requisitos previos:

- [Android Studio](https://developer.android.com/studio) instalado
- SDK de Android con `ANDROID_HOME` configurado
- Un emulador creado en Android Studio **o** un dispositivo físico con depuración USB activada

1. Compilar la APK de debug:

```bash
npm install
npx expo run:android
```

Esto compila el proyecto nativo y lo instala automáticamente en el emulador o dispositivo conectado. La APK de debug queda en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

2. Generar una APK de release firmada (opcional):

```bash
cd android
./gradlew assembleRelease
```

La APK de release queda en:

```
android/app/build/outputs/apk/release/app-release.apk
```

> Si no tienes un keystore de release, puedes usar el de debug incluido en `android/app/debug.keystore` (solo para pruebas).

3. Instalar via adb en un dispositivo conectado:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

> Asegúrate de que el dispositivo tenga **Depuración USB** activada (Configuración → Opciones de desarrollador) y que `adb devices` lo liste como autorizado.

4. Verificar conexión del dispositivo:

```bash
adb devices
```

Debería mostrar algo como:

```
List of devices attached
R5CR80XXXX  device
```

### Generar build para iOS (macOS)

Requisitos previos:

- macOS con Xcode instalado
- CocoaPods (`pod install` dentro de `ios/`)

1. Instalar dependencias:

```bash
npm install
cd ios && pod install && cd ..
```

2. Compilar:

```bash
npx expo run:ios
```

> En un Mac con Xcode configurado, esto abrirá el simulador y terminará de compilar el proyecto nativo automáticamente.

## Estructura del proyecto

```
app/                          # Pantallas (Expo Router — cada archivo = una ruta)
├── (tabs)/                   # Bottom tabs (2: Inicio, Perfil)
│   ├── _layout.tsx           # Tabs layout
│   ├── index.tsx             # Inicio: última medición, promedios, gráfico, historial
│   └── profile.tsx           # Perfil del usuario + menú de navegación
├── _layout.tsx               # Raíz: inicialización de SQLite + árbol de navegación
├── onboarding.tsx            # Configuración inicial (5 pasos)
├── record.tsx                # Registrar nueva medición (modal)
├── readings-detail.tsx       # Detalle de período con variabilidad (σ y CV)
├── recommendations.tsx       # Recomendaciones OMS expandibles
├── reminders.tsx             # Gestión de recordatorios
├── backup.tsx                # Exportar/importar JSON (cifrado opcional) y PDF
├── settings.tsx              # Idioma, tema, PIN, borrado, auto-eliminación
├── lock.tsx                  # Pantalla de bloqueo con PIN + biometría
└── set-pin.tsx               # Configuración/cambio de PIN

src/
├── db/
│   ├── schema.ts             # Definición de tablas SQLite
│   ├── client.ts             # Singleton de conexión a la base de datos
│   └── repositories.ts       # CRUD por entidad (lecturas, perfil, recordatorios, ajustes)
├── hooks/
│   ├── useReadings.ts        # Estado y operaciones de mediciones
│   └── useProfile.ts         # Estado y operaciones del perfil
├── lib/
│   ├── oms.ts                # Clasificación OMS de presión arterial + IMC
│   ├── stats.ts              # Desvío estándar (muestral) y coeficiente de variación
│   ├── recommendations.ts    # Recomendaciones según presión e IMC
│   ├── i18n.ts               # Textos ES/EN + helpers de fecha, promedio y formato
│   ├── notifications.ts      # Programación de recordatorios locales
│   ├── drive.ts              # Exportar/importar respaldos JSON (cifrado AES-256 opcional)
│   ├── chartSvg.ts           # Generador de SVG del gráfico para el PDF
│   └── pdfReport.ts          # Generación del informe PDF (HTML → PDF)
├── components/
│   ├── AreaChart.tsx         # Gráfico SVG interactivo con zonas OMS
│   ├── SummaryChart.tsx      # Gráfico de resumen para la pantalla de detalle
│   ├── ScreenSlide.tsx       # Animación de entrada para pantallas de stack
│   ├── TabFade.tsx           # Animación de entrada para pestañas
│   ├── ScreenHeader.tsx      # Header adaptativo
│   ├── Logo.tsx              # Logo SVG de la app
│   ├── BackButton.tsx        # Botón de volver
│   └── SplashOverlay.tsx     # Overlay del splash
├── context/
│   ├── LangContext.tsx       # Idioma actual (es/en) con detección automática
│   └── ThemeContext.tsx      # Tema claro/oscuro persistido
├── theme/
│   └── tokens.ts             # Sistema de diseño WCAG AA (colores, tipografía, espaciado)
├── __mocks__/
│   └── expo-sqlite.ts        # Mock de expo-sqlite para tests Jest
└── types/
    └── expo-local-authentication.d.ts  # Tipos para autenticación local
```

## Respaldo y restauración

El respaldo no requiere configuración ni cuentas adicionales. La exportación usa el menú de compartir del sistema, sin OAuth ni servidores propios.

- **Exportar JSON (opcional cifrado):** genera un archivo `cardiolog-backup-YYYY-MM-DD.json`. Si se activa la opción de cifrado, el archivo resultante tiene un envelope `pbkdf2-sha256-100k` (PBKDF2 con SHA-256, 100 000 iteraciones) y los datos van cifrados con AES-256-CBC. El usuario elige dónde guardarlo (Drive, correo, Telegram, USB, etc.).
- **Exportar PDF:** genera un informe en PDF con gráfico de tendencia, métricas de variabilidad (σ y CV) y tabla de historial. Se puede acotar a todos los datos, últimos 30 días o últimos 90 días.
- **Importar:** abre el selector de archivos del sistema para elegir un respaldo `.json` previo. Si está cifrado, se pide la contraseña. Muestra un resumen antes de confirmar, y reemplaza el perfil y mediciones actuales con los datos del archivo.

El formato del archivo de respaldo (texto plano, antes del cifrado) es:

```json
{
  "version": 1,
  "exported_at": "2025-04-29T10:00:00.000Z",
  "profile": { "name": "...", "age": 60, ... },
  "readings": [ { "ts": "...", "sys": 120, "dia": 80, ... } ]
}
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
