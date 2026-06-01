# Informe de Análisis del Proyecto CardioLog

## Resumen Ejecutivo
CardioLog es una aplicación móvil para el registro y seguimiento de presión arterial, construida con React Native y Expo. La aplicación se distingue por sus principios fundamentales de simplicidad y privacidad, almacenando todos los datos exclusivamente en el dispositivo sin realizar ninguna conexión a internet o recopilar datos de uso.

## Estado Actual del Repositorio
- **Rama actual**: `enhancements-dev`
- **Archivos sin seguimiento**: `screenshot_home.png` (probable captura de pantalla para documentación)
- **Últimos commits**: Indicadores de desarrollo activo con características recientes como gráficos interactivos, notas de mediciones, consejos de salud y mejoras de accesibilidad

## Características Principales Implementadas
1. **Registro de mediciones**: Sistólica, diastólica y pulso con clasificación OMS en tiempo real
2. **Historial y tendencias**: Agrupado por día con gráfico de tendencia de presión arterial
3. **Análisis de datos**: Promedios de 7 y 30 días con acceso al detalle de cada rango
4. **Recomendaciones personalizadas**: Según presión arterial e IMC (Índice de Masa Corporal)
5. **Recordatorios locales**: Programables sin requerir conexión a internet
6. **Funcionalidad de respaldo**: Exportar e importar en formato JSON o PDF
7. **Perfil de usuario**: Editable con cálculo automático de IMC
8. **Interfaz adaptativa**: Tema oscuro y claro con cambio en tiempo real

## Enfoque de Privacidad
- **Almacenamiento**: SQLite local - los datos nunca salen del dispositivo sin acción explícita del usuario
- **Red**: La aplicación no realiza ninguna conexión a internet en modo normal de uso
- **Cuentas**: No requiere registro ni inicio de sesión de ningún tipo
- **Analíticas**: Sin telemetría, sin seguimiento de uso, sin herramientas de monitoreo de errores
- **Respaldo**: El usuario genera el archivo y elige manualmente dónde guardarlo (Google Drive, correo, USB, etc.)
- **Integraciones de terceros**: No se integra ningún SDK de publicidad, métricas ni redes sociales
- **Código abierto**: Totalmente auditable por la comunidad

## Detalles Técnicos
### Stack Tecnológico
- **Expo SDK 54** + React Native + TypeScript
- **Expo Router** - Navegación basada en archivos (tabs + stack)
- **expo-sqlite** - Base de datos local SQLite
- **expo-notifications** - Recordatorios locales
- **expo-document-picker** + **expo-sharing** - Exportar e importar respaldos sin OAuth
- **react-native-reanimated** - Animaciones de transición sin parpadeo
- **react-native-svg** - Gráfico de tendencia de presión arterial

### Estructura del Proyecto
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
├── backup.tsx                # Respaldo en Google Drive (en realidad, usa expo-sharing)
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
│   └── drive.ts              # Exportar/importar respaldos JSON (expo-sharing + expo-document-picker)
├── components/
│   ├── AreaChart.tsx         # Gráfico SVG de tendencia con zonas OMS
│   ├── ScreenSlide.tsx       # Animación de entrada para pantallas de stack
│   ├── TabFade.tsx           # Animación de entrada para pestañas
│   └── Logo.tsx              # Logo SVG de la app
└── theme/
    └── tokens.ts             # Colores, tipografía y espaciado base
```

## Formato de Respaldo
El archivo de respaldo generado por la aplicación sigue este formato JSON:
```json
{
  "version": 1,
  "exported_at": "2025-04-29T10:00:00.000Z",
  "profile": { "name": "...", "age": 60, ... },
  "readings": [ { "ts": "...", "sys": 120, "dia": 80, ... } ]
}
```

## Clasificación OMS de Presión Arterial
La aplicación clasifica cada medición según los rangos de la Organización Mundial de la Salud:

| Categoría     | Sistólica     | Diastólica    | Color    |
|---------------|---------------|---------------|----------|
| Óptima        | < 120         | < 80          | Verde    |
| Normal        | 120–129       | 80–84         | Lima     |
| Normal alta   | 130–139       | 85–89         | Amarillo |
| HTA Grado 1   | 140–159       | 90–99         | Naranja  |
| HTA Grado 2   | 160–179       | 100–109       | Rojo     |
| HTA Grado 3   | ≥ 180         | ≥ 110         | Rojo oscuro |

*Nota: La clasificación aplica el criterio más alto entre sistólica y diastólica.*

## Instrucciones de Ejecución
### Requisitos
- Node 18+
- Expo Go instalado en el dispositivo (Android/iOS)

### Pasos para Desarrollo
```bash
npm install
npx expo start
```
Luego escanear el código QR con Expo Go o presionar `a` para abrir en emulador Android.

### Generación de APK
1. **Con EAS (nube)**:
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform android --profile preview
   ```

2. **Local con Android Studio**:
   ```bash
   npx expo run:android
   ```
   La APK de debug se genera en: `android/app/build/outputs/apk/debug/app-debug.apk`

## Limitaciones Actuales
- Las notificaciones locales no están disponibles en Expo Go (limitación del SDK 54). Requieren builds de desarrollo o producción generados con EAS.
- El archivo `screenshot_home.png` actualmente está sin seguimiento en git.

## Próximos Pasos Sugeridos
1. Considerar agregar el archivo `screenshot_home.png` al repositorio si es relevante para documentación
2. Explorar oportunidades para mejorar la cobertura de pruebas
3. Considerar la implementación de integración continua para builds automatizados
4. Evaluar la posibilidad de agregar más métricas de salud relacionadas (glucosa, peso, etc.) manteniendo el enfoque de privacidad

## Conclusión
CardioLog representa una aplicación bien diseñada y ejecutada que cumple con sus objetivos principales de proporcionar una herramienta sencilla y privada para el seguimiento de la presión arterial. La arquitectura es modular, sigue las mejores prácticas de React Native/Expo, y pone un énfasis significativo en la privacidad del usuario, lo cual es particularmente valioso en una aplicación de salud.