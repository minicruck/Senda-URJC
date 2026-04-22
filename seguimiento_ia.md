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

---

### Iteración 2: Solicitud de ruta con origen, destino y alternativas

**Fecha:** 22/04/2026

**Objetivo:** Convertir la pantalla `/route-request` (placeholder en la iteración 1) en una herramienta funcional de planificación de ruta. Seleccionar origen y destino mediante dos métodos complementarios (buscador de direcciones con Nominatim y clicks sobre el mapa), validar que ambos puntos estén dentro del ámbito de cobertura de los campus URJC, generar tres rutas alternativas simuladas clasificadas por Índice de Seguridad Percibida y ofrecer la posibilidad de recalcularlas.

**Requisitos cubiertos:**

- RF-02 Solicitud de rutas entre origen y destino.
- RF-03 Generación de rutas alternativas (tres simuladas).
- RF-04 Clasificación de rutas por Índice de Seguridad Percibida.
- RF-05 Presentación simplificada del ISP en tres niveles (alto, medio, bajo).
- RF-13 Recálculo de ruta a petición de la persona usuaria.
- RF-14 Cobertura geográfica del servicio de rutas (campus URJC + 500 m).
- RF-15 Restricción de rutas fuera del perímetro de cobertura.

Casos de uso del ERS afectados: CU-02 (Indicar puntos de origen y destino), CU-03 (Solicitar una ruta) y CU-04 (Consultar rutas alternativas).

**Prompt empleado:**

```
# Iteración 2 — Solicitud de ruta con origen, destino y alternativas

[... resto del prompt literal tal y como se envió a Claude; recuperar
del historial de claude.ai y pegar completo ...]
```

**Prompts correctivos posteriores (mismo hilo):**

- *Aviso 3:* instrucción sobre tres problemas detectados en el código generado: contenedor del mapa que colapsa a altura cero en vista móvil/tablet, parámetros sin tipar que provocan TS7006 con `strict: true`, y referencias incorrectas a la versión del ERS (v7.0 en lugar de v8.0).

**Contexto proporcionado:**

- ERS v8.0 del proyecto.
- Diagramas UML (casos de uso, clases y estados en formato SVG).
- Estado del repositorio tras la iteración 1 (esqueleto funcional con autenticación mockeada, mapa Leaflet centrado en Móstoles, i18n ES/EN y PWA instalable).
- Decisiones de diseño acordadas con el equipo previamente: selección mixta (buscador + clicks), rutas simuladas en lugar de OSRM real, reutilización de la pantalla `/route-request` existente como placeholder.

**Artefactos generados:**

Ficheros nuevos:

- `frontend/src/types/route.ts` — tipos de dominio (`LatLng`, `SafetyLevel`, `EndpointKind`, `Route`, `GeocodeSuggestion`).
- `frontend/src/services/coverage.ts` — constantes de los cinco campus, fórmula de Haversine y función `isWithinCoverage`.
- `frontend/src/services/geocoding.ts` — cliente de Nominatim para el autocompletado de direcciones, con sesgo hacia la zona de cobertura.
- `frontend/src/services/routing.ts` — generación simulada de tres rutas alternativas (principal + dos desviaciones perpendiculares) con ISP aleatorio y clasificación en tres niveles.
- `frontend/src/hooks/useRoutePlanner.tsx` — Provider y hook del estado compartido de la pantalla (origen, destino, rutas, ruta activa, endpoint actual, errores).
- `frontend/src/components/AddressSearchInput.tsx` — input con autocompletado y debouncing manual de 400 ms, más botón de "usar mi ubicación actual".
- `frontend/src/components/CoverageCircles.tsx` — círculos de 500 m alrededor de cada campus dibujados sobre el mapa.
- `frontend/src/components/RouteMap.tsx` — mapa principal de la pantalla con marcadores, polilíneas de rutas y gestión de clicks.
- `frontend/src/components/RouteList.tsx` — listado de rutas propuestas con sus métricas (ISP, distancia, tiempo estimado).

Ficheros modificados:

- `frontend/src/pages/RouteRequestPage.tsx` — pantalla completa sustituyendo el placeholder por el layout responsivo (panel de controles + mapa).
- `frontend/src/pages/HomePage.tsx` — botón prominente de acceso a la pantalla de rutas.
- `frontend/src/i18n/locales/es.json` y `en.json` — nuevas cadenas para la pantalla de rutas, niveles de seguridad, mensajes de error y etiquetas de métricas.

**Evaluación:**

- **Correctas:**
  - Separación limpia entre servicios (cálculo, geocodificación, cobertura), tipos de dominio, estado (hook) y presentación.
  - Validación de cobertura unificada en `setEndpoint` del Provider: da igual el origen del punto (click, buscador o geolocalización), la regla es uniforme.
  - Cálculo de desviaciones perpendiculares en proyección ENU local (metros reales, no grados), de modo que el offset se ve visualmente perpendicular en cualquier latitud.
  - Debouncing manual de 400 ms con `AbortController` que cancela peticiones de Nominatim al teclear seguido.
  - Marcadores de origen y destino como `L.divIcon` con SVG embebido, evitando la dependencia de las imágenes PNG por defecto de Leaflet que no se resuelven limpiamente con Vite.
  - Función `classifySafety` exportada desde el servicio de rutas, lista para reutilizarla cuando el backend entregue un ISP real.
  - Internacionalización correcta de toda la nueva UI, sin strings hardcoded.

- **Parciales:**
  - El cumplimiento de RF-06 ("cálculo en tiempo real a partir de iluminación, afluencia y estado del entorno") es simulado: el ISP se genera aleatoriamente porque no existe todavía el backend ni la integración con el sistema LumenSmart.
  - El perímetro de cobertura está modelado como circunferencia de 500 m alrededor del centro de cada campus, no como polígono real del recinto. Es una simplificación aceptable del enunciado del ERS.
  - Nominatim pide un `User-Agent` descriptivo en sus términos de uso, pero los navegadores tratan esa cabecera como "forbidden header" (Fetch spec) y la descartan silenciosamente. Se compensa enviando el parámetro `email=` (método oficial de Nominatim para identificar peticiones), pero queda documentado como limitación.

- **Fallidas:**
  - **Mapa invisible en vista móvil/tablet.** El contenedor `<div>` que envuelve a `<RouteMap />` en `RouteRequestPage.tsx` empleaba `flex-1` sin altura definida en el padre, lo que colapsaba el contenedor a altura cero por debajo de 1024 px. En pantallas grandes el mapa se veía correctamente (porque el contenedor `<section>` de la página, al ser flex-row con hijos sin `flex-1` en el aside, repartía el ancho y no la altura), pero al pasar a móvil/tablet la regla flex ya no aplicaba como se esperaba y el mapa quedaba con 0 px de alto, sin aparecer.
  - **Dos parámetros sin tipar en RouteMap.tsx.** Los callbacks `.map((p) => [p.lat, p.lng])` en `RoutePolyline` (línea 129) y en `AutoBoundsFitter` (línea 164) dejaban el parámetro `p` sin tipo explícito. Con `strict: true` en `tsconfig`, TypeScript rechaza la compilación con 10 errores: dos TS7006 directos más ocho TS2307 en cascada (porque el fallo inicial con el fichero de tipos omitido impedía a TS resolver el resto).
  - **Referencia a versión incorrecta del ERS en las notas del propio Claude** (v7.0 en lugar de v8.0). No afecta al código, pero ensucia la documentación generada.

- **Correcciones aplicadas:**
  - **Mapa invisible:** el contenedor pasó de `relative h-[60vh] min-h-[320px] flex-1 lg:h-auto` a `relative h-[60vh] min-h-[400px] w-full flex-shrink-0 lg:h-auto lg:flex-1 lg:flex-shrink`. En móvil/tablet se fuerza altura explícita (60% del viewport con mínimo de 400 px) y se impide que el padre flex le reduzca el espacio (`flex-shrink-0`). En `lg:` (≥1024 px) se restaura el comportamiento original (`flex-1` y `flex-shrink` habilitados). Verificado con `Ctrl+Shift+M` en DevTools con perfiles "iPhone 14 Pro" y "Laptop 1024 px".
  - **Tipos implícitos:** añadido `LatLng` al `import type` de `../types/route` en `RouteMap.tsx` y tipados explícitos `(p: LatLng)` en las dos líneas afectadas. `npm run build` pasa limpio después.
  - **Referencia al ERS:** corregida manualmente durante la redacción de este seguimiento.
  - **Aviso 3 a Claude** con los tres problemas y las instrucciones para que no se repitan en próximas iteraciones.

**Incidencias adicionales de integración (no atribuibles a la IA):**

- Al integrar la respuesta de Claude, el fichero `frontend/src/types/route.ts` no se creó (se omitió por error durante el volcado manual de los artefactos). Esto provocó, junto con los dos parámetros sin tipar, diez errores de compilación al lanzar `npm run build`. Solución: creación del fichero con el contenido que Claude había devuelto al inicio de su respuesta.
- El Service Worker registrado por la PWA en la iteración 1 estaba sirviendo la versión cacheada desde `npm run preview` en lugar del nuevo build. Solución: verificación en ventana de incógnito (`Ctrl+Shift+N`), que arranca sin SW ni caché previa y permite confirmar que el build nuevo se sirve correctamente. Para próximas iteraciones, se deja marcada la casilla "Update on reload" en DevTools → Application → Service Workers mientras dure el desarrollo.

**Decisiones de diseño:**

- **Rutas simuladas en lugar de routing real con OSRM.** Se descarta OSRM público para esta iteración por dependencia externa (riesgo de caída o rate-limit el día de la entrega) y porque lo que se evalúa en el ERS no es la calidad del cálculo sino la presentación de alternativas clasificadas por ISP. La interfaz pública `calculateRoutes(origin, destination) → Route[]` queda lista para sustituir la simulación por OSRM en una iteración futura sin tocar el UI.
- **Selección mixta origen/destino.** Se implementan dos métodos complementarios: click en el mapa (para personas que conocen visualmente el destino) y buscador de direcciones por Nominatim (para personas que saben la dirección exacta). Ambos desembocan en la misma función de validación de cobertura.
- **Estado local a la pantalla mediante React Context.** El `RoutePlannerProvider` envuelve solo la pantalla `RouteRequestPage`, no el árbol global. Si en iteraciones futuras aparece un historial de rutas (RNF-18), se puede externalizar sin tocar el UI.
- **Extensión `.tsx` para `useRoutePlanner`.** El fichero contiene el Provider con JSX, por lo que requiere `.tsx` aunque el nombre sugiera un hook puro. Se optó por mantener Provider y hook en el mismo fichero para minimizar superficie; en iteraciones futuras, si crecen, se separarán.
- **Umbrales de clasificación:** ISP ≥ 70 → alto (verde `#16A34A`), 40-69 → medio (amarillo `#EAB308`), <40 → bajo (rojo `#DC2626`). Paleta con suficiente contraste para accesibilidad.

**Pendiente para la próxima iteración:**

- Reverse-geocoding al colocar marcadores por click, para rellenar también los inputs de texto.
- Modo «Voy contigo»: activar acompañante, compartir ubicación en tiempo real, emitir prealertas por desvío o parada (RF-20 a RF-28, CU-07, CU-09, CU-10).
- Reporte de incidencias sobre la ruta activa (RF-37 a RF-40, CU-12).
- Sustitución del cálculo simulado por OSRM real (en cuanto esté el backend).
- Indicador de antigüedad de los datos en cada ruta (RF-16, CU-05), relevante cuando haya datos reales de LumenSmart.
- Tests unitarios de `coverage.ts`, `routing.ts` y del Provider (Vitest + React Testing Library).

---

### Iteración 3: Modo «Voy contigo», monitorización y prealertas

**Fecha:** 22/04/2026

**Objetivo:** Incorporar el núcleo funcional del acompañamiento virtual del ERS. Nueva pantalla `/trip` con simulación del trayecto activo a 5 km/h, compartición simulada con una persona destinataria (contacto de confianza o voluntariado), detección automática de paradas y desvíos contra umbrales configurables, modal de prealerta con cuenta atrás de 30 segundos y escalado a alerta con panel del Servicio de Seguridad simulado. Añadida también la pantalla `/profile` con CRUD de contactos de confianza, sliders de umbrales de prealerta y alta/baja como persona voluntaria.

**Requisitos cubiertos:**

- RF-20 Activar modo «Voy contigo».
- RF-21 Selección de persona destinataria del acompañamiento.
- RF-22 Compartición de la ubicación durante el trayecto.
- RF-23 Visualización de la ubicación compartida por parte del destinatario (vista simulada, panel lateral).
- RF-24 Visualización de la ruta activa por parte del destinatario.
- RF-25 Detección de paradas inesperadas y desvíos.
- RF-26 Emisión de prealerta ante paradas o desvíos.
- RF-27 Confirmación manual del estado «estoy bien».
- RF-28 Plazo de 30 segundos para confirmar antes de escalar.
- RF-29 Configuración de umbrales de prealerta (tiempo de parada, distancia de desvío).
- RF-30 Notificación de alerta al destinatario.
- RF-31 Escalado al Servicio de Seguridad si no hay respuesta.
- RF-32 Contenido de la alerta (ubicación actual, ruta, persona usuaria, hora, destinatario).
- RF-33 Registro como persona voluntaria.
- RF-49 Configuración de personas de contacto de confianza.

Casos de uso del ERS afectados: CU-07 (Activar modo «Voy contigo»), CU-08 (Elegir destinatario), CU-09 (Compartir ubicación), CU-10 (Gestionar prealertas), CU-11 (Enviar alerta), CU-13 (Registrarse como voluntariado), CU-22 (Gestionar contactos de confianza), CU-23 (Configurar umbrales de prealerta).

**Prompt empleado:**

```
# Iteración 3 — Modo «Voy contigo», monitorización y prealertas

[... resto del prompt literal tal y como se envió a Claude; recuperar
del historial de claude.ai y pegar completo ...]
```

**Prompts correctivos posteriores (mismo hilo):**

- *Aviso 4:* aclaración sobre una respuesta incompleta. La primera versión de la iteración 3 que generó Claude omitió los siete ficheros fundacionales (tipos, servicios, hook `useTripRuntime`, componente `DestinationPicker`) e incluyó una línea del `TileLayer` con un artefacto `.replace(' ', '')` que corrompía la URL de tiles. Se solicitó explícitamente la regeneración de los ficheros omitidos y la iteración completa se volvió a lanzar.

**Contexto proporcionado:**

- ERS v8.0 del proyecto.
- Diagramas UML (casos de uso, clases y estados en formato SVG).
- Estado del repositorio tras la iteración 2 (pantalla `/routes` con solicitud funcional de rutas alternativas clasificadas por ISP).
- Decisiones de alcance acordadas con el equipo antes del prompt:
  - División del trabajo restante en dos iteraciones (esta, centrada en el modo «Voy contigo»; la siguiente, en reporte de incidencias y panel de administración).
  - Simulación del recorrido mediante animación automática con botón adicional "Forzar prealerta" siempre visible (opción mixta), en lugar de solo animación o solo botones manuales.
  - Creación de una pantalla nueva `/trip` independiente de `/routes`, en lugar de ampliar la existente.

**Artefactos generados:**

Ficheros nuevos:

- `frontend/src/types/trip.ts` — tipos de dominio (`TripState`, `TripRuntime`, `Recipient`, `Contact`, `Volunteer`, `AlertPayload`, `Thresholds`, `PrealertReason`).
- `frontend/src/services/storage.ts` — helpers para `localStorage` bajo el namespace `senda.*` (contactos, voluntariado por usuario, registro global de voluntariado, umbrales) con hooks reactivos (`useContacts`, `useStoredVolunteers`, `useThresholds`) sincronizados mediante un event-bus propio (`CustomEvent 'senda:storage'`).
- `frontend/src/services/monitoring.ts` — función `detectAnomaly(position, route, thresholds)` para validar paradas y desvíos contra umbrales.
- `frontend/src/services/trip.ts` — función `buildTripTrack(route, speedKmh)` que pre-calcula una secuencia de posiciones temporizadas a lo largo de la ruta.
- `frontend/src/services/alert.ts` — función `buildAlertPayload(trip, user)` que compone el objeto de datos a mostrar en el panel del Servicio de Seguridad.
- `frontend/src/hooks/useTripRuntime.tsx` — Provider y hook con reducer puro que modela la máquina de estados del trayecto (`preparing → in_progress → prealert → alert → completed/cancelled`), dos relojes independientes (tick de animación y clock de pared para cuenta atrás), y acciones expuestas (`startTrip`, `confirmOk`, `triggerAlert`, `resolveAlert`, `togglePause`, `simulateDeviation`, `forcePrealert`, `endTrip`, `cancelTrip`).
- `frontend/src/components/DestinationPicker.tsx` — modal accesible con la lista combinada de contactos y voluntarios disponibles; filtra al usuario actual para evitar autoacompañamiento.
- `frontend/src/components/TripPanel.tsx` — panel lateral con métricas en vivo (progreso, tiempo transcurrido/estimado, distancia, ISP, estado) y botones de acción (He llegado, Forzar prealerta, Simular parada, Simular desvío, Cancelar con confirmación inline).
- `frontend/src/components/TripMap.tsx` — mapa principal con la ruta activa, marcador del caminante como `divIcon` con SVG inline que cambia de color según el estado (azul normal, amarillo prealerta, rojo alerta), traza del historial de posiciones con polilínea discontinua y re-encuadre automático.
- `frontend/src/components/CompanionView.tsx` — vista simulada del destinatario: mini-mapa no interactivo con seguimiento automático y badge "ALERTA RECIBIDA" cuando procede.
- `frontend/src/components/PrealertModal.tsx` — modal accesible (`role="alertdialog"`, `aria-modal="true"`, `aria-live="assertive"` en la cuenta atrás) con cuenta atrás de 30 segundos y dos botones grandes (56 px).
- `frontend/src/components/SecurityPanel.tsx` — panel del Servicio de Seguridad simulado con los datos completos de la alerta (RF-32).
- `frontend/src/components/ContactsManager.tsx` — CRUD básico de contactos de confianza con persistencia en `localStorage`.
- `frontend/src/components/ThresholdsEditor.tsx` — dos sliders para tiempo de parada máximo (30-300 s) y distancia de desvío máxima (20-200 m).
- `frontend/src/components/VolunteerToggle.tsx` — switch accesible (role="switch", aria-checked) para dar de alta/baja el usuario actual como persona voluntaria.
- `frontend/src/pages/TripPage.tsx` — pantalla que envuelve el Provider del runtime, recibe ruta y destinatario por `location.state` y redirige a `/routes` si se accede directamente sin contexto.
- `frontend/src/pages/ProfilePage.tsx` — pantalla de perfil con las tres secciones (contactos, umbrales, voluntariado).

Ficheros modificados:

- `frontend/src/App.tsx` — añadidas rutas `/trip` y `/profile` como rutas protegidas.
- `frontend/src/components/TopBar.tsx` — añadido enlace "Perfil" con `NavLink` y estilo activo.
- `frontend/src/pages/RouteRequestPage.tsx` — botón verde "Iniciar trayecto" visible cuando hay ruta activa y sesión iniciada; apertura del `DestinationPicker` y navegación a `/trip` con la ruta y el destinatario como `location.state`.
- `frontend/src/index.css` — añadido keyframe `senda-pulse` para el efecto de pulso del marcador de usuario en `TripMap`, sin tocar la configuración previa de Tailwind, Leaflet y focus-visible.
- `frontend/src/i18n/locales/es.json` y `en.json` — todas las cadenas nuevas para la pantalla `/trip` (panel, estados, mapa, acompañante, prealerta, alerta, panel de Seguridad, terminales), la pantalla `/profile` (contactos, umbrales, voluntariado) y el selector `DestinationPicker`.

**Evaluación:**

- **Correctas:**
  - Máquina de estados del trayecto modelada con `useReducer` puro; transiciones deterministas y fáciles de razonar.
  - Dos relojes independientes en el Provider: tick de animación (cada tickRateMs) y clock de pared (cada 250 ms) que solo se activa durante `prealert`. Pausar la animación no congela la cuenta atrás.
  - Escalado prealerta → alerta por timeout vía comprobación `now >= prealertDeadline` en el handler de TICK: un único punto de escalado, sin `setTimeout` dedicado que limpiar si se confirma antes.
  - Ambos caminos de prealerta (parada y desvío) invocan `monitoring.detectAnomaly`; el servicio se ejerce en flujo real, no es decorativo.
  - Modal de prealerta con accesibilidad adecuada: `role="alertdialog"`, backdrop con `body.style.overflow='hidden'`, cuenta atrás en `aria-live="assertive" aria-atomic="true"`, botones de 56 px, `navigator.vibrate` best-effort.
  - Marcador pulsante como `L.divIcon` con SVG inline + keyframe CSS, sin dependencias ni binarios adicionales.
  - Internacionalización completa ES/EN de toda la nueva UI.
  - Cumplimiento estricto de las tres instrucciones previas (ningún `: JSX.Element`, todos los callbacks tipados, layouts con altura explícita en breakpoints pequeños).
  - Filtrado del usuario actual de la lista de voluntariado para evitar autoacompañamiento.
  - Sincronización reactiva entre componentes del mismo tab mediante `CustomEvent 'senda:storage'` (el evento nativo `storage` solo dispara cross-tab).
  - Umbrales en vivo: cambiar los sliders en `/profile` desde otra pestaña se refleja en el runtime del trayecto activo.

- **Parciales:**
  - La "transmisión" al destinatario es local: `CompanionView` lee el mismo contexto que la pantalla principal, no hay WebSocket ni canal de red real. Cumple RF-23 y RF-24 a efectos de demo, pero en una implementación real habría que sustituir el Provider por uno que suscriba a un canal del backend.
  - La prealerta por parada solo se dispara si la persona usuaria pulsa "Simular parada": con la animación activa el marcador siempre avanza, así que el trigger temporal nunca se cumpliría sin la pausa explícita.
  - La función `detectAnomaly` con flujo real de GPS (posición recibida con drift natural) no se ejercita; en el prototipo la detección de desvío la dispara el botón. La función queda como contrato para sustituir la simulación en el futuro.
  - El estado del trayecto no se persiste: un refresco en `/trip` redirige a `/routes`. Aceptable para prototipo.

- **Fallidas:**
  - **Respuesta inicial incompleta.** La primera generación de la iteración 3 omitió siete ficheros fundacionales (`types/trip.ts`, `services/storage.ts`, `services/monitoring.ts`, `services/trip.ts`, `services/alert.ts`, `hooks/useTripRuntime.tsx`, `components/DestinationPicker.tsx`). Claude empezó la respuesta por `TripMap.tsx` asumiendo que los demás ya estaban resueltos, y si se hubiera integrado tal cual habrían caído decenas de errores TS2307 en cascada al compilar.
  - **Artefacto en una línea del `TileLayer` de `TripMap.tsx`.** En la primera generación, la propiedad `url` incluía un `.replace(' ', '')` espurio, probablemente fruto de un error de streaming en la respuesta. La propia IA lo señaló al final pidiendo pegar la línea corregida, pero el caso muestra que no siempre es seguro pegar la respuesta tal cual.

- **Correcciones aplicadas:**
  - **Respuesta incompleta:** se pidió explícitamente a Claude (en el mismo chat del proyecto) la regeneración completa de la iteración, marcando los siete ficheros omitidos y las firmas públicas que los componentes ya enviados esperaban consumir. La segunda respuesta fue coherente y completa.
  - **Línea del `TileLayer`:** no llegó a integrarse; la versión regenerada ya trae la URL correcta `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` sin artefactos.
  - **Fusión de `index.css`:** se mantuvieron los bloques originales (`.leaflet-container`, `:focus-visible`, `html/body/#root { height: 100% }`, `font-family`) y se añadió únicamente la sección nueva (`@keyframes senda-pulse`) más el `min-height: 320px` del contenedor de Leaflet que Claude sugería como red de seguridad.

**Incidencias adicionales de integración (no atribuibles a la IA):**

- Error puntual de uso durante la prueba de la Fase 2 de la checklist: el botón "Iniciar trayecto" solo aparece cuando `canStart = activeRoute !== null && user !== null`. En una de las pruebas parecía que el botón no aparecía pese a haber calculado las rutas, por confusión entre "calcular rutas" y "elegir una ruta concreta" (pulsar "Elegir esta ruta" en la tarjeta correspondiente). Una vez seleccionada la ruta activa, el botón se mostró.
- Aviso sobre el ciclo de trabajo: `npm run preview` sirve siempre el último build en `dist/`; si se ejecuta después de `npm run dev` sin volver a lanzar `npm run build` entre medias, parece que no hay cambios. El flujo correcto durante el desarrollo es usar `npm run dev` (puerto 5173 con hot reload) y reservar `npm run build && npm run preview` únicamente para la verificación final de la PWA.

**Decisiones de diseño:**

- **Paso de `route` y `recipient` por `location.state`** al navegar de `/routes` a `/trip`. Evita elevar el Provider del trayecto al nivel de App y mantiene el runtime local a la pantalla. Si alguien recarga la pestaña o navega directo a `/trip`, se redirige a `/routes` (guardarraíl en `TripPage`).
- **Aceleración de demo** (`DEFAULT_DEMO_ACCELERATION = 10`). El ritmo realista de 5 km/h haría que un trayecto intracampus durase varios minutos. La aceleración hace que el trayecto simulado dure ~30-60 segundos, lo suficiente para presentar los cuatro flujos (en curso, prealerta por parada, prealerta por desvío, escalado a alerta) en una demo breve.
- **Detección de desvío por punto inyectado**, no por lectura pasiva. `simulateDeviation` calcula un punto perpendicular fuera de la ruta (`~2 × deviationThreshold + 20 m`) y lo fija como posición actual, forzando que `distanceToRoute > umbral` en la lógica real de `monitoring.detectAnomaly`.
- **Sin librerías externas de modales, animación ni haptics**. El modal es un `div role="alertdialog"` con backdrop; el pulso del marcador es CSS puro; la vibración usa `navigator.vibrate` best-effort (silencioso donde no se soporta).
- **Voluntariado por-usuario** (`senda.volunteer.${userId}`) para reflejar que el alta es individual, pero el registro global de voluntariado es compartido (`senda.volunteers`). Coherente con un backend futuro.
- **Layout responsivo estricto:** todos los contenedores de mapa tienen altura explícita en móvil/tablet (`h-[55vh] min-h-[360px]` en `/trip`, `h-[60vh] min-h-[400px]` en `/routes`) y solo pasan a `flex-1` en breakpoints desktop donde el padre garantiza altura. Aprendido de la corrección aplicada en la iteración 2.

**Pendiente para la próxima iteración:**

- Reverse-geocoding en `/routes` al colocar marcadores por click, para rellenar los inputs de texto con la dirección textual.
- Reporte de incidencias del entorno durante el trayecto activo (RF-37 a RF-40, CU-12): categorías "Farola fundida", "Zona solitaria", "Obstáculo en la vía", "Punto con dificultad"; generación de ticket persistente.
- Panel del personal administrador (RF-41 a RF-47, CU-14, CU-16, CU-17, CU-18, CU-19): pantalla protegida por rol `admin` con listado de tickets y alertas, acciones de derivación y cierre. Introducción del primer selector de rol mock, distinto al de persona usuaria.
- Paneles filtrados por rol para el Servicio de Seguridad y el Servicio de Mantenimiento (RF-44, RF-45).
- Indicador de antigüedad de los datos en las rutas propuestas y en el trayecto activo (RF-16, CU-05), relevante cuando haya integración real con LumenSmart.
- Estadísticas agregadas anonimizadas (RF-51, RF-52, CU-20): pantalla `/stats` de lectura.
- Retención de historial (RNF-18) y limpieza automática de rutas tras 24 h.
- Tests unitarios de `monitoring.detectAnomaly`, `trip.buildTripTrack` y del reducer interno de `useTripRuntime` (Vitest).

---

### Iteración 4: Reporte de incidencias, roles y panel de administración

**Fecha:** 22/04/2026

**Objetivo:** Cerrar el recorrido funcional del prototipo añadiendo los tres bloques pendientes: (a) sistema de roles (persona usuaria, personal administrador, Servicio de Seguridad, Servicio de Mantenimiento) con selector mock en el login y navegación específica por rol; (b) flujo de reporte de incidencias accesible tanto durante un trayecto activo (botón flotante en `/trip`) como fuera de él (pantalla dedicada `/incidents/new`) con persistencia de tickets; (c) paneles de gestión: `/admin` con dos pestañas (tickets y alertas) y operativa CRUD sobre el estado, y `/security` y `/maintenance` con visibilidad filtrada por tipo de asignación. Como tarea pendiente desde la iteración 2, se añade también reverse-geocoding automático en `/routes` al colocar marcadores por click.

**Requisitos cubiertos:**

- RF-37 Reporte de incidencias por parte de las personas usuarias.
- RF-38 Almacenamiento y trazabilidad de incidencias reportadas.
- RF-41 Acceso del personal administrador a tickets y alertas.
- RF-42 Derivación de tickets a Seguridad o Mantenimiento por parte del personal administrador.
- RF-43 Cierre de tickets con nota de resolución.
- RF-44 Visibilidad de alertas y tickets derivados en el Servicio de Seguridad.
- RF-45 Visibilidad de tickets derivados en el Servicio de Mantenimiento.
- RF-46 Resolución de tickets por el Servicio de Seguridad.
- RF-47 Resolución de tickets por el Servicio de Mantenimiento.
- RNF-30 Control de acceso basado en roles (RBAC) para las pantallas de gestión.

Casos de uso del ERS afectados: CU-12 (Reportar incidencia), CU-14 (Consultar tickets y alertas desde administración), CU-16 (Derivar ticket), CU-17 (Cerrar ticket), CU-18 (Resolver alerta), CU-19 (Gestionar incidencias desde servicios específicos).

**Prompt empleado:**

```
# Iteración 4 — Reporte de incidencias, panel de administración y cierre funcional

[... resto del prompt literal tal y como se envió a Claude; recuperar
del historial de claude.ai y pegar completo ...]
```

**Prompts correctivos posteriores (mismo hilo):**

- *Aviso preventivo integrado en el propio prompt:* "al generar iteraciones grandes, asegúrate de incluir todos los ficheros fundacionales y no empezar por los componentes asumiendo que los demás están resueltos". Evitó el error de la iteración 3: Claude empezó la respuesta por `types/incidents.ts` → `services/tickets.ts` → `services/alerts.ts` → `hooks/useTripRuntime.tsx` (modificado) → componentes → páginas → i18n, en ese orden, con todas las exports coherentes entre sí.
- *Aviso 5:* instrucción sobre la inclusión indebida de códigos del ERS (RF-XX, RNF-XX, CU-XX) en cadenas i18n visibles por el usuario final. Seis cadenas afectadas detectadas y corregidas manualmente. Se indica a Claude que la trazabilidad entre ERS y prototipo debe mantenerse exclusivamente en `seguimiento_ia.md` y en comentarios de código, nunca en la UI.

**Contexto proporcionado:**

- ERS v8.0 del proyecto.
- Diagramas UML (casos de uso, clases y estados en formato SVG).
- Estado del repositorio tras la iteración 3 (modo «Voy contigo» operativo, pantalla `/profile`, persistencia bajo `senda.*`).
- Decisiones de alcance acordadas con el equipo antes del prompt:
  - Introducción del primer selector de rol mock en la pantalla de login, como botones adicionales junto al SSO simulado existente.
  - Panel del personal administrador con listado completo de tickets y alertas, más acciones CRUD sobre el estado (sin filtros sofisticados en esta iteración).
  - Reporte de incidencias accesible desde dos puntos: FAB flotante en `/trip` y pantalla independiente `/incidents/new` para reportes fuera de un trayecto activo.

**Artefactos generados:**

Ficheros nuevos:

- `frontend/src/types/incidents.ts` — tipos de dominio (`Role`, `IncidentCategory`, `TicketStatus`, `ServiceAssignee`, `Ticket`, `AlertStatus`, `AlertReason`, `AlertRecord`), constantes (`INCIDENT_CATEGORIES`, `ALL_ROLES`) y helper `rolePath(role)` que centraliza la ruta de aterrizaje post-login por rol.
- `frontend/src/services/tickets.ts` — CRUD completo de tickets bajo `senda.tickets` (`loadTickets`, `saveTickets`, `appendTicket`, `updateTicket`, `assignTicket`, `closeTicket`) y hook reactivo `useTickets` con sincronización intra-tab vía `CustomEvent 'senda:storage'` y cross-tab vía `StorageEvent` nativo.
- `frontend/src/services/alerts.ts` — análogo para `senda.alerts` con `loadAlerts`, `saveAlerts`, `appendAlert` (consumido desde `useTripRuntime` al escalar), `updateAlert`, `resolveAlert` y hook `useAlerts`.
- `frontend/src/components/RoleGuard.tsx` — envoltura de rutas que acepta `allowedRoles: Role[]` y redirige a `rolePath(user.role)` cuando el rol no está permitido. Componible con `ProtectedRoute` (autenticación primero, autorización después).
- `frontend/src/components/RoleBadge.tsx` — badge de rol con dos variantes (`default` con color por rol y `inverted` para el fondo rojo de la TopBar).
- `frontend/src/components/RoleLoginPanel.tsx` — sección con los cuatro botones de login mock por rol, incluye estado de carga por botón (`pendingRole`) y badge visual.
- `frontend/src/components/IncidentCategoryPicker.tsx` — selector de categoría con cuatro tarjetas clicables (lighting / feeling / obstacle / accessibility), cada una con icono SVG inline y color distintivo.
- `frontend/src/components/IncidentReportModal.tsx` — modal accesible (`role="dialog"`, `aria-modal`, focus inicial en el botón de cerrar, cierre con `Escape`) reutilizable con `fixedLocation` + `locationLabel` opcionales. Contador de caracteres (máximo 280), validación de cobertura y llamada al hook `useTickets().create`.
- `frontend/src/components/TicketsTable.tsx` — listado como `<ul>/<li>` (no `<table>`) con badges de categoría y estado, acciones por fila (Derivar a Seguridad, Derivar a Mantenimiento, Cerrar), formato de fecha localizado por `Intl.DateTimeFormat` y panel inline de nota de resolución al cerrar.
- `frontend/src/components/AlertsTable.tsx` — análogo para alertas con los cinco campos del RF-32 y acción "Marcar como atendida".
- `frontend/src/pages/AdminPage.tsx` — pantalla con dos pestañas (`Tickets` y `Alertas`) accesibles (`role="tablist"`, `aria-selected`, `aria-controls`), recuentos dinámicos entre paréntesis en los rótulos de las pestañas.
- `frontend/src/pages/SecurityPage.tsx` — dos secciones: "Alertas activas" (filtrado por `status === 'active'`) y "Tickets asignados" (filtrado por `status === 'assigned_security'`).
- `frontend/src/pages/MaintenancePage.tsx` — solo sección "Tickets asignados" (`status === 'assigned_maintenance'`), coherente con el ERS que solo obliga a Seguridad a recibir alertas.
- `frontend/src/pages/IncidentReportPage.tsx` — pantalla `/incidents/new` con mini-mapa Leaflet, círculos de cobertura, selección por click validada o por geolocalización, botón "Continuar" que abre el `IncidentReportModal` y redirige a `/` al 1,5 s del éxito.

Ficheros modificados:

- `frontend/src/auth/types.ts` — extendido `User` con la propiedad `role: Role`; nuevo tipo `AuthContextValue` que expone `login()` (retrocompatible) y `loginAs(role)`.
- `frontend/src/auth/AuthContext.tsx` — diccionario `MOCK_USERS` con cuatro usuarios mock por rol (`ana.garcia`, `admin`, `seguridad`, `mantenimiento`); `readStoredUser` con retrocompatibilidad para sesiones previas sin rol (default a `'user'`).
- `frontend/src/components/AddressSearchInput.tsx` — nuevo prop `externalLabel?: string | null` para recibir la dirección textual desde el hook y mostrarla en el input; `useRef` interno para detectar cambios de `externalLabel` sin pisar texto que la persona usuaria esté tecleando.
- `frontend/src/components/TopBar.tsx` — diccionario `NAV_BY_ROLE` con los enlaces visibles por rol; doble navegación (horizontal en desktop, barra inferior deslizable en móvil); `RoleBadge` inline en la esquina derecha junto al nombre de usuario.
- `frontend/src/hooks/useRoutePlanner.tsx` — nuevos campos de estado `originLabel` / `destinationLabel`; `setEndpoint(kind, point, label?)` acepta un label opcional; si no se provee, dispara `reverseGeocode` con `AbortController` por endpoint para cancelar races entre clicks rápidos.
- `frontend/src/services/geocoding.ts` — añadida función `reverseGeocode(point, options)` con el mismo patrón de `searchAddress` (`email` y `Accept-Language`, control de errores HTTP y `display_name`).
- `frontend/src/hooks/useTripRuntime.tsx` — `useEffect` de persistencia de alertas que al entrar en estado `'alert'` invoca `appendAlert` con los datos necesarios (usuario, destinatario, motivo, ubicación, ruta); un `useRef` de firma evita duplicados si el componente se re-renderiza.
- `frontend/src/pages/LoginPage.tsx` — añadido `RoleLoginPanel` debajo del botón principal; método `redirectAfterLogin(role)` que respeta `location.state.from` si viene de un `ProtectedRoute` y cae a `rolePath(role)` por defecto.
- `frontend/src/pages/RouteRequestPage.tsx` — conexión del label reverse-geocodeado (`originLabel`, `destinationLabel`) a los `AddressSearchInput`; la selección por buscador pasa explícitamente el `displayName` como label para evitar el round-trip a Nominatim.
- `frontend/src/pages/TripPage.tsx` — FAB rojo circular en la esquina inferior derecha del mapa (solo visible en estado no terminal) que abre el `IncidentReportModal` con la posición actual del trayecto como ubicación fija.
- `frontend/src/App.tsx` — nueva pieza `RoleHome` para `/` (renderiza `HomePage` solo para rol `user`, redirige al resto); `RoleGuard` aplicado a los cuatro grupos de rutas (`user`, `admin`, `security`, `maintenance`); rutas `/admin`, `/security`, `/maintenance`, `/incidents/new` añadidas.
- `frontend/src/i18n/locales/es.json` y `en.json` — todas las cadenas nuevas de navegación (`nav.admin`, `nav.securityService`, `nav.maintenanceService`, `nav.reportIncident`), roles, panel de login por rol, modal y categorías de incidencia, tablas de tickets y alertas, páginas `/admin`, `/security`, `/maintenance` y el flujo `/incidents/new`.

**Evaluación:**

- **Correctas:**
  - `RoleGuard` separado de `ProtectedRoute`: la autenticación y la autorización se componen sin acoplarse.
  - Redirección post-login por rol (`rolePath`) centralizada en un helper, única fuente de verdad.
  - Persistencia idempotente de alertas desde `useTripRuntime`: un `useRef` con la firma `triggeredAt` evita duplicados si el componente se re-renderiza.
  - Reverse-geocoding con `AbortController` por endpoint: clicks rápidos no compiten entre sí, y el label que acaba pegado en el input siempre corresponde al último punto fijado.
  - `IncidentReportModal` reutilizable con `fixedLocation` + `locationLabel`, cerrando la casuística de ambos puntos de acceso sin duplicar el formulario.
  - Iconos de categoría y pin de incidencia como SVG inline (cero binarios adicionales).
  - Navegación por rol en TopBar con diccionario `NAV_BY_ROLE` extensible.
  - Tablas como `<ul>/<li>` en vez de `<table>`: mejor adaptación a móvil, soporte directo de acciones anidadas y panel inline de nota de resolución sin peleas de ancho.
  - Accesibilidad del panel de admin: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
  - Internacionalización completa ES/EN de todas las cadenas nuevas.
  - Cumplimiento estricto de las cuatro instrucciones acumuladas en iteraciones anteriores (ningún `: JSX.Element`, callbacks tipados, layouts con altura explícita, todos los ficheros fundacionales en la respuesta inicial).

- **Parciales:**
  - **Referencias al ERS (`RF-XX`, `CU-XX`) visibles en la UI.** Varias descripciones de pantallas generadas por Claude incluían entre paréntesis los códigos del ERS (por ejemplo "Gestión de incidencias reportadas y alertas escaladas (RF-38, RF-41 a RF-43)."). Esto es útil como trazabilidad en la documentación académica pero inadecuado en la interfaz que vería un tribunal o un usuario final. Se corrigió manualmente eliminando los paréntesis de todas las cadenas en ambos ficheros i18n (`es.json` y `en.json`): `admin.description`, `profile.thresholds.description`, `trip.security.description`, `security.description`, `maintenance.description` e `incident.modal.subtitle`.
  - **RF-40 (agrupación automática de incidencias cercanas)** no implementado. Requiere cálculo espacial adicional y ventana temporal, y el beneficio sin datos reales es limitado. Queda documentado como pendiente.
  - **RF-39 (ajuste automático de ISP por incidencia reportada)** no implementado. El ISP de la iteración 2 es aleatorio, por lo que la penalización no aportaría valor didáctico. Queda pendiente para cuando el cálculo de ISP sea real.
  - **Tickets visibles solo como listado.** No hay mapa de calor de incidencias, ni filtros por categoría o ubicación. El enfoque actual es suficiente para el alcance del ERS pero mejorable en una iteración futura.

- **Fallidas:** ninguna que bloquease la integración. El `npm run build` compiló a la primera sin errores de TypeScript, incluyendo los 15 ficheros nuevos y los 12 modificados. Se produjeron únicamente dos tropiezos menores detectados pero no bloqueantes:
  - Discrepancia de tipos `triggeredAt: string` (en `AlertPayload`, tipo interno del runtime del trayecto) vs `triggeredAt: number` (en `AlertRecord`, tipo persistido del dominio de incidencias). No se propaga porque `appendAlert` calcula su propio `triggeredAt = Date.now()` dentro del servicio, pero queda documentado.
  - Warning de tamaño de chunk en el build: `553 kB` (por encima del umbral por defecto de 500 kB de Vite). Es un warning informativo, no un error; se resolvería con code-splitting vía `React.lazy` cuando el número de pantallas lo justifique.

- **Correcciones aplicadas:**
  - **Limpieza de referencias al ERS en la UI:** se eliminaron los sufijos "(RF-XX)" y "(RF-XX a RF-YY)" de seis cadenas en `es.json` y las seis equivalentes en `en.json`. La trazabilidad ERS↔prototipo permanece en este documento `seguimiento_ia.md`, que es el lugar correcto para mantenerla.

**Incidencias adicionales de integración (no atribuibles a la IA):**

- El botón "Iniciar trayecto" no se mostraba al probar inicialmente la iteración 4. Diagnóstico: `canStart = activeRoute !== null && user !== null`; en una de las pruebas, tras calcular las rutas, no se había pulsado "Elegir esta ruta" en ninguna de las tres tarjetas, por lo que `activeRoute` seguía `null`. Una vez seleccionada explícitamente una ruta, el botón apareció. Confusión ya documentada en la iteración 3.

**Decisiones de diseño:**

- **Selector de rol en el propio login mock.** Alternativa descartada: selector de rol en una pantalla separada tras autenticarse. La integración directa en `/login` deja más claro al tribunal que el prototipo reconoce cuatro perfiles distintos y facilita la demo (un clic y ya estás en el panel correcto).
- **Redirección diferenciada por rol en `/`.** Alternativa descartada: que los roles no-usuaria también vieran `HomePage`. Se prefiere `RoleHome` como componente que delega en `HomePage` solo para `user` y redirige al resto a su pantalla principal. Evita una home genérica con acciones que un rol no puede ejecutar.
- **Persistencia de alertas desde el propio `useTripRuntime`.** Alternativa descartada: un servicio separado que observara el estado desde fuera. La integración directa en el hook mantiene la lógica de negocio del trayecto encapsulada y aprovecha los campos ya disponibles (`alertPayload`, `triggeredAt`) sin añadir indirección.
- **Paneles como listas (`<ul>`) en lugar de tablas (`<table>`).** Alternativa descartada: tablas HTML nativas. Las listas se adaptan mejor al ancho móvil, soportan filas con múltiples niveles de contenido (badges, descripción, metadatos, acciones) sin tener que pelear el ancho de columna, y facilitan el patrón de panel inline para la nota de resolución al cerrar un ticket.
- **Icono del pin de incidencia y de las categorías como SVG inline.** Alternativa descartada: archivos SVG externos o bibliotecas de iconos. Evita dependencias, mantiene el bundle más pequeño y permite colorear según estado directamente desde el componente.
- **Sincronización cross-tab vía `StorageEvent` nativo + intra-tab vía `CustomEvent 'senda:storage'`.** Alternativa descartada: confiar solo en `StorageEvent`, que no se dispara dentro de la misma pestaña que origina el cambio. La combinación de ambos canales garantiza que, en cualquier escenario, los componentes que consumen `senda.tickets` / `senda.alerts` se refresquen al instante.

**Pendiente para una hipotética iteración 5:**

- **Tests unitarios con Vitest.** `services/monitoring.ts` (detección de paradas y desvíos), `services/trip.ts` (`buildTripTrack` y distancia a ruta), `services/tickets.ts` y `services/alerts.ts` (append, assign, close, resolve), reducer de `useTripRuntime` (transiciones y persistencia idempotente de alertas), y tests de componentes para `RoleGuard`, `IncidentCategoryPicker` y `TicketsTable` con React Testing Library.
- **Pantalla `/stats`** (RF-51, RF-52, CU-20) con agregados locales: número de tickets por categoría, incidencias por campus, alertas por mes, con gráficos mínimos (SVG directo, sin dependencias).
- **Retención automática de datos** según RNF-18 (historial de rutas solo 24 h). Implementable como purga al montar la app.
- **RF-40 (agrupación automática de tickets)** por proximidad (< 30 m) + ventana temporal (últimas 24 h) + misma categoría, con contador en el ticket maestro.
- **RF-39 (ajuste automático de ISP)** una vez el cálculo deje de ser aleatorio: reducir ISP de la zona al crear ticket, aumentar al cerrarlo.
- **Vista detalle de ticket** con mapa embebido, histórico de cambios de estado y botones de "marcar en curso" (RF-46, RF-47).
- **Iconos PWA para iOS** (rutas `apple-touch-icon`), pendiente desde la iteración 1.
- **Sustitución de los servicios locales por clientes HTTP** cuando exista backend real, manteniendo los hooks `useTickets` / `useAlerts` como fachada.

---

### Iteración 5: Estadísticas, retención de datos y tests unitarios

**Fecha:** 22/04/2026

**Objetivo:** Cierre técnico del prototipo evolutivo con tres bloques independientes y acotados: (a) pantalla `/stats` solo para rol `admin` con KPIs y cuatro gráficos SVG inline (barras, donut, lista proporcional y heatmap de 7 días), (b) retención automática de datos bajo RNF-18 mediante purga de tickets y alertas más antiguos de 24 h, (c) suite de tests unitarios con Vitest sobre los siete servicios puros más críticos (`coverage`, `routing`, `monitoring`, `trip`, `tickets`, `alerts`, `retention`).

**Requisitos cubiertos:**

- RF-51 Visualización de estadísticas agregadas por categoría, estado y actividad temporal.
- RF-52 Panel estadístico accesible para el personal administrador.
- RNF-18 Retención máxima del historial local durante 24 horas.
- RNF-29 Presentación de estadísticas sin exposición de identidad individual (todos los agregados muestran recuentos totales, nunca campos identificadores).
- RNF-30 Acceso restringido por rol al panel estadístico (solo `admin`).

Casos de uso del ERS afectados: CU-20 (Consultar estadísticas agregadas), parcialmente; la visualización queda implementada, los filtros por rango temporal y zona quedan fuera del alcance del prototipo.

**Prompt empleado:**

```
# Iteración 5 — Estadísticas, retención de datos y tests unitarios

[... resto del prompt literal tal y como se envió a Claude; recuperar
del historial de claude.ai y pegar completo ...]
```

**Prompts correctivos posteriores (mismo hilo):** ninguno. Las cinco instrucciones previas (avisos 1 a 5) se integraron como restricciones explícitas en el propio prompt y Claude las respetó sin desviaciones. La respuesta llegó ordenada (servicios → tests → componentes → página → rutas/TopBar/Profile → i18n), completa y coherente entre sí; no hubo que regenerar nada.

**Contexto proporcionado:**

- ERS v8.0 del proyecto.
- Diagramas UML (casos de uso, clases y estados en formato SVG).
- Estado del repositorio tras la iteración 4 (prototipo funcionalmente cerrado con cuatro roles, reporte de incidencias, paneles admin/security/maintenance, reverse-geocoding en `/routes`, i18n ES/EN, PWA).
- Decisiones de alcance acordadas con el equipo antes del prompt: (1) `/stats` solo admin, (2) retención de 24 h implementada como purga al montar la app y cada hora, (3) tests únicamente sobre servicios puros (no componentes). RF-39 y RF-40 se dejan fuera conscientemente por las razones documentadas en la iteración 4.

**Artefactos generados:**

Ficheros nuevos:

- `frontend/src/services/retention.ts` — función `purgeExpiredData(maxAgeMs)` que filtra en `localStorage` las claves `senda.tickets` (por `createdAt`) y `senda.alerts` (por `triggeredAt`) y reescribe el array resultante; emite `CustomEvent 'senda:storage'` solo cuando realmente hay cambios, de modo que los hooks `useTickets` / `useAlerts` se refrescan automáticamente. Constante exportada `RETENTION_MAX_AGE_MS = 24 * 60 * 60 * 1000` y hook `useDataRetention()` que ejecuta la purga al montar y cada hora mientras viva la app.
- `frontend/src/services/coverage.test.ts` — 8 tests: `haversineDistance` devuelve 0 para el mismo punto, ≈ 500 m entre dos puntos conocidos a esa distancia, simetría; `isWithinCoverage` acepta Móstoles, rechaza Puerta del Sol, respeta el límite en 499 m vs 501 m, constante `COVERAGE_RADIUS_METERS = 500`.
- `frontend/src/services/routing.test.ts` — 11 tests: `calculateRoutes` devuelve exactamente 3 rutas, con ≥2 waypoints cada una, labels distintos (`principal`/`alternative1`/`alternative2`), ordenadas por ISP descendente; `classifySafety` con los seis bordes (70, 69, 40, 39) y tres muestras (80, 50, 20).
- `frontend/src/services/monitoring.test.ts` — 5 tests: `detectAnomaly` devuelve `null` cuando todo está bien, `'pause'` al alcanzar y superar el umbral, `'deviation'` al salirse de la ruta ~200 m, y prioriza `deviation` sobre `pause` cuando ambas se cumplen (comportamiento ya implícito en iter 3, ahora fijado por test).
- `frontend/src/services/trip.test.ts` — 4 tests: `buildTripTrack` devuelve samples con `atSec` no decreciente desde 0, la duración total coincide con `distancia / velocidad` ± 2 s de tolerancia por el redondeo interno, cada sample tiene coordenadas numéricas finitas, primer sample en el origen y último cerca del destino.
- `frontend/src/services/tickets.test.ts` — 6 tests con `vi.stubGlobal('localStorage', ...)`: carga vacía, `appendTicket` persiste con `status: 'open'` y `createdAt` reciente, `assignTicket` pasa a `assigned_security` / `assigned_maintenance`, `closeTicket` graba `status: 'closed'`, `resolutionNote` y `resolvedAt`, orden descendente por `createdAt` verificado con `vi.useFakeTimers`.
- `frontend/src/services/alerts.test.ts` — 4 tests análogos: `loadAlerts` vacío, `appendAlert` con `status: 'active'` y `triggeredAt` reciente, `resolveAlert` con `status: 'resolved'` + `resolvedAt`, orden descendente por `triggeredAt`.
- `frontend/src/services/retention.test.ts` — 6 tests: no hace nada si no hay datos, respeta elementos recientes, elimina tickets/alertas anteriores a `now - maxAge`, emite `senda:storage` cuando purga y **no** lo emite cuando no hay cambios (caso importante para no provocar repintados innecesarios).
- `frontend/vitest.config.ts` — configuración mínima (`environment: 'jsdom'`, `globals: true`, `include: ['src/**/*.test.ts']`, `unstubGlobals: true`, `clearMocks: true`).
- `frontend/src/pages/StatsPage.tsx` — cabecera con título y subtítulo, cuatro `KpiCard` arriba en rejilla responsive (1 columna móvil → 4 desktop), gráfico de barras horizontales por categoría, donut por estado, lista ordenada de alertas por motivo con barras proporcionales inline, heatmap lineal de 7 días. Todas las agregaciones se calculan con `useMemo` a partir de `useTickets()` y `useAlerts()`; los gráficos son *stateless*.
- `frontend/src/components/KpiCard.tsx` — tarjeta KPI con variantes `default` y `urgent` (borde + número rojos) y `hint` opcional.
- `frontend/src/components/CategoryBarChart.tsx` — SVG con `role="img"` y `aria-label`; cuatro barras horizontales coloreadas con los mismos tonos del `IncidentCategoryPicker` de la iteración 4 (amarillo, morado, naranja, azul). Barras con `opacity: 0.25` cuando el recuento es cero.
- `frontend/src/components/StatusDonut.tsx` — donut SVG generado a mano con `M … L … A …` (sin librerías), leyenda lateral con cuenta y porcentaje, total centrado en el hueco. Caso especial de "una sola categoría = 100 %" resuelto con `<circle>` completo.
- `frontend/src/components/ActivityHeatmap.tsx` — heatmap lineal de siete celdas; color interpolado entre blanco-rosáceo y rojo corporativo `#C00000` según intensidad; fecha formateada con `Intl.DateTimeFormat` y locale activo.

Ficheros modificados:

- `frontend/src/App.tsx` — `useDataRetention()` invocado una sola vez al montar; ruta nueva `/stats` dentro del grupo `RoleGuard allowedRoles={['admin']}`.
- `frontend/src/components/TopBar.tsx` — añadido enlace `"Estadísticas"` a `NAV_BY_ROLE.admin`.
- `frontend/src/pages/ProfilePage.tsx` — línea informativa discreta al pie: "Los historiales de incidencias y alertas se conservan durante un máximo de 24 horas." (EN equivalente).
- `frontend/src/i18n/locales/es.json` y `en.json` — todas las cadenas nuevas de `/stats` (título, subtítulo, KPIs, títulos y hints de cada gráfico, resúmenes `aria-label`) y la nota de retención en `/profile`.
- `frontend/package.json` — nuevos scripts `"test": "vitest run"` y `"test:watch": "vitest"`; nuevas `devDependencies`: `vitest@^3`, `jsdom@^25`, `@types/node@^20`. Instalación con `--legacy-peer-deps` por consistencia con `vite-plugin-pwa`.

**Evaluación:**

- **Correctas:**
  - Tests 100 % verdes al primer intento: 7 suites, 44 tests, ~3,4 s de ejecución total. `npm run test` ejecuta limpiamente sin configuración adicional.
  - Gráficos SVG inline sin ninguna dependencia de gráficos (ni `recharts`, ni `d3`, ni `chart.js`, ni `plotly`). El bundle sube muy poco respecto a iter 4.
  - Accesibilidad de los gráficos: cada `<svg>` tiene `role="img"` y `aria-label` con el resumen textual equivalente ("Tickets por categoría. Farola fundida: 2, Zona solitaria: 1, …"), interpretable por lectores de pantalla.
  - `purgeExpiredData` idempotente: ejecutarlo varias veces sin cambios en `localStorage` no emite evento, no provoca repintados ni rehidrata los hooks.
  - `useDataRetention()` invocado desde `App.tsx`, no desde `AuthProvider`, para que la purga corra siempre que la app esté viva, con sesión o sin ella.
  - Tests con `vi.stubGlobal('localStorage', ...)` totalmente independientes del navegador; `vi.useFakeTimers` únicamente donde hace falta (tests de orden), sin acoplar el resto a un reloj simulado.
  - `unstubGlobals: true` en `vitest.config.ts` como red de seguridad adicional a los `afterEach(() => vi.unstubAllGlobals())` de cada suite.
  - Cumplimiento estricto de las cinco instrucciones correctivas acumuladas: ningún `: JSX.Element`, callbacks tipados, layouts con altura explícita en breakpoints pequeños, todos los ficheros fundacionales incluidos desde el inicio, ninguna referencia a códigos RF/CU en la UI.

- **Parciales:**
  - **Agregados solo del cliente.** `/stats` lee `localStorage` del navegador actual; un despliegue real centralizaría los datos en un backend. En el prototipo no se puede mostrar "zonas con más avisos" o "horas con mayor incidencia" con granularidad estadística significativa al no haber datos multiusuario.
  - **Sin anonimización estructural (RNF-29).** El ERS exige que las estadísticas sean anónimas. Los agregados que muestra el panel ya son totales/recuentos sin identificadores, pero conviven en el mismo almacén que los tickets individuales, que sí llevan nombre y correo de quien reportó. Un backend real guardaría los agregados ya desacoplados.
  - **Sin filtros de rango temporal ni de campus en `/stats`.** CU-20 menciona filtros avanzados; el prototipo entrega vista global y heatmap fijo de 7 días.
  - **Sin tests de componentes.** Vitest + `jsdom` permitirían ejercitar `KpiCard`, `StatusDonut`, `CategoryBarChart` y `ActivityHeatmap`, pero el alcance acordado fue solo los servicios puros.
  - **La purga solo corre mientras la app esté abierta.** Si una persona no abre la app durante varios días, la limpieza se demora hasta su siguiente visita. Un backend lo resolvería con tareas programadas.
  - **Retención excluye `senda.contacts`, `senda.volunteers`, `senda.thresholds`.** Son configuración deliberada del usuario, no historial; RNF-18 solo alcanza al historial de rutas, incidencias y alertas.

- **Fallidas:** tres tropiezos detectados durante la integración, ninguno atribuible a la calidad del código generado por Claude. Ver "Incidencias adicionales de integración".

- **Correcciones aplicadas:**
  - **Error de encoding con BOM UTF-8.** Los ficheros nuevos (especialmente `StatsPage.tsx`, `KpiCard.tsx`, `StatusDonut.tsx`) fueron guardados por VS Code con BOM al inicio. El BOM hace que TypeScript no reconozca el primer carácter del módulo y reporte "no default export" aunque la firma `export default function` sea correcta. Solución: tras descartar las hipótesis de contenido (el fichero ya tenía `export default function StatsPage()` en la línea 47), se ejecutó un script masivo de PowerShell que recorre `src/**/*.tsx` y `src/**/*.ts`, detecta el BOM (`\uFEFF`) al inicio y reescribe cada fichero en UTF-8 sin BOM usando `System.IO.File.WriteAllText` con `UTF8Encoding($false)`. Tras la ejecución, `npm run build` compiló limpio. Se recomienda dejar en `.vscode/settings.json` del repo:
    ```json
    {
      "files.encoding": "utf8",
      "files.autoGuessEncoding": false
    }
    ```
    para evitar la reincidencia.
  - **Desborde visual en `RoleLoginPanel` con textos largos en español.** La primera versión generada por Claude usaba una rejilla de 2 columnas × 2 filas con `justify-between`. Con textos cortos como "Security" y "User" en inglés (versión que Claude probablemente visualizó al diseñar) funcionaba, pero en español "Personal administrador" y "Servicio de Mantenimiento" se partían en dos líneas y desbordaban verticalmente el botón, pisando visualmente el botón de la fila inferior. Iteraciones correctivas descartadas: (1) aumentar altura mínima y alineación `items-start` — sigue desbordando; (2) usar `min-w-0 + flex-1` en el texto — alinea pero no soluciona la altura combinada. Solución definitiva: sustituir la rejilla 2×2 por **una lista vertical de una sola columna**. Los textos caben en una línea, el badge queda alineado a la derecha con `justify-between`, la accesibilidad se mantiene y la altura del panel crece de forma coherente sin superposiciones. No se considera un "aviso 6" para Claude por ser un problema local de un componente concreto, no un patrón generalizable.

**Incidencias adicionales de integración (no atribuibles a la IA):**

- **Error TS1192 "has no default export" fantasma (BOM UTF-8).** Tres intentos de diagnóstico antes de dar con la causa. Primero se sospechó del contenido (descartado al comprobar que la firma `export default function StatsPage()` era correcta); después de cache obsoleta de TypeScript (se limpiaron `node_modules/.tmp`, `dist/` y `.tsbuildinfo` sin éxito); finalmente, tras recrear el fichero desde VS Code y ver que el error se movía al siguiente fichero nuevo (`KpiCard.tsx` → `StatusDonut.tsx`), se identificó el BOM como causa. Ver "Correcciones aplicadas" para el script de limpieza.
- **Build warning: chunk > 500 kB.** El build final pesa `564 kB` (gzip: `167 kB`), por encima del umbral por defecto de Vite. Es un warning informativo, no un error. Se resolvería con code-splitting vía `React.lazy` para `/stats`, `/admin`, `/security` y `/maintenance` (que solo se cargan cuando el rol correspondiente inicia sesión). Queda como mejora futura.
- **Compatibilidad entre `AlertPayload.triggeredAt: string` (iter 3) y `AlertRecord.triggeredAt: number` (iter 4).** Se detectó durante la revisión del nuevo `useEffect` de persistencia de alertas en `useTripRuntime`. No rompe el build porque `appendAlert` calcula su propio `triggeredAt = Date.now()` internamente e ignora el campo entrante, pero queda como deuda técnica: unificar ambos tipos a `number` en una iteración futura.

**Decisiones de diseño:**

- **Gráficos SVG a mano, sin librería externa.** Cada componente exporta su propia interfaz de datos (`CategoryBarDatum`, `DonutSlice`, `HeatmapDay`) para que la página agregue una sola vez con `useMemo` y los gráficos permanezcan *stateless* y testeables. Alternativa descartada: `recharts`. Ahorra ~400 kB de bundle y queda un código didácticamente mucho más transparente, coherente con un prototipo académico.
- **`useDataRetention` en `App.tsx`, no en `AuthProvider`.** Así la purga corre desde que la app monta, con sesión o sin ella (a la larga no hace diferencia, pero es más claro que un `useEffect` en el provider de auth). `StrictMode` ejecuta el `useEffect` dos veces en dev; como `purgeExpiredData` es idempotente, no importa.
- **Evento `senda:storage` emitido solo si hay cambios.** Detalle importante: emitir siempre causaría que los hooks `useTickets` y `useAlerts` se revalidaran al montar aunque no hubiese nada que purgar, provocando un repintado innecesario de `/admin`, `/security`, `/maintenance` y `/stats`. El test `no emite cuando no se han modificado datos` fija este comportamiento.
- **Purga basada en `createdAt` / `triggeredAt`, no en alguna versión persistida.** Se eligió así por simplicidad: el dato de antigüedad ya vive en el propio ticket/alerta. Excepción del ERS ("salvo cuando la ruta tiene una incidencia asociada") no implementada en prototipo — los tickets no están enlazados a rutas concretas aquí.
- **`unstubGlobals: true` en `vitest.config.ts`.** Resetea `vi.stubGlobal` entre tests para evitar fugas del mock de `localStorage`. Redundante con los `afterEach(() => vi.unstubAllGlobals())` de cada suite, pero actúa como cinturón + tirantes.
- **Tests de `tickets` y `alerts` usan `vi.useFakeTimers` únicamente para el caso de ordenación,** donde hace falta tiempo determinístico. El resto usa `Date.now()` real; no hay beneficio en congelar el reloj cuando solo verificamos que `createdAt` está entre `before` y `after`.
- **Umbral de tolerancia ±2 s en `buildTripTrack.test.ts`.** Absorbe el `Math.ceil` interno del servicio, consistente con el comportamiento real del tick simulado (iter 3).
- **Prioridad de anomalías fijada por test: deviation > pause.** La regla ya estaba en el código desde iter 3; ahora queda expresada explícitamente en `monitoring.test.ts`. Es una decisión de diseño del dominio: si alguien se sale de la ruta *y* lleva parada, lo urgente es el desvío.
- **Sin dependencia adicional de testing libraries.** Ni React Testing Library, ni MSW, ni Jest. Los servicios cubiertos son puros o mockeables con `vi.stubGlobal`. Los componentes no se testean en esta iteración por alcance. Decisión consciente para mantener simplicidad en el prototipo.
- **Rejilla 2×2 → lista vertical en `RoleLoginPanel`.** Ver "Correcciones aplicadas" para la justificación completa.

**Pendiente (post-iteración 5):**

- **Tests de componentes con React Testing Library** para `RoleGuard`, `PrealertModal`, `IncidentReportModal` y las tablas de tickets/alertas.
- **Unificación de tipos `triggeredAt`.** `AlertPayload` (iter 3) a `number` como `AlertRecord` (iter 4).
- **Code-splitting** con `React.lazy` para bajar el bundle de 564 kB.
- **Iconos PWA para iOS** (`apple-touch-icon`), pendiente desde la iteración 1.
- **Focus trap estricto** en los modales (actualmente foco inicial + Escape).
- **Reverse-geocode con throttling global** para evitar picos en Nominatim si el uso sube.
- **Sustitución de `services/*.ts` por clientes HTTP** cuando exista backend, manteniendo los hooks `useTickets` / `useAlerts` / `useRoutePlanner` / `useTripRuntime` como fachada pública estable.
- **RF-40 (agrupación automática de tickets cercanos), RF-39 (ajuste del ISP por incidencia)** y **filtros avanzados en `/stats`** requerirían backend compartido para aportar valor real.

---

## Estado final del prototipo

**Requisitos cubiertos (total o parcialmente):**

- **Autenticación y roles:** RF-01 (mocked), RNF-14, RNF-30.
- **Solicitud y cálculo de ruta:** RF-02, RF-03, RF-04, RF-05, RF-06 (mocked), RF-13, RF-14, RF-15, RNF-11, RNF-23.
- **Modo «Voy contigo»:** RF-19, RF-20, RF-21, RF-22, RF-23, RF-24, RF-25, RF-26, RF-27, RF-28, RF-29, RF-30, RF-31, RF-32, RF-33.
- **Incidencias y gestión:** RF-37, RF-38, RF-41, RF-42, RF-43, RF-44, RF-45, RF-46, RF-47.
- **Perfil:** RF-48, RF-49, RF-50.
- **Estadísticas:** RF-51, RF-52 (agregadas localmente, alcance limitado).
- **Usabilidad, idioma, accesibilidad:** RNF-09 (controles ≥44 px), RNF-10 (ES/EN), RNF-17 parcial (PWA instalable, sin builds nativos), RNF-20 (identidad URJC), RNF-21 (stack Open Source).
- **Datos y privacidad:** RNF-18 (retención 24 h en `localStorage`), RNF-29 (agregados sin exposición individualizada en la UI).
- **Casos de uso:** CU-01, CU-02, CU-03, CU-04, CU-06, CU-07, CU-08, CU-09, CU-10, CU-11, CU-12, CU-13, CU-18, CU-19, CU-20 (parcial), CU-21, CU-22, CU-23, CU-24.

**Requisitos intencionadamente fuera del alcance del prototipo:**

- **Integración real con LumenSmart:** RF-08 a RF-12, RF-16, RF-17, RF-18, RNF-01 a RNF-07, RNF-13, RNF-25, RNF-26, RNF-27. Requiere backend y proveedor real; el ISP queda aleatorio.
- **Emparejamiento completo de voluntariado:** RF-34, RF-35, RF-36. El prototipo permite registrarse y ser elegible, pero no hay buzón compartido entre dispositivos.
- **Agrupación automática de incidencias (RF-40)** y **ajuste dinámico del ISP (RF-39)**.
- **Estándares legales, cifrado, disponibilidad 24/7, redundancia:** RNF-22, RNF-24, RNF-26, RNF-27, RNF-28. Son requisitos de operación / producción.
- **iOS nativo:** se entrega PWA instalable; empaquetado nativo queda fuera.
- **CU-05, CU-14 a CU-17** y estadísticas avanzadas con filtros.

**Métricas del prototipo al cierre de la iteración 5:**

- **Líneas de código** (aprox.): 5800 TypeScript/TSX + 1200 i18n JSON + 170 CSS.
- **Ficheros TypeScript/TSX:** ~55 (tipos, servicios, hooks, componentes, páginas).
- **Tests automatizados:** 7 suites, 44 tests, ejecución ~3,4 s.
- **Bundle de producción:** 564 kB sin gzip, 167 kB con gzip.
- **Dependencias instaladas:** 47 directas (19 runtime + 28 dev).
- **Commits en el repositorio:** cinco commits principales (uno por iteración).

**Resumen de avisos correctivos acumulados:**

1. **Aviso 1 (iter 1):** no usar `: JSX.Element` como tipo de retorno en componentes funcionales con React 19.
2. **Aviso 2 (iter 1):** generar siempre el contenido real de los ficheros placeholder o advertir explícitamente de que hay que crearlos a mano.
3. **Aviso 3 (iter 2):** altura explícita en los contenedores de mapa en breakpoints pequeños, tipado explícito de callbacks con `strict: true`, ERS es v8.0 no v7.0.
4. **Aviso 4 (iter 3):** en iteraciones grandes, incluir todos los ficheros fundacionales (tipos, servicios, hooks) antes de volcar los componentes; nunca asumir que los demás están resueltos.
5. **Aviso 5 (iter 4):** los códigos RF-XX, RNF-XX y CU-XX no deben aparecer en cadenas i18n ni en cualquier otro texto visible por el usuario final. La trazabilidad con el ERS vive solo en este `seguimiento_ia.md` y en comentarios de código.

Con esto se cierra la serie de iteraciones del prototipo evolutivo de Senda URJC.
