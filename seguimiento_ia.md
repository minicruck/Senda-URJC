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
