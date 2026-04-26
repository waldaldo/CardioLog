# Pasos rápidos para lanzar en tu Android

## 1. Instalar Node y Expo

```bash
# Node 18+ desde https://nodejs.org
npm install -g expo-cli eas-cli
```

## 2. Instalar dependencias

```bash
cd tensiovida-app
npm install
```

## 3. Probar en tu teléfono (modo desarrollo)

1. Instala **Expo Go** desde Play Store
2. En tu PC:
   ```bash
   npx expo start
   ```
3. Escanea el QR con Expo Go → la app carga en tu teléfono

> ⚠️ Google Drive OAuth **NO funciona en Expo Go** — requiere build nativa (paso 4).

## 4. Build de desarrollo con Google Drive funcional

```bash
# Una sola vez:
eas login
eas build:configure

# Build APK de desarrollo:
eas build --platform android --profile preview
```

Descarga el APK desde el link que te da EAS, instálalo en tu teléfono.

## 5. Configurar Google Drive (antes del build)

1. https://console.cloud.google.com → crea proyecto → activa **Google Drive API**
2. **Pantalla de consentimiento OAuth**: tipo externo, agrega tu email como tester
3. **Credenciales → OAuth Client ID → Android**:
   - Package name: `com.tensiovida.app`
   - SHA-1: ejecuta `eas credentials` → Android → muestra keystore → copia SHA-1
4. Copia el Client ID a `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
   ```
5. Rebuild: `eas build --platform android --profile preview`

## 6. Publicar en Google Play Store

1. Pagar cuenta Developer (USD 25, una sola vez): https://play.google.com/console
2. Crear política de privacidad (obligatorio por datos de salud)
3. Build de producción:
   ```bash
   eas build --platform android --profile production
   eas submit --platform android --latest
   ```
4. Completar ficha en Play Console → enviar a revisión (~3 días)

## Dudas comunes

**¿Puedo correr la app ahora?** Sí, con `npx expo start` + Expo Go. Todo funciona menos Drive.

**¿Los datos están en el teléfono?** Sí, en SQLite local. Drive es solo respaldo.

**¿Qué pasa si desinstalo?** Se pierden los datos locales, pero puedes restaurar desde Drive (endpoint `listDriveBackups` + función de restore a implementar).
