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
