# Documento de Seguimiento IA - Senda URJC

## Herramientas de IA utilizadas

- **Claude (Opus 4.7 / Sonnet 4.6)** vía interfaz web claude.ai como asistente principal para scaffolding, generación de código, documentación y resolución de dudas.

## Iteraciones

### Iteración 1: Scaffolding inicial del frontend

**Fecha:** 22/04/2026

**Objetivo:** Crear la estructura base del prototipo con React 19 + Vite + TypeScript + Tailwind CSS, incorporando autenticación mockeada contra el SSO institucional, navegación entre pantallas, mapa interactivo con OpenStreetMap, soporte multilingüe (ES/EN) y configuración como PWA instalable.

**Requisitos cubiertos:**

- RF-01 Autenticación mediante SSO (mockeada en local).
- RNF-10 Soporte multilingüe (español e inglés).
- RNF-17 Soporte de Android e iOS mediante PWA.

**Prompt empleado:**

```
# Iteración 1 — Esqueleto del prototipo Senda URJC

## Contexto

Estoy desarrollando el prototipo evolutivo de Senda URJC, una PWA que
ofrece rutas seguras por los campus de la Universidad Rey Juan Carlos.
Este es el primer prompt de una serie de iteraciones que registraré en
el fichero `seguimiento_ia.md` del repositorio, como parte de la entrega
opcional de la práctica de Análisis e Ingeniería de Requisitos
(curso 2025/26).

Tienes el ERS v8.0 del proyecto y los diagramas UML en el conocimiento
del proyecto. Consúltalos cuando necesites verificar algún requisito.

[... resto del prompt literal tal y como se envió a Claude; recuperar
del historial de claude.ai y pegar completo ...]
```

**Prompts correctivos posteriores (mismo hilo):**

- *Aviso 1:* instrucción para no usar `: JSX.Element` como tipo de retorno en componentes funcionales, incompatible con React 19 + TypeScript actual.
- *Aviso 2:* instrucción para que, cuando el prompt contemple ficheros placeholder (como iconos binarios), se genere su contenido real o se advierta claramente de que quedan pendientes de ser creados por el equipo.

**Contexto proporcionado:**

- Enunciado de la práctica (`Caso_de_Estudio_1_0.pdf`).
- Especificación de Requisitos Software (`ERS_Senda_URJC_v8.0.docx`).
- Diagramas UML del sistema (casos de uso, clases y estados en formato SVG).
- Conversación previa sobre elección de stack tecnológico (PWA con React + Vite + Tailwind + react-leaflet).
- Estado inicial del repositorio: proyecto Vite recién generado, dependencias instaladas (`react`, `react-dom`, `typescript`, `tailwindcss@3`, `react-router-dom`, `react-leaflet`, `leaflet`, `react-i18next`, `i18next`, `i18next-browser-languagedetector`, `vite-plugin-pwa`).

**Artefactos generados:**

Ficheros nuevos (creados a partir de la respuesta de Claude):

- `frontend/src/i18n/index.ts` — inicialización de i18next con detección de idioma y persistencia en localStorage.
- `frontend/src/i18n/locales/es.json` — traducciones en español.
- `frontend/src/i18n/locales/en.json` — traducciones en inglés.
- `frontend/src/auth/AuthContext.tsx` — provider y hook `useAuth` para el estado de autenticación.
- `frontend/src/auth/types.ts` — tipos `User` y `AuthState`.
- `frontend/src/components/Layout.tsx` — layout principal con TopBar y `<Outlet />`.
- `frontend/src/components/TopBar.tsx` — barra superior con logo, título, selector de idioma y botón de cerrar sesión.
- `frontend/src/components/LanguageSwitcher.tsx` — selector ES/EN.
- `frontend/src/components/MapView.tsx` — mapa Leaflet centrado en el campus de Móstoles.
- `frontend/src/components/ProtectedRoute.tsx` — envoltura de rutas protegidas con redirección a `/login`.
- `frontend/src/pages/LoginPage.tsx` — pantalla de inicio de sesión mockeada.
- `frontend/src/pages/HomePage.tsx` — pantalla principal con mapa.
- `frontend/src/pages/RouteRequestPage.tsx` — placeholder para la iteración 2.
- `frontend/public/icons/icon-192.png` — icono PWA 192×192 (generado manualmente tras detección del fallo).
- `frontend/public/icons/icon-512.png` — icono PWA 512×512 (generado manualmente tras detección del fallo).

Ficheros modificados:

- `frontend/src/main.tsx` — bootstrap con Router, AuthProvider e import de i18n.
- `frontend/src/App.tsx` — definición de rutas.
- `frontend/src/index.css` — directivas de Tailwind.
- `frontend/vite.config.ts` — configuración de `vite-plugin-pwa` (manifest "Senda URJC", tema `#C00000`, registro automático de Service Worker).

**Evaluación:**

- **Correctas:**
  - Estructura de carpetas y separación de responsabilidades.
  - Configuración de i18next con persistencia en localStorage y detección de idioma del navegador.
  - Flujo de autenticación mockeada con AuthContext y ruta protegida funcional.
  - Mapa de Leaflet centrado correctamente en Móstoles (40.336, -3.875) con tiles de OpenStreetMap.
  - Configuración de `vite-plugin-pwa` con manifest válido (nombre, colores, display standalone) y Service Worker que se registra y activa correctamente (verificado en DevTools → Application).
  - Paleta corporativa y estilos Tailwind consistentes.

- **Parciales:**
  - La documentación del propio código sobre cómo probar la PWA mencionaba pasos correctos pero no advertía de que los iconos placeholder no estaban realmente generados, lo que llevó a verificar la instalabilidad y encontrar el fallo (ver "Fallidas").

- **Fallidas:**
  - **TS2503 "Cannot find namespace 'JSX'"** al ejecutar `npm run build`. El código generado usaba `: JSX.Element` como tipo de retorno explícito en 10 componentes funcionales. Este patrón, válido en React 18, es incompatible con React 19 + TypeScript actual, donde el namespace JSX ya no es global.
  - **PWA no instalable por ausencia de iconos.** El prompt contemplaba iconos placeholder en `frontend/public/icons/` pero la respuesta no generó el contenido real de los PNG, únicamente indicó sus rutas. Chrome DevTools → Application → Manifest reportaba "Icon ... failed to load" para ambos tamaños y el mensaje "Installability: No supplied icon is at least 144 pixels square", por lo que el botón de instalar no aparecía en la barra de direcciones.

- **Correcciones aplicadas:**
  - **TS2503:** eliminación del tipo de retorno `: JSX.Element` en los 10 ficheros afectados (`App.tsx`, `AuthContext.tsx`, `LanguageSwitcher.tsx`, `Layout.tsx`, `MapView.tsx`, `ProtectedRoute.tsx`, `TopBar.tsx`, `HomePage.tsx`, `LoginPage.tsx`, `RouteRequestPage.tsx`) mediante *Find & Replace* en VS Code. TypeScript infiere el tipo de retorno desde el JSX devuelto, lo que además se considera mejor estilo en la versión actual. Se envió a Claude un mensaje correctivo para que no reintroduzca el patrón en iteraciones futuras.
  - **Iconos PWA:** generación manual de los dos PNG (192×192 y 512×512, fondo `#C00000`, texto "SU" en blanco centrado) y ubicación en `frontend/public/icons/`. Tras recompilar con `npm run build && npm run preview`, el manifest se validó sin errores, el Service Worker se mantuvo activado y el botón de instalar apareció correctamente en la barra de direcciones. Al pulsarlo, la aplicación se instala como ventana independiente. Se envió a Claude un mensaje correctivo para que en lo sucesivo, cuando contemple ficheros placeholder, los genere explícitamente o advierta de su ausencia.

**Decisiones de diseño:**

- **SSO mockeado.** El prototipo simula la autenticación creando una sesión local con un usuario dummy (`usuario.prueba@urjc.es`) persistida en localStorage. La integración real con el SSO institucional queda fuera del alcance del prototipo académico.
- **OpenStreetMap como proveedor de tiles.** Gratuito y sin claves de API, coherente con el RNF-21 (uso prioritario de tecnologías Open Source).
- **React Context en lugar de Redux** para el estado de autenticación, por simplicidad y por evitar dependencias innecesarias para el alcance del prototipo.

**Pendiente para la próxima iteración:**

- RF-02 Solicitud de rutas entre origen y destino mediante selección sobre el mapa.
- RF-03 Generación de al menos tres rutas alternativas.
- RF-04 Clasificación de rutas por Índice de Seguridad Percibida.
- RF-05 Presentación simplificada del ISP en tres niveles (alto, medio, bajo).
- RF-13 Recálculo de ruta a petición de la persona usuaria.
- RF-14 y RF-15 Restricción del cálculo al ámbito de cobertura (campus URJC y 500 m a la redonda).
