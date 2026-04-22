# Documento de Seguimiento IA — Senda URJC

**Práctica de Análisis e Ingeniería de Requisitos, URJC 2025/26.**
Equipo: Miguel de Luis Ibáñez · Julián García Panadero · Álvaro Fernández Jiménez · Pablo Villaplana Rodríguez.
Repositorio: <https://github.com/minicruck/Senda-URJC>

## Instrucciones para la ejecución

### Requisitos previos

- **Node.js 20 o superior** (recomendado 20 LTS). Incluye `npm`.
- **Git** para clonar el repositorio.
- Navegador moderno basado en Chromium (Chrome, Edge) o Firefox. La funcionalidad de instalación como PWA requiere Chrome/Edge.

Para comprobar las versiones instaladas:

```bash
node --version
npm --version
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/minicruck/Senda-URJC.git
cd Senda-URJC/frontend
```

Todo el código del prototipo vive dentro de la carpeta `frontend/`.

### 2. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

> **Nota.** Se requiere `--legacy-peer-deps` por un conflicto conocido entre `vite-plugin-pwa` y la versión de `vitest` que instalamos en la iteración 5. Sin este flag, `npm` falla al resolver el árbol de dependencias.

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

Vite levanta el servidor en <http://localhost:5173> con _hot reload_. Es el modo recomendado durante la demo, ya que los cambios en el código se reflejan al instante.

### 4. Ejecutar los tests

```bash
npm run test
```

Ejecuta la suite completa de Vitest (7 suites, 44 tests, ~3,4 s). Para modo _watch_ (re-ejecución automática al guardar cambios) usar `npm run test:watch`.

### 5. Credenciales de acceso (mock)

El prototipo simula el SSO de la URJC. En la pantalla `/login` hay dos caminos:

- **Botón principal «Iniciar sesión con SSO»** → entra como persona usuaria (`usuaria@urjc.es`).
- **Panel «Entrar como...»** debajo, con 4 botones (Persona usuaria, Personal administrador, Servicio de Seguridad, Servicio de Mantenimiento), cada uno entra directamente con el rol correspondiente.

No se requieren contraseñas en ningún caso.

## Herramientas de IA utilizadas

**Claude (Opus 4.7 / Sonnet 4.6)** vía interfaz web `claude.ai`, como asistente principal para generación de scaffolding, código, documentación técnica y razonamiento sobre decisiones de diseño. Todas las iteraciones se realizaron sobre un mismo proyecto en `claude.ai` con el ERS, los diagramas UML y el enunciado de la práctica cargados como conocimiento persistente.

### Instrucciones iniciales del proyecto

Antes de lanzar la primera iteración se configuraron las instrucciones base del proyecto en `claude.ai`, para fijar el stack, las convenciones y la forma de responder. Estas instrucciones permanecen activas en todas las iteraciones:

```
Eres mi asistente de desarrollo para el prototipo evolutivo de Senda URJC, una PWA
(Vite + React + TypeScript + Tailwind + react-leaflet) que implementa una versión
funcional mínima de la aplicación especificada en el ERS del proyecto.

Convenciones:
- Stack: Vite, React 19, TypeScript, Tailwind v3, React Router, react-leaflet,
  react-i18next, vite-plugin-pwa.
- SSO URJC mockeado (aplicación local).
- OpenStreetMap como proveedor de tiles.
- Lenguaje del código: inglés. Lenguaje de UI: ES/EN.
- El trabajo se entrega por iteraciones. Cada iteración se registra en
  seguimiento_ia.md con el prompt literal y las decisiones tomadas.

Al responder:
- Devuelve código completo de cada fichero, no diffs parciales.
- Explica brevemente las decisiones técnicas.
- Indica qué queda pendiente para la próxima iteración.
- No inventes requisitos: consulta el ERS del conocimiento del proyecto.
```

A estas instrucciones iniciales se les añadieron progresivamente los cinco avisos correctivos que se detallan al final del documento.

### Flujo de trabajo con dos chats

El desarrollo se apoyó en **dos hilos paralelos** con Claude (Opus 4.7 / Sonnet 4.6), cada uno con un rol diferenciado:

| Chat          | Tipo                                                                      | Función                                                              |
| ------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Principal** | Proyecto de Claude, con ERS y diagramas UML como conocimiento persistente | Generación de código de cada iteración                               |
| **Auxiliar**  | Chat estándar, sin contexto preservado                                    | Preparación de prompts, revisión de respuestas y detección de fallos |

Esta separación permitió preservar el contexto técnico del proyecto en el chat principal mientras se discutían, pulían y razonaban los prompts en el auxiliar, aplicando unas mismas directrices en cada iteración. Al enviar cada prompt al chat principal ya estaba depurado, y la respuesta podía integrarse sin tener que volver sobre ella.

## Resumen de iteraciones

| #   | Alcance                                                                        | Principales RF/CU            | Entregable                      |
| --- | ------------------------------------------------------------------------------ | ---------------------------- | ------------------------------- |
| 1   | Scaffolding PWA (login mock, i18n, mapa, rutas base)                           | RF-01, RNF-10, RNF-17        | Esqueleto funcional instalable  |
| 2   | Pantalla `/routes` con origen/destino, cobertura, 3 rutas alternativas por ISP | RF-02 a RF-05, RF-13 a RF-15 | Planificador operativo          |
| 3   | Modo «Voy contigo», monitorización, prealertas y perfil                        | RF-19 a RF-33, RF-49         | Acompañamiento virtual completo |
| 4   | Roles, reporte de incidencias y paneles de gestión                             | RF-37, RF-38, RF-41 a RF-47  | App multi-rol                   |
| 5   | Estadísticas, retención de datos 24 h y tests Vitest                           | RF-51, RF-52, RNF-18         | Prototipo cerrado               |

---

## Iteración 1 — Esqueleto del prototipo Senda URJC

**Prompt empleado.**

```
# Iteración 1 — Esqueleto del prototipo Senda URJC

## Contexto

Estoy desarrollando el prototipo evolutivo de Senda URJC, una PWA que ofrece rutas
seguras por los campus de la Universidad Rey Juan Carlos. Este es el primer prompt
de una serie de iteraciones que registraré en el fichero `seguimiento_ia.md` del
repositorio, como parte de la entrega opcional de la práctica de Análisis e
Ingeniería de Requisitos (curso 2025/26).

Tienes el ERS del proyecto y los diagramas UML en el conocimiento del proyecto.
Consúltalos cuando necesites verificar algún requisito.

## Estado actual del proyecto

Estructura del repositorio:

- `frontend/` — proyecto Vite con React 19 + TypeScript.
- `backend/` — carpeta vacía, de momento no la tocamos.
- `.gitignore`, `README.md` en la raíz.

En `frontend/` ya están instalados:

- `vite`, `react`, `react-dom`, `typescript`
- `tailwindcss@3`, `postcss`, `autoprefixer` (Tailwind v3, no v4, está configurado)
- `react-router-dom`
- `react-leaflet`, `leaflet`, `@types/leaflet`
- `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- `vite-plugin-pwa` (se instaló con `--legacy-peer-deps` por compatibilidad con Vite 8)

Aún no he tocado la plantilla por defecto de Vite (sigue estando el logo React).

## Objetivo de esta iteración

Dejar la aplicación con el esqueleto funcional mínimo:

1. **Autenticación mockeada** (RF-01, RNF-14). Botón "Iniciar sesión con SSO URJC" que,
   al pulsarlo, simula un login exitoso: crea una sesión local con nombre de persona
   usuaria y correo `@urjc.es` de ejemplo. No hay integración real con SSO; lo
   documentaré como decisión en `seguimiento_ia.md`.
2. **Rutas de navegación** entre tres pantallas: login, home (con mapa) y pantalla
   "solicitar ruta" (placeholder para la próxima iteración).
3. **Mapa** visible con `react-leaflet` y tiles de OpenStreetMap, centrado en el
   campus de Móstoles de la URJC (40.336, -3.875).
4. **i18n español e inglés** (RNF-10): cambio de idioma desde un selector en la barra
   superior. Textos mínimos: título, botón de login, etiqueta del mapa, enlaces del
   menú.
5. **PWA instalable**: `manifest.webmanifest` correcto y Service Worker básico, de
   modo que al abrir la app desde el móvil se pueda "añadir a pantalla de inicio".
6. **Layout general**: barra superior con logo/título, selector de idioma y, cuando
   hay sesión, botón para cerrar sesión. Paleta de la URJC: rojo corporativo
   `#C00000`.
7. **Accesibilidad básica** (RNF-09): botones grandes (mínimo 44 px de lado), textos
   legibles, contraste adecuado.

## Requisitos técnicos

- TypeScript con tipado explícito (no usar `any` salvo imprescindible).
- Componentes funcionales con hooks; nada de componentes de clase.
- Estado de autenticación global con React Context (no Redux, innecesario aquí).
- Tailwind para el estilado; no uses CSS modules ni librerías de componentes.
- Las rutas protegidas (home y "solicitar ruta") deben redirigir a `/login` si no
  hay sesión.
- El selector de idioma persiste en `localStorage`.
- Leaflet requiere importar el CSS; no se te olvide.

## Estructura de ficheros propuesta

Organiza el código así (ajústalo si crees que hay algo mejor, pero mantén la
separación):

frontend/src/
├── main.tsx
├── App.tsx
├── index.css                    # Tailwind directives
├── vite-env.d.ts
├── i18n/
│   ├── index.ts                 # init de i18next
│   └── locales/
│       ├── es.json
│       └── en.json
├── auth/
│   ├── AuthContext.tsx          # Provider + hook useAuth
│   └── types.ts                 # User, AuthState
├── components/
│   ├── Layout.tsx               # TopBar + <Outlet />
│   ├── TopBar.tsx
│   ├── LanguageSwitcher.tsx
│   └── ProtectedRoute.tsx
└── pages/
    ├── LoginPage.tsx
    ├── HomePage.tsx             # Contiene el <MapView />
    └── RouteRequestPage.tsx     # Placeholder

Además:

- `frontend/vite.config.ts` con la configuración de `vite-plugin-pwa` (registro
  automático, manifest con nombre "Senda URJC", colores institucionales).
- `frontend/public/` con iconos placeholder (192x192 y 512x512, pueden ser cuadrados
  de color `#C00000` con el texto "SU" en blanco — indica cómo generarlos si hace
  falta o usa un SVG que luego pueda exportar).

## Formato de entrega

Para cada fichero nuevo o modificado, devuelve:

1. La ruta completa del fichero como título (`### frontend/src/App.tsx`).
2. El contenido íntegro del fichero en un bloque de código con la etiqueta del
   lenguaje.

Al final, añade una sección `## Pasos para probarlo` con:

- Comandos para arrancar el dev server.
- Qué debería verse al abrir `http://localhost:5173`.
- Cómo comprobar que la PWA es instalable (Chrome DevTools → Application).

También, al final, una sección `## Decisiones y notas para seguimiento_ia.md`
resumiendo qué has hecho, qué has decidido y qué has dejado para la próxima
iteración. La copiaré directamente al fichero de seguimiento.

## Restricciones

- No añadas dependencias nuevas salvo justificación explícita.
- No toques `package.json` salvo para scripts.
- Mantén el idioma del código en inglés (nombres de variables, funciones, tipos),
  pero los textos de UI en los ficheros de locales.
- Los comentarios en el código: justos los necesarios, en inglés.

Cuando estés listo, genera toda la iteración 1.
```

**Contexto proporcionado.** Enunciado de la práctica, ERS y diagramas UML cargados en el proyecto de Claude. Conversación previa acordando el stack tecnológico.

**Artefactos generados.**

- **Nuevos:** `i18n/` (config + locales ES/EN), `auth/` (Context, types), `components/` (Layout, TopBar, LanguageSwitcher, MapView, ProtectedRoute), `pages/` (LoginPage, HomePage, RouteRequestPage), iconos PWA 192/512.
- **Modificados:** `main.tsx`, `App.tsx`, `index.css`, `vite.config.ts`.

**Evaluación.**

- **Correctas:** estructura modular, i18n con persistencia, `AuthContext` + ruta protegida, Leaflet centrado en Móstoles, PWA con Service Worker activo.
- **Fallidas:** (1) TS2503 por `: JSX.Element` incompatible con React 19. (2) PWA no instalable: Claude no generó el contenido real de los PNG del manifest.
- **Correcciones:** eliminación masiva de `: JSX.Element` en 10 componentes. Iconos PNG generados a mano con fondo `#C00000`. Enviados a Claude los **avisos 1 y 2** como instrucciones permanentes.

---

## Iteración 2 — Solicitud de ruta con alternativas por ISP

**Prompt empleado.**

```
# Iteración 2 — Solicitud de ruta con origen, destino y alternativas

## Contexto

Continuamos el prototipo evolutivo de Senda URJC. La iteración 1 dejó el
esqueleto funcionando: autenticación mockeada, navegación entre páginas,
mapa Leaflet centrado en Móstoles, i18n ES/EN y PWA instalable. Ahora
vamos a llenar la pantalla `/route-request`, que en iteración 1 era un
placeholder.

Recuerda las dos instrucciones correctivas anteriores:

- No uses `: JSX.Element` como tipo de retorno en los componentes. Deja
  que TypeScript lo infiera.
- Si necesitas ficheros placeholder (binarios, iconos, imágenes, etc.),
  o bien genera su contenido explícito o advierte claramente de que el
  equipo debe crearlos a mano antes de probar.

## Objetivo de esta iteración

Convertir la pantalla `RouteRequestPage` en una herramienta funcional de
solicitud de ruta que cumpla los requisitos RF-02, RF-03, RF-04, RF-05,
RF-13, RF-14 y RF-15.

Concretamente:

1. **Selección de origen y destino por dos métodos:**
   - **Buscador de direcciones** (input de texto con autocompletado)
     usando la API de **Nominatim de OpenStreetMap**
     (`https://nominatim.openstreetmap.org/search`). Dos inputs, uno para
     origen y otro para destino. Al teclear, debouncing de 400 ms y
     lista desplegable con sugerencias. Al seleccionar una sugerencia,
     el marcador correspondiente se coloca en el mapa.
   - **Clicks en el mapa:** un selector arriba del mapa con dos botones
     ("Colocar origen" / "Colocar destino") indica qué marcador se
     colocará en el siguiente click. Por defecto, el primer click coloca
     origen y el segundo destino; después, el selector permite mover
     cualquiera de los dos.
   - Botón **"Usar mi ubicación actual"** junto al input de origen, que
     use `navigator.geolocation.getCurrentPosition`. Si falla o se
     deniega, muestra mensaje explicativo.

2. **Restricción de ámbito (RF-14, RF-15):**
   - Definir constantes con los centros aproximados de los campus de la
     URJC y un radio de 500 m alrededor de cada uno. Usa estos valores:
     - Móstoles: (40.336, -3.875)
     - Alcorcón: (40.343, -3.818)
     - Vicálvaro: (40.404, -3.650)
     - Fuenlabrada: (40.282, -3.794)
     - Aranjuez: (40.032, -3.604)
   - Si el punto seleccionado (origen o destino) está a más de 500 m del
     centro de cualquier campus, se rechaza y se muestra un mensaje en
     pantalla. El marcador no se coloca.

3. **Cálculo simulado de rutas (RF-03, RF-06):**
   - Una vez hay origen y destino válidos, al pulsar **"Calcular ruta"**
     se generan **tres rutas alternativas** de manera simulada:
     - **Ruta principal:** polyline formada por origen + destino.
     - **Ruta alternativa 1:** polyline con un waypoint intermedio
       desviado perpendicularmente a la recta origen-destino, a una
       distancia del 20 % de la longitud total.
     - **Ruta alternativa 2:** lo mismo pero desviado en sentido
       opuesto.
   - Cada ruta recibe un **Índice de Seguridad Percibida** mock
     aleatorio (un entero entre 0 y 100) y una **clasificación
     simplificada** (RF-05):
     - ≥ 70 → "Alto" (color verde `#16A34A`).
     - 40–69 → "Medio" (color amarillo `#EAB308`).
     - < 40 → "Bajo" (color rojo `#DC2626`).
   - Las rutas se dibujan en el mapa con el color correspondiente a su
     nivel, simultáneamente y con distinto grosor (la seleccionada
     activa más gruesa).

4. **Listado de rutas (RF-04):**
   - Debajo del mapa (o en un panel lateral en pantalla ancha) una lista
     con las 3 rutas, ordenadas de mayor a menor ISP. Cada entrada
     muestra: etiqueta de nivel con su color, distancia estimada en km
     (sí puedes calcularla: suma de Haversine entre waypoints), tiempo
     estimado a pie a 5 km/h, y un botón **"Elegir esta ruta"**.
   - Al elegir una ruta, se resalta en el mapa y se persiste en estado
     como la "ruta activa".

5. **Recálculo de rutas (RF-13):**
   - Botón **"Recalcular"** visible tras el primer cálculo, que vuelve
     a generar tres rutas alternativas con ISP aleatorios distintos.
     Origen y destino se mantienen.

6. **Restricción visual del ámbito:**
   - Dibujar en el mapa los cinco círculos de 500 m alrededor de cada
     centro de campus con estilo suave (relleno transparente con
     `fillOpacity: 0.1` y borde punteado) para que la persona usuaria
     vea dónde puede colocar los puntos.

## Requisitos técnicos

- TypeScript estricto, sin `any` salvo imprescindible.
- Componentes funcionales con hooks; no clases.
- Cálculo de rutas y validación de ámbito en **servicios separados**
  bajo `frontend/src/services/`:
  - `services/routing.ts`: función `calculateRoutes(origin, destination)`
    que devuelve tres rutas simuladas con ISP aleatorio.
  - `services/geocoding.ts`: función `searchAddress(query)` que llama a
    Nominatim.
  - `services/coverage.ts`: constantes de campus, función
    `isWithinCoverage(point)` y función auxiliar `haversineDistance`.
    Así en iteraciones futuras se puede cambiar la simulación por OSRM
    real sin tocar la UI.
- Tipos de dominio en `frontend/src/types/route.ts`:
  `LatLng`, `Route` (id, waypoints, isp, safetyLevel, distanceKm,
  durationMin), `SafetyLevel` (`'high' | 'medium' | 'low'`).
- React Context o un hook `useRoutePlanner` para gestionar el estado
  (origen, destino, rutas calculadas, ruta activa). Tú decides la
  abstracción; no metas librerías externas.
- Nuevas cadenas de UI en `i18n/locales/es.json` y `en.json`:
  campos del buscador, etiquetas de nivel, botones, mensajes de error.

## Estructura de ficheros propuesta

Nuevos:

frontend/src/
├── services/
│   ├── routing.ts
│   ├── geocoding.ts
│   └── coverage.ts
├── types/
│   └── route.ts
├── hooks/
│   └── useRoutePlanner.ts
└── components/
    ├── AddressSearchInput.tsx
    ├── RouteList.tsx
    ├── RouteMap.tsx              ← sustituye al MapView actual (o lo amplía)
    └── CoverageCircles.tsx        ← círculos de 500 m sobre el mapa

Modificados:

- `frontend/src/pages/RouteRequestPage.tsx` — contendrá el layout de la
  pantalla (buscador, mapa, listado).
- `frontend/src/i18n/locales/es.json` y `en.json`.
- `frontend/src/pages/HomePage.tsx` — enlace más prominente a
  "Solicitar ruta".

## Restricciones

- **No añadas dependencias nuevas.** Todo lo necesario (fetch, Leaflet,
  i18next) ya está instalado.
- Nominatim acepta peticiones sin clave pero **exige un User-Agent
  descriptivo** en la cabecera; incluye `User-Agent: 'Senda URJC
(prototipo académico - URJC AIR 2025/26)'` en el fetch. Menciona esto
  como limitación en las notas finales.
- Debouncing manual (sin lodash). 400 ms es razonable.
- El lenguaje de UI va en `es.json` y `en.json`. No metas strings
  hardcoded en los componentes.
- Código en inglés, UI en ES/EN.

## Formato de entrega

Para cada fichero nuevo o modificado, devuelve la ruta completa como
título (`### frontend/src/services/routing.ts`) y el contenido íntegro
en un bloque de código con la etiqueta del lenguaje.

Al final añade:

- `## Pasos para probarlo`: cómo arrancar dev server, qué probar en qué
  orden (teclear una dirección, hacer click en el mapa, provocar el
  error de ámbito, calcular rutas, elegir una, recalcular).
- `## Decisiones y notas para seguimiento_ia.md`: resumen de
  decisiones tomadas, limitaciones conocidas (latencia de Nominatim,
  rutas simuladas, etc.) y qué queda pendiente para la iteración 3.

Cuando estés listo, genera toda la iteración 2.
```

**Contexto proporcionado.** Estado del repo tras iter 1; decisión previa de simular rutas (no OSRM) y selección mixta buscador + clicks.

**Artefactos generados.**

- **Nuevos:** `types/route.ts`, `services/` (coverage, geocoding, routing), `hooks/useRoutePlanner.tsx`, `components/` (AddressSearchInput, CoverageCircles, RouteMap, RouteList).
- **Modificados:** `RouteRequestPage.tsx`, `HomePage.tsx`, locales ES/EN.

**Evaluación.**

- **Correctas:** separación limpia servicios/estado/UI, validación de cobertura unificada, desviaciones perpendiculares en metros reales, debouncing con `AbortController`, marcadores SVG embebidos.
- **Parciales:** RF-06 queda simulado (sin backend LumenSmart); cobertura como círculos, no polígonos.
- **Fallidas:** (1) mapa colapsa a altura 0 en móvil/tablet. (2) TS7006 en dos callbacks sin tipar. (3) Claude referenció el ERS como v7.0.
- **Correcciones:** contenedor del mapa con altura explícita en móvil (`h-[60vh] min-h-[400px]`), tipado `(p: LatLng)`, y **aviso 3** a Claude cubriendo las tres cosas.

---

## Iteración 3 — Modo «Voy contigo» y perfil

**Prompt empleado.**

```
# Iteración 3 — Modo «Voy contigo», monitorización y prealertas

## Contexto

Continuamos el prototipo evolutivo de Senda URJC. Las iteraciones
anteriores han dejado:

- Iteración 1: esqueleto funcional (login mock, navegación, mapa,
  i18n ES/EN, PWA instalable).
- Iteración 2: pantalla `/route-request` con selección de origen y
  destino (por buscador Nominatim y clicks en el mapa), validación de
  cobertura de 500 m alrededor de los campus URJC, generación simulada
  de tres rutas alternativas con ISP clasificado en tres niveles, y
  recálculo. Tipos en `frontend/src/types/route.ts`, servicios en
  `frontend/src/services/` (coverage, geocoding, routing) y hook
  `useRoutePlanner` en `frontend/src/hooks/`.

Recuerda las instrucciones correctivas previas:

- No uses `: JSX.Element` como tipo de retorno en los componentes.
- Si hay ficheros placeholder (binarios, imágenes), genera su contenido
  explícito o advierte claramente de que deben crearse a mano.
- Tipa explícitamente los parámetros de callbacks (`(p: LatLng) => ...`)
  donde TypeScript no pueda inferirlos solo. El proyecto tiene
  `strict: true`.
- Layouts responsivos: da altura explícita al contenedor del elemento
  crítico en breakpoints pequeños; `flex-1` solo donde haya altura
  garantizada en el padre.
- El ERS vigente es la **v8.0**. Si necesitas referenciarlo en notas,
  usa esa versión.

## Objetivo de esta iteración

Añadir el modo «Voy contigo»: una vez la persona usuaria ha elegido una
ruta en `/route-request` y pulsa "Iniciar trayecto", navegamos a una
nueva pantalla `/trip` donde:

1. Se simula el recorrido del trayecto con un marcador animado que se
   desplaza a lo largo de la ruta elegida.
2. Se comparte la ubicación simulada con una persona destinataria
   (voluntaria o contacto de confianza, elegida antes de iniciar).
3. El sistema monitoriza paradas y desvíos; al detectarlos, lanza una
   prealerta que pide confirmación de la persona usuaria durante 30 s.
4. Si no se confirma el estado, la prealerta escala a alerta y se
   notifica al Servicio de Seguridad (simulado).
5. El perfil de la persona usuaria tiene ahora una sección de contactos
   de confianza y umbrales de prealerta configurables.
6. Hay un panel de registro de personas voluntarias.

## Requisitos del ERS cubiertos

- **RF-20** Activar modo «Voy contigo».
- **RF-21** Selección de persona destinataria del acompañamiento.
- **RF-22** Compartición de la ubicación durante el trayecto.
- **RF-23** Visualización de la ubicación compartida por parte del
  destinatario (vista simulada en la misma pantalla, panel lateral).
- **RF-24** Visualización de la ruta activa por parte del destinatario.
- **RF-25** Detección de paradas inesperadas y desvíos.
- **RF-26** Emisión de prealerta ante paradas o desvíos.
- **RF-27** Confirmación manual del estado «estoy bien».
- **RF-28** Plazo de 30 segundos para confirmar antes de escalar.
- **RF-29** Configuración de umbrales de prealerta (tiempo de parada,
  distancia de desvío).
- **RF-30** Notificación de alerta al destinatario.
- **RF-31** Escalado al Servicio de Seguridad si no hay respuesta.
- **RF-32** Contenido de la alerta (ubicación actual, ruta, persona
  usuaria).
- **RF-33** Registro como persona voluntaria.
- **RF-49** Configuración de personas de contacto de confianza.

Casos de uso del ERS afectados: CU-07, CU-08, CU-09, CU-10, CU-11,
CU-13, CU-22.

## Alcance funcional detallado

### 3.1. Pantalla `/trip` (trayecto activo)

Se navega a ella desde `/route-request` al pulsar un nuevo botón
"Iniciar trayecto" que aparece cuando hay una ruta seleccionada.
La persona elige primero a quién acompaña (CU-08/21) mediante un modal
o un segundo paso:

- Lista de destinatarios disponibles: contactos de confianza + personas
  voluntarias (ambos mock — ver 3.5 y 3.6). El desplegable muestra cada
  destinatario con su tipo.
- Botón "Iniciar trayecto" que crea una instancia de trayecto activo y
  navega a `/trip`.

Layout de `/trip`:

- **Panel lateral (desktop) / superior (móvil):** información del
  trayecto en curso:
  - Destinatario elegido.
  - Tiempo transcurrido y tiempo estimado restante.
  - Distancia recorrida / total.
  - ISP promedio de la ruta activa.
  - Botón grande "He llegado" (finaliza el trayecto).
  - Botón "Forzar prealerta" (dispara manualmente, útil para demo).
  - Botón "Cancelar trayecto" (con confirmación).
- **Mapa:** muestra la ruta activa, un marcador animado que se mueve
  hacia el destino simulando el avance, los círculos de cobertura, y
  un marcador estático del destino.
- **Panel "Qué ve el destinatario":** en desktop, segunda columna a la
  derecha (o debajo del panel principal). Simula lo que vería la
  persona destinataria: mapa reducido con la ubicación actual, la ruta
  y el historial de posiciones. Tiene su propio componente
  `CompanionView` que reusa piezas del mapa principal. Útil para
  demostrar el RF-23/24 sin tener dos dispositivos.

### 3.2. Simulación del recorrido

- Al montar `/trip`, se calcula una sucesión de posiciones intermedias
  entre origen y destino siguiendo los waypoints de la ruta activa,
  espaciadas de modo que la velocidad simulada sea **5 km/h**.
- Un temporizador en el hook `useTripRuntime` avanza la posición cada
  segundo (o cada 500 ms para que no sea excesivamente lenta; en el
  prompt indícalo como "tickRate configurable, por defecto 1000 ms").
- Al alcanzar el destino, el trayecto pasa a estado "finalizado".

### 3.3. Detección de prealertas

Dos disparadores automáticos + uno manual:

- **Parada:** si el marcador simulado no avanza durante más de
  `pauseThresholdSec` segundos (por defecto 60). En la simulación esto
  solo ocurre si se fuerza desde el botón "Simular parada" (ver 3.4).
- **Desvío:** si, durante el avance simulado, se introduce
  artificialmente un punto fuera de la ruta a una distancia mayor que
  `deviationThresholdMeters` (por defecto 50 m). También solo ocurre
  bajo demanda.
- **Manual:** botón "Forzar prealerta" en el panel, siempre disponible.

Cuando se dispara una prealerta:

1. El estado del trayecto pasa a "prealerta".
2. Se muestra un modal persistente con:
   - Título i18n: «¿Estás bien?».
   - Cuenta atrás de 30 segundos visible.
   - Botones: **«Estoy bien»** (cierra, vuelve a estado "en curso") y
     **«Pedir ayuda ahora»** (escala inmediatamente a alerta).
3. Si expiran los 30 s sin respuesta, se escala automáticamente a
   alerta (RF-28, RF-31).

### 3.4. Estado "alerta"

Cuando se escala:

- El estado del trayecto pasa a "alerta".
- Aparece un banner rojo persistente en la parte superior de `/trip`
  con texto tipo "Alerta enviada al Servicio de Seguridad. Estamos
  contigo."
- En el panel "Qué ve el destinatario" aparece también la notificación
  simulada.
- Se añade un panel adicional "Panel del Servicio de Seguridad
  (simulado)" con los datos de la alerta (nombre de la persona usuaria,
  ubicación actual, ruta, hora). Es decorativo, solo muestra los datos.
- Botón "Marcar como resuelta" en ese panel (decorativo).

### 3.5. Perfil: contactos de confianza (RF-49, CU-22)

Nueva pantalla `/profile` con dos secciones:

- **Contactos de confianza.** Lista editable (nombre + teléfono de
  contacto, ambos mock). CRUD básico en memoria + persistencia en
  `localStorage`. Al menos un contacto de ejemplo pre-cargado.
- **Umbrales de prealerta.** Dos sliders o inputs numéricos:
  - Tiempo de parada máximo (segundos), rango 30-300, por defecto 60.
  - Distancia de desvío máxima (metros), rango 20-200, por defecto 50.
    Se persisten en `localStorage`.

Añade enlace a `/profile` en la `TopBar` (desde la iteración 1, donde
ya hay logout y selector de idioma).

### 3.6. Registro de voluntariado (RF-33, CU-13)

Sección adicional en `/profile`:

- Toggle "Ofrecerme como persona voluntaria". Al activarlo:
  - Se añade al usuario mock actual a un registro de voluntariado
    local (en `localStorage`, clave `senda.volunteers`).
  - Aparece un mensaje informativo indicando que otras personas
    podrán elegirte como destinatario.

Actualiza el selector de destinatario en la preparación del trayecto
para que lea:

- Contactos de confianza del usuario actual (de `localStorage`).
- Lista de personas voluntarias (voluntarios mock hardcoded + las del
  `localStorage`).

## Requisitos técnicos

- TypeScript estricto, sin `any` salvo imprescindible. Tipa parámetros
  de callbacks explícitamente donde sea necesario.
- Componentes funcionales con hooks, sin clases.
- Todo el estado del trayecto activo (ruta elegida, destinatario,
  posición actual, estado "normal"/"prealerta"/"alerta", historial de
  posiciones, timer) va en un hook/Provider nuevo:
  `frontend/src/hooks/useTripRuntime.tsx`. Este Provider envuelve solo
  `/trip`.
- Lógica separada de la UI en `frontend/src/services/`:
  - `services/monitoring.ts`: función `detectAnomaly(position, route,
thresholds)` que decide si una posición actual constituye desvío
    o no (placeholder sencillo, no hace falta geometría avanzada).
  - `services/trip.ts`: función `buildTripTrack(route, speedKmh)` que
    devuelve un array de posiciones temporizadas a recorrer.
  - `services/alert.ts`: función `buildAlertPayload(trip, user)` que
    compone el objeto de datos de una alerta para mostrar en el panel
    de Seguridad simulado.
- Nuevos tipos en `frontend/src/types/trip.ts`:
  `TripState` (`'preparing' | 'in_progress' | 'prealert' | 'alert' |
'completed' | 'cancelled'`), `TripRuntime`, `Contact`, `Volunteer`,
  `AlertPayload`.
- Persistencia mínima en `localStorage` bajo un namespace `senda.*`:
  `senda.contacts`, `senda.volunteers`, `senda.thresholds`.
- i18n ES/EN completo para toda la nueva UI, sin strings hardcoded.
- Accesibilidad: botones grandes (mín. 44 px), aria-labels claros en
  modales, cuenta atrás con `aria-live="assertive"`.

## Estructura de ficheros propuesta

Nuevos:

frontend/src/
├── pages/
│   ├── TripPage.tsx
│   └── ProfilePage.tsx
├── hooks/
│   └── useTripRuntime.tsx
├── services/
│   ├── monitoring.ts
│   ├── trip.ts
│   ├── alert.ts
│   └── storage.ts            ← helpers de localStorage con namespace
├── types/
│   └── trip.ts
└── components/
    ├── TripPanel.tsx          ← panel lateral con info del trayecto
    ├── TripMap.tsx            ← mapa principal con marcador animado
    ├── CompanionView.tsx      ← panel simulado del destinatario
    ├── PrealertModal.tsx      ← modal ¿estás bien? con cuenta atrás
    ├── SecurityPanel.tsx      ← panel simulado del Servicio de Seguridad
    ├── DestinationPicker.tsx  ← modal o paso previo para elegir destinatario
    ├── ContactsManager.tsx    ← CRUD de contactos en /profile
    ├── ThresholdsEditor.tsx   ← sliders de umbrales en /profile
    └── VolunteerToggle.tsx    ← alta/baja de voluntariado

Modificados:

- `frontend/src/App.tsx` — añadir rutas `/trip` y `/profile`.
- `frontend/src/pages/RouteRequestPage.tsx` — botón "Iniciar
  trayecto" que abre el DestinationPicker y navega a `/trip`.
- `frontend/src/components/TopBar.tsx` — enlace a "Perfil".
- `frontend/src/i18n/locales/es.json` y `en.json` — todas las
  cadenas nuevas.

## Restricciones

- No añadas dependencias nuevas. Todo lo necesario (`react-leaflet`,
  `react-router-dom`, `i18next`, etc.) ya está instalado.
- No uses librerías de modales externas: crea tú un modal accesible
  usando Tailwind (puede ser un div fixed con backdrop).
- No uses librerías de animación externas. El marcador animado se
  mueve mediante `setInterval` y re-render normal. Leaflet repintará
  la posición sin problema.
- No toques `package.json` salvo para scripts si hiciera falta.
- Lenguaje del código en inglés, UI en ES/EN.

## Formato de entrega

Para cada fichero nuevo o modificado, devuelve:

1. La ruta completa como título (`### frontend/src/pages/TripPage.tsx`).
2. El contenido íntegro del fichero en un bloque de código con la
   etiqueta del lenguaje.

Al final:

- `## Pasos para probarlo` con el flujo: preparar trayecto (elegir
  destinatario), iniciar, ver animación, forzar prealerta, confirmar o
  dejar expirar, ver escalado a alerta, finalizar trayecto, gestionar
  contactos en `/profile`, registrar voluntariado.
- `## Decisiones y notas para seguimiento_ia.md` con decisiones
  técnicas, limitaciones conocidas y qué queda pendiente para la
  iteración 4 (reverse-geocoding, reporte de incidencias, panel admin).

Cuando estés listo, genera toda la iteración 3.
```

**Contexto proporcionado.** Estado del repo tras iter 2; decisión de simulación con animación + botones manuales y pantalla `/trip` independiente.

**Artefactos generados.**

- **Nuevos:** `types/trip.ts`, `services/` (storage, monitoring, trip, alert), `hooks/useTripRuntime.tsx`, `components/` (DestinationPicker, TripPanel, TripMap, CompanionView, PrealertModal, SecurityPanel, ContactsManager, ThresholdsEditor, VolunteerToggle), `pages/` (TripPage, ProfilePage).
- **Modificados:** `App.tsx`, `TopBar.tsx`, `RouteRequestPage.tsx`, `index.css`, locales ES/EN.

**Evaluación.**

- **Correctas:** `useReducer` puro con estados `preparing→in_progress→prealert→alert→completed/cancelled`; dos relojes independientes (animación + cuenta atrás); modal accesible con `role="alertdialog"` y `aria-live="assertive"`; sincronización intra-tab vía `CustomEvent 'senda:storage'`.
- **Parciales:** la transmisión al destinatario se simula en memoria (no WebSocket); el estado no persiste entre refrescos.
- **Fallidas:** Claude empezó la respuesta por `TripMap.tsx` omitiendo 7 ficheros fundacionales (tipos, servicios, hook, `DestinationPicker`); artefacto `.replace(' ', '')` espurio en la URL del `TileLayer`.
- **Correcciones:** regeneración completa de la iteración; URL del tile corregida; **aviso 4** enviado a Claude.

---

## Iteración 4 — Roles, incidencias y paneles de gestión

**Prompt empleado.**

```
# Iteración 4 — Reporte de incidencias, panel de administración y cierre funcional

## Contexto

Continuamos el prototipo evolutivo de Senda URJC. Estado previo:

- Iteración 1: esqueleto con login mock, i18n ES/EN, mapa Leaflet y PWA.
- Iteración 2: pantalla `/routes` funcional con solicitud de rutas,
  validación de cobertura, tres alternativas clasificadas por ISP y
  recálculo.
- Iteración 3: modo «Voy contigo» completo con pantalla `/trip`,
  simulación del recorrido, monitorización, modal de prealerta (30 s)
  y escalado a alerta con panel del Servicio de Seguridad simulado.
  Pantalla `/profile` con contactos, umbrales y voluntariado.

Esta iteración cierra el prototipo con tres bloques:

1. **Reporte de incidencias del entorno** (RF-37 a RF-40, CU-12).
2. **Panel del personal administrador** con gestión de tickets y alertas
   (RF-41 a RF-47, CU-14, CU-16, CU-17, CU-18, CU-19).
3. **Paneles específicos del Servicio de Seguridad y del Servicio de
   Mantenimiento** (RF-44, RF-45), accesibles por rol.
4. **Reverse-geocoding** en `/routes` al colocar marcadores por click,
   tarea pendiente de iteración 2.
5. **Selector de rol mock en la pantalla de login**, para poder entrar
   como persona usuaria, personal administrador, Servicio de Seguridad
   o Servicio de Mantenimiento.

Recuerda las instrucciones correctivas acumuladas:

- No uses `: JSX.Element` como tipo de retorno en los componentes.
- Si hay ficheros placeholder (binarios, imágenes), genera su contenido
  explícito o advierte claramente de que deben crearse a mano.
- Tipa explícitamente los parámetros de callbacks donde TypeScript no
  pueda inferirlos solo. El proyecto tiene `strict: true`.
- Layouts responsivos: da altura explícita al contenedor del elemento
  crítico en breakpoints pequeños; `flex-1` solo donde haya altura
  garantizada en el padre.
- El ERS vigente es **v8.0**.
- Al generar iteraciones grandes, asegúrate de incluir TODOS los
  ficheros nuevos que los componentes importan (tipos, servicios,
  hooks). Si la respuesta se corta, identifica claramente si hay
  ficheros pendientes.

## Objetivo detallado

### 4.1. Selector de rol en el login (prerrequisito de todo lo demás)

Modificar la pantalla `/login` para que, además del botón principal
"Iniciar sesión con SSO URJC" (que seguirá logueando como persona
usuaria igual que antes), aparezca una segunda sección **"Iniciar
sesión como rol de prueba"** con cuatro botones:

- Persona usuaria
- Personal administrador
- Servicio de Seguridad
- Servicio de Mantenimiento

Cada uno hace login con un usuario mock preconstruido:

- `usuaria@urjc.es` (rol `user`) — igual que el actual.
- `admin@urjc.es` (rol `admin`).
- `seguridad@urjc.es` (rol `security`).
- `mantenimiento@urjc.es` (rol `maintenance`).

Extender el tipo `User` con la propiedad `role: 'user' | 'admin' |
'security' | 'maintenance'`. Extender `AuthContext` para que persista
también el rol en localStorage.

En la TopBar, junto al nombre del usuario, mostrar un pequeño badge
con el rol actual (útil para depurar durante demo).

### 4.2. Reverse-geocoding en /routes (pendiente de iter 2)

En la pantalla `/routes`, al colocar un marcador por click en el mapa
(no por buscador), el input de texto correspondiente se rellena con
la dirección textual obtenida mediante reverse-geocoding de Nominatim
(endpoint `https://nominatim.openstreetmap.org/reverse`).

Extender `services/geocoding.ts` con una función
`reverseGeocode(point: LatLng): Promise<string>` que devuelve el
`display_name`. Respeta el mismo patrón de uso que `searchAddress`
(parámetro `email`, headers `Accept-Language`).

Integración en `RoutePlannerProvider`: al llamar `setEndpoint(kind,
point)` por click, disparar el reverse-geocoding de fondo y, cuando
llegue la respuesta, actualizar un nuevo campo `originLabel` o
`destinationLabel` según corresponda. Si falla, dejar el input con
las coordenadas ("Lat X, Lng Y") como antes.

`AddressSearchInput` debe leer este label cuando el endpoint venga
desde click (no desde buscador) y mostrarlo en el input.

### 4.3. Reporte de incidencias (RF-37 a RF-40, CU-12)

Dos puntos de acceso:

**A) Desde `/trip` durante un trayecto activo.** Botón flotante (FAB)
en la esquina inferior derecha del mapa, icono SVG inline de alerta
(triángulo con !). Abre un modal `IncidentReportModal`.

**B) Desde una pantalla nueva `/incidents/new`**, accesible desde un
enlace en la TopBar (solo visible para rol `user`). Permite reportar
una incidencia sin necesidad de estar en un trayecto.

El modal/pantalla de reporte incluye:

- Selector de **categoría** (radio buttons o cards clicables) con
  cuatro opciones:
  - Farola fundida (tipo `lighting`)
  - Zona solitaria o con sensación de inseguridad (tipo `feeling`)
  - Obstáculo en la vía (tipo `obstacle`)
  - Dificultad de accesibilidad (tipo `accessibility`)
- Campo de **descripción** opcional (textarea, máx 280 caracteres).
- **Ubicación**: si estás en `/trip`, se rellena automáticamente con la
  posición actual del trayecto. Si estás en `/incidents/new`, pide al
  usuario confirmar con un botón "Usar mi ubicación actual" o hacer
  click en un mini-mapa embebido para elegir un punto.
- Validación de cobertura igual que en `/routes`: el punto debe estar
  dentro del perímetro de 500 m de los campus; si no, muestra error.
- Botón "Enviar incidencia" y botón "Cancelar".

Al enviar, se genera un **ticket** con:

- `id` único (timestamp + random).
- `createdBy` (usuario actual).
- `category` (lighting | feeling | obstacle | accessibility).
- `description` (si hay).
- `location: LatLng`.
- `createdAt: number` (timestamp).
- `status: 'open' | 'assigned_security' | 'assigned_maintenance' | 'closed'`.
- `assignedTo?: string` (rol al que se ha derivado).
- `resolvedAt?: number`.
- `resolutionNote?: string`.

Los tickets se persisten en `localStorage` bajo `senda.tickets`.
Confirmación tras envío ("Incidencia registrada. Gracias por ayudar a
mejorar la seguridad del campus.").

### 4.4. Pantalla `/admin` — panel del personal administrador

Protegida por rol: solo accesible si el usuario tiene rol `admin`. Si
un usuario con otro rol intenta acceder, redirige a `/` (o muestra
403).

Layout con **dos pestañas**:

**Tab 1: Tickets de incidencias**

Lista de todos los tickets ordenada por fecha de creación descendente.
Cada fila muestra:

- Categoría (con badge de color: lighting amarillo, feeling morado,
  obstacle naranja, accessibility azul).
- Descripción (truncada a 100 caracteres).
- Ubicación (coordenadas).
- Fecha de creación.
- Estado (badge: open, assigned_security, assigned_maintenance, closed).
- Acciones:
  - Botón "Derivar a Seguridad" (si status === 'open').
  - Botón "Derivar a Mantenimiento" (si status === 'open').
  - Botón "Cerrar" (si status != 'closed').

Derivar cambia el status a `assigned_security` o
`assigned_maintenance` y asigna `assignedTo`. Cerrar cambia a `closed`
y marca `resolvedAt`. Al cerrar, pedir una `resolutionNote` opcional
en un pequeño modal inline.

**Tab 2: Alertas escaladas**

Lista de alertas generadas por trayectos en los que se escaló a
alerta (integración con lo que ya genera `/trip` cuando expira la
prealerta). Cada alerta se persiste bajo `senda.alerts` y tiene:

- `id`.
- `userId`, `userName`.
- `recipientName`.
- `reason` (pause | deviation | manual).
- `location: LatLng`.
- `triggeredAt`.
- `status: 'active' | 'resolved'`.

Acciones en la lista: "Marcar como atendida" (cambia a resolved).

**Importante:** actualizar el `useTripRuntime` o el componente
`SecurityPanel` para que, al escalar una alerta (acción TRIGGER_ALERT
o al pulsar "Marcar como resuelta"), también se persista en
`senda.alerts`. El panel `/admin` lee de ahí.

### 4.5. Pantallas `/security` y `/maintenance` — servicios específicos

Dos pantallas simétricas, protegidas por rol:

- `/security` accesible solo si el usuario tiene rol `security`.
- `/maintenance` accesible solo si el usuario tiene rol `maintenance`.

Muestran únicamente los tickets derivados a su servicio:

- `/security`: tickets con `status === 'assigned_security'` y alertas
  activas (`senda.alerts` con status 'active').
- `/maintenance`: tickets con `status === 'assigned_maintenance'`.

Acciones:

- Marcar ticket como resuelto (igual que el admin, añade
  `resolutionNote` opcional).
- En `/security`, marcar alerta como atendida.

### 4.6. Navegación según rol

Actualizar la TopBar para que los enlaces visibles dependan del rol:

- Rol `user`: enlaces "Inicio", "Perfil", "Reportar incidencia"
  (lleva a `/incidents/new`). Igual que iteración 3 + el nuevo.
- Rol `admin`: enlace "Administración" (lleva a `/admin`). Sin
  acceso a `/routes`, `/trip`, `/profile` (esos son de usuario
  final).
- Rol `security`: enlace "Servicio de Seguridad" (lleva a
  `/security`).
- Rol `maintenance`: enlace "Servicio de Mantenimiento" (lleva a
  `/maintenance`).

Todos los roles pueden cambiar idioma y cerrar sesión.

Al hacer login, redirigir al rol correspondiente:

- `user` → `/`
- `admin` → `/admin`
- `security` → `/security`
- `maintenance` → `/maintenance`

### 4.7. Roles y acceso protegido

Crear un componente `RoleGuard` (variante de `ProtectedRoute`) que
acepte una prop `allowedRoles: Role[]` y redirija si el rol del
usuario no está entre ellos.

## Requisitos técnicos

- TypeScript estricto, sin `any` salvo imprescindible.
- Reutiliza la infraestructura de iteraciones anteriores: `services/
storage.ts` con el namespace `senda.*`, patrón de hooks con
  CustomEvent, tipos en `types/`, layouts responsivos.
- Todos los roles se definen como `type Role = 'user' | 'admin' |
'security' | 'maintenance'`.
- El CRUD de tickets vive en un nuevo servicio
  `services/tickets.ts` con funciones puras (`loadTickets`,
  `saveTickets`, `updateTicket`, `deleteTicket` si procede) más un
  hook `useTickets` reactivo.
- Lo mismo para las alertas: `services/alerts.ts` con `loadAlerts`,
  `saveAlerts`, `appendAlert` (lo usa `useTripRuntime` al escalar),
  `updateAlert` y `useAlerts`.
- i18n completo para todas las cadenas nuevas.

## Estructura de ficheros propuesta

Nuevos:

frontend/src/
├── pages/
│   ├── AdminPage.tsx
│   ├── SecurityPage.tsx
│   ├── MaintenancePage.tsx
│   └── IncidentReportPage.tsx
├── components/
│   ├── IncidentReportModal.tsx   ← modal que reutilizan /trip e /incidents/new
│   ├── IncidentCategoryPicker.tsx
│   ├── TicketsTable.tsx
│   ├── AlertsTable.tsx
│   ├── RoleBadge.tsx
│   ├── RoleGuard.tsx
│   └── RoleLoginPanel.tsx         ← selector de rol en /login
├── services/
│   ├── tickets.ts
│   └── alerts.ts
└── types/
    └── incidents.ts                ← Ticket, Alert, IncidentCategory, Role

Modificados:

- `frontend/src/auth/types.ts` — extender `User` con `role`.
- `frontend/src/auth/AuthContext.tsx` — soportar login con rol arbitrario;
  persistir rol.
- `frontend/src/pages/LoginPage.tsx` — añadir `RoleLoginPanel`.
- `frontend/src/App.tsx` — rutas `/admin`, `/security`, `/maintenance`,
  `/incidents/new` protegidas con `RoleGuard`; redirección post-login
  según rol.
- `frontend/src/components/TopBar.tsx` — navegación condicional por rol,
  con `RoleBadge`.
- `frontend/src/pages/TripPage.tsx` — botón flotante "Reportar incidencia"
  que abre `IncidentReportModal` con la posición actual.
- `frontend/src/hooks/useTripRuntime.tsx` — al escalar a alerta,
  persistir en `senda.alerts` vía `services/alerts.ts`.
- `frontend/src/hooks/useRoutePlanner.tsx` — disparar reverse-geocoding
  al fijar endpoint por click; nuevos campos `originLabel`,
  `destinationLabel`.
- `frontend/src/components/AddressSearchInput.tsx` — mostrar el label
  geocodeado si viene del hook.
- `frontend/src/services/geocoding.ts` — añadir `reverseGeocode`.
- `frontend/src/i18n/locales/es.json` y `en.json` — todas las cadenas
  nuevas (incidencias, admin, security, maintenance, roles, login por
  rol).

## Restricciones

- No añadas dependencias nuevas.
- No uses librerías de tablas ni modales externos: Tailwind + JSX.
- Los botones de acción en las tablas deben tener mín. 44 px de
  dimensión táctil (RNF-09).
- Código en inglés, UI en ES/EN.

## Formato de entrega

Para cada fichero nuevo o modificado, devuelve la ruta completa como
título (`### frontend/src/pages/AdminPage.tsx`) y el contenido íntegro
en un bloque de código con la etiqueta del lenguaje.

Al final:

- `## Pasos para probarlo` cubriendo los cinco flujos: login por rol,
  reporte de incidencia desde `/trip`, reporte desde `/incidents/new`,
  gestión de tickets en `/admin`, recepción en `/security` y
  `/maintenance`, reverse-geocoding en `/routes`.
- `## Decisiones y notas para seguimiento_ia.md` con las decisiones,
  limitaciones conocidas y qué queda pendiente (tests, estadísticas,
  retención de datos).

Cuando estés listo, genera toda la iteración 4. **Asegúrate de incluir
todos los ficheros fundacionales (tipos, servicios, hooks) y no empezar
por los componentes asumiendo que los demás están resueltos, como pasó
en la iteración 3.**
```

**Contexto proporcionado.** Estado tras iter 3; decisión de tener selector de rol en `/login`, panel admin sin filtros y reporte desde dos puntos de acceso.

**Artefactos generados.**

- **Nuevos:** `types/incidents.ts`, `services/` (tickets, alerts), `components/` (RoleGuard, RoleBadge, RoleLoginPanel, IncidentCategoryPicker, IncidentReportModal, TicketsTable, AlertsTable), `pages/` (AdminPage, SecurityPage, MaintenancePage, IncidentReportPage).
- **Modificados:** `auth/`, `components/` (AddressSearchInput, TopBar), `hooks/` (useRoutePlanner, useTripRuntime), `services/geocoding.ts`, `pages/` (LoginPage, RouteRequestPage, TripPage), `App.tsx`, locales ES/EN.

**Evaluación.**

- **Correctas:** `RoleGuard` desacoplado de `ProtectedRoute`; redirección post-login por rol centralizada en `rolePath()`; persistencia idempotente de alertas desde `useTripRuntime`; reverse-geocoding con `AbortController` por endpoint; listas `<ul>/<li>` mejor que `<table>` en móvil.
- **Parciales:** RF-40 (agrupación automática) y RF-39 (ajuste de ISP por incidencia) no implementados.
- **Fallidas:** descripciones de pantallas incluían códigos del ERS como "(RF-38, RF-41 a RF-43)" en la UI; ligera discrepancia de tipos `triggeredAt: string` vs `number` (no bloqueó el build).
- **Correcciones:** eliminados sufijos "(RF-XX)" de 6 cadenas en ES/EN; **aviso 5** a Claude prohibiendo códigos ERS en la UI.

---

## Iteración 5 — Estadísticas, retención y tests

**Prompt empleado.**

```
# Iteración 5 — Estadísticas, retención de datos y tests unitarios

## Contexto

Estamos en la última iteración del prototipo evolutivo de Senda URJC.
Estado tras la iteración 4:

- Prototipo PWA completo con cuatro roles (persona usuaria, personal
  administrador, Servicio de Seguridad, Servicio de Mantenimiento).
- Funcionalmente cerrado: solicitud de ruta, «Voy contigo» con
  prealertas y escalado, reporte de incidencias, paneles de gestión
  con CRUD de tickets y alertas, reverse-geocoding, i18n ES/EN, PWA.
- Persistencia bajo `localStorage` namespace `senda.*`.

Esta iteración es la última y tiene tres bloques independientes y
limitados en alcance:

1. Pantalla `/stats` con agregados locales, solo para rol `admin`.
2. Retención automática de datos: purga en `localStorage` de entradas
   con antigüedad superior a 24 h (RNF-18).
3. Tests unitarios con Vitest de los servicios puros más críticos.

Recuerda las cinco instrucciones correctivas acumuladas:

- No uses `: JSX.Element` como tipo de retorno en los componentes.
- Si hay ficheros placeholder (binarios, imágenes), genera su contenido
  explícito o advierte claramente de que deben crearse a mano.
- Tipa explícitamente los parámetros de callbacks donde TypeScript no
  pueda inferirlos solo. El proyecto tiene `strict: true`.
- Layouts responsivos: da altura explícita al contenedor del elemento
  crítico en breakpoints pequeños; `flex-1` solo donde haya altura
  garantizada en el padre.
- Al generar iteraciones grandes, incluye TODOS los ficheros nuevos
  que los componentes importan (tipos, servicios, hooks) antes de
  volcar los componentes.
- Los códigos RF-XX, RNF-XX y CU-XX no deben aparecer en cadenas i18n,
  títulos de pantalla, descripciones, placeholders ni ningún texto
  visible por el usuario final. La trazabilidad con el ERS se mantiene
  solo en `seguimiento_ia.md` y comentarios de código.

## Objetivo detallado

### 5.1. Pantalla `/stats` (solo para rol `admin`)

Nueva ruta `/stats` protegida con `RoleGuard allowedRoles={['admin']}`.
Navegable desde un nuevo enlace "Estadísticas" en la TopBar cuando el
rol actual es `admin`. Requisitos:

- Título principal "Estadísticas" con subtítulo corto descriptivo.
- Cuatro tarjetas de KPIs en rejilla superior:
  - Tickets totales.
  - Tickets abiertos (status ≠ 'closed').
  - Alertas totales.
  - Alertas activas (status === 'active').
- Sección **Tickets por categoría**: gráfico de barras horizontales
  SVG inline (sin dependencias) con las cuatro categorías
  (lighting, feeling, obstacle, accessibility) y su recuento. Cada
  barra con el color corporativo de la categoría (los mismos tonos
  que usa el picker en la iteración 4).
- Sección **Tickets por estado**: donut chart SVG inline, sin
  dependencias, mostrando las cuatro estados. Leyenda lateral con
  los colores y porcentajes.
- Sección **Alertas por motivo**: lista con las cuatro razones
  (`pause`, `deviation`, `manual`, `timeout`) y su recuento, ordenada
  descendente.
- Sección **Actividad últimos 7 días**: mini-heatmap lineal (SVG
  inline) con la cantidad de tickets creados por día, desde hace
  7 días hasta hoy. Cada celda con intensidad de color según
  cantidad (blanco → rojo corporativo).
- Todas las cifras se calculan en tiempo real a partir de los hooks
  `useTickets` y `useAlerts`, no hay persistencia adicional.

Accesibilidad: los gráficos SVG deben tener `role="img"` + `aria-label`
descriptivo con el dato textual equivalente. Las secciones deben ser
navegables con teclado; ningún elemento interactivo sin `focus-visible`.

### 5.2. Retención automática de datos (RNF-18)

Nuevo servicio `frontend/src/services/retention.ts` con:

- Función `purgeExpiredData(maxAgeMs: number): void` que, para cada
  clave `senda.tickets` y `senda.alerts`, filtra las entradas cuyo
  `createdAt` / `triggeredAt` esté a más de `maxAgeMs` milisegundos
  del momento actual y reescribe el array.
- Constante exportada `RETENTION_MAX_AGE_MS = 24 * 60 * 60 * 1000`
  (24 horas según RNF-18).
- Hook de React `useDataRetention()` que llama a `purgeExpiredData`
  una vez al montar (equivalente a un `useEffect([], [])`) y luego
  repite cada hora.

El hook `useDataRetention()` se invoca una sola vez, desde el
`AuthProvider` (o desde `App.tsx` si es más cómodo), de modo que la
purga corra mientras la app esté viva. No dispara nada si no hay
datos caducados.

Importante: la purga también debe propagar el evento
`senda:storage` para que los hooks reactivos (`useTickets`,
`useAlerts`) se refresquen automáticamente.

En la pantalla `/profile`, añadir un texto informativo discreto en el
pie de la sección de contactos o umbrales: "Los historiales de
incidencias y alertas se conservan durante un máximo de 24 horas."
(y su traducción al inglés). Sin otra UI adicional.

### 5.3. Tests unitarios con Vitest

Instalación de Vitest y configuración mínima:

- Añadir `vitest` y `@types/node` como `devDependencies` en
  `package.json`.
- Nuevo `frontend/vitest.config.ts` con configuración mínima:
  entorno `jsdom`, globals activados, include
  `['src/**/*.test.ts']`.
- Script nuevo en `package.json`: `"test": "vitest run"` y
  `"test:watch": "vitest"`.

Suites de tests nuevos, todos en formato `[nombre].test.ts` junto al
fichero bajo test:

**`frontend/src/services/coverage.test.ts`**

- `haversineDistance` devuelve 0 para el mismo punto.
- `haversineDistance` devuelve valor esperado (± 1 m) entre dos
  puntos conocidos a ~500 m.
- `isWithinCoverage` acepta un punto en el centro de Móstoles.
- `isWithinCoverage` rechaza un punto en Sol (Madrid).
- `isWithinCoverage` acepta un punto justo a 499 m del centro de
  un campus; rechaza uno a 501 m.

**`frontend/src/services/routing.test.ts`**

- `calculateRoutes` devuelve exactamente 3 rutas.
- Todas las rutas tienen `waypoints.length >= 2`.
- Las tres rutas tienen distinto `label` (principal, alternative1,
  alternative2).
- `classifySafety(80)` devuelve 'high'; `classifySafety(50)`
  devuelve 'medium'; `classifySafety(20)` devuelve 'low'.
- Los umbrales 70 y 40 están en el lado correcto (≥70 es high,
  <70 y ≥40 es medium, <40 es low).

**`frontend/src/services/monitoring.test.ts`**

- `detectAnomaly` devuelve `null` cuando la posición está sobre la
  ruta y `pauseDurationSec` es pequeño.
- `detectAnomaly` devuelve `'pause'` cuando `pauseDurationSec`
  supera el umbral.
- `detectAnomaly` devuelve `'deviation'` cuando la posición está
  fuera de la ruta más allá del umbral.
- Si ambos disparan, tiene que devolver uno de los dos (documentar
  cuál gana y testarlo).

**`frontend/src/services/trip.test.ts`**

- `buildTripTrack` con una ruta de 2 puntos y 5 km/h devuelve un
  array de samples con `atSec` creciente desde 0.
- La duración total (último `atSec`) coincide aproximadamente con
  `distancia / velocidad` (± 2 s).
- Cada sample tiene un `point` con `lat` y `lng` definidos.

**`frontend/src/services/tickets.test.ts`**

Usar un mock ligero de `localStorage`:

beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  });
});

- `loadTickets` devuelve `[]` cuando no hay nada.
- `appendTicket` persiste el ticket y `loadTickets` lo recupera.
- `appendTicket` asigna `status: 'open'` y `createdAt` cercano al
  `Date.now()` actual.
- `assignTicket(id, 'security')` cambia el status a
  `'assigned_security'`.
- `assignTicket(id, 'maintenance')` cambia el status a
  `'assigned_maintenance'`.
- `closeTicket(id, 'nota')` cambia el status a `'closed'` y graba
  `resolutionNote: 'nota'`.
- Los tickets devueltos por `loadTickets` están ordenados por
  `createdAt` descendente.

**`frontend/src/services/alerts.test.ts`**

Similar a tickets:

- `loadAlerts` devuelve `[]` cuando no hay nada.
- `appendAlert` persiste con `status: 'active'` y `triggeredAt`
  reciente.
- `resolveAlert(id)` cambia el status a `'resolved'` y graba
  `resolvedAt`.
- El orden por `triggeredAt` descendente se respeta.

**`frontend/src/services/retention.test.ts`**

Con el mismo mock de `localStorage`:

- `purgeExpiredData` no modifica nada si no hay datos.
- `purgeExpiredData` respeta tickets / alertas recientes.
- `purgeExpiredData` elimina tickets con `createdAt < now - maxAge`.
- `purgeExpiredData` elimina alertas con `triggeredAt < now - maxAge`.
- Tras la purga, emite el evento `senda:storage`.

## Requisitos técnicos

- TypeScript estricto en los tests también.
- Ningún test depende de servicios remotos (ni Nominatim, ni OSRM).
- Ningún test fuerza el `Date.now()` real de modo que flake; usar
  `vi.useFakeTimers()` cuando haga falta deterministar la fecha.
- Los tests deben pasar limpiamente con `npm run test` en local
  sin configuración adicional más allá de `npm install`.

## Estructura de ficheros propuesta

Nuevos:

frontend/
├── vitest.config.ts
└── src/
    ├── pages/
    │   └── StatsPage.tsx
    ├── components/
    │   ├── KpiCard.tsx
    │   ├── CategoryBarChart.tsx
    │   ├── StatusDonut.tsx
    │   └── ActivityHeatmap.tsx
    └── services/
        ├── retention.ts
        ├── retention.test.ts
        ├── coverage.test.ts
        ├── routing.test.ts
        ├── monitoring.test.ts
        ├── trip.test.ts
        ├── tickets.test.ts
        └── alerts.test.ts

Modificados:

- `frontend/package.json` — scripts `test` y `test:watch`,
  `devDependencies` con `vitest`, `@vitest/ui` (opcional),
  `@types/node` y `jsdom`.
- `frontend/src/App.tsx` — ruta `/stats` dentro del grupo de
  `RoleGuard allowedRoles={['admin']}`.
- `frontend/src/components/TopBar.tsx` — añadir enlace a `/stats`
  en `NAV_BY_ROLE.admin`.
- `frontend/src/auth/AuthContext.tsx` — invocar `useDataRetention()`
  al inicializarse el provider (o desde `App.tsx`; elige lo más
  limpio).
- `frontend/src/pages/ProfilePage.tsx` — añadir nota informativa
  sobre el límite de retención de 24 h.
- `frontend/src/i18n/locales/es.json` y `en.json` — cadenas nuevas
  para la pantalla `/stats` (títulos de secciones, etiquetas de
  categorías, estados, motivos, leyendas) y para la nota de
  retención en `/profile`.

## Restricciones

- No añadas dependencias nuevas salvo Vitest, jsdom y `@types/node`.
- Los gráficos SVG deben generarse a mano; no uses recharts, d3,
  chart.js, etc.
- No uses librerías de testing adicionales (Testing Library, MSW,
  etc.). Vitest puro basta para lo que hay que probar aquí.
- Lenguaje del código en inglés, UI en ES/EN.

## Formato de entrega

Para cada fichero nuevo o modificado, devuelve la ruta completa como
título y el contenido íntegro. Al final:

- `## Pasos para probarlo` cubriendo: generar tickets de distintas
  categorías para poblar `/stats`, comprobar los cuatro gráficos,
  simular el paso de 24 h manipulando `createdAt` en `localStorage`
  para forzar la purga, ejecutar los tests con `npm run test`.
- `## Decisiones y notas para seguimiento_ia.md` con alcance,
  limitaciones conocidas y, como esta es la última iteración, una
  breve sección "Estado final del prototipo" que resuma cobertura
  ERS frente a lo no cubierto intencionadamente.

Cuando estés listo, genera toda la iteración 5. Sigue el orden:
servicios → tests → componentes de gráficos → página → modificaciones
de rutas/TopBar/ProfilePage → i18n. Asegúrate de incluir todos los
ficheros fundacionales al principio, como en la iteración 4.
```

**Contexto proporcionado.** Estado tras iter 4. Alcance acordado: tests solo sobre servicios puros; RF-39 y RF-40 fuera del alcance.

**Artefactos generados.**

- **Nuevos:** `services/retention.ts` + 7 ficheros de tests (`coverage`, `routing`, `monitoring`, `trip`, `tickets`, `alerts`, `retention`), `vitest.config.ts`, `pages/StatsPage.tsx`, `components/` (KpiCard, CategoryBarChart, StatusDonut, ActivityHeatmap).
- **Modificados:** `App.tsx`, `TopBar.tsx`, `ProfilePage.tsx`, locales ES/EN, `package.json` (scripts `test`/`test:watch`, deps `vitest` y `jsdom`).

**Evaluación.**

- **Correctas:** 44 tests en verde al primer intento en ~3,4 s; gráficos SVG inline sin librerías; `purgeExpiredData` idempotente; **ninguna corrección enviada a Claude** (los 5 avisos previos se respetaron íntegramente).
- **Parciales:** agregados solo del cliente; sin filtros de rango temporal ni de campus; purga solo corre con la app abierta.
- **Fallidas (problemas de integración, no de Claude):** (1) **BOM UTF-8** añadido por VS Code a varios ficheros nuevos, provocando TS1192 «no default export». (2) `RoleLoginPanel` en rejilla 2×2 desbordaba con textos largos en español ("Personal administrador", "Servicio de Mantenimiento").
- **Correcciones:** script PowerShell que reescribe `src/**/*.{ts,tsx}` en UTF-8 sin BOM más `.vscode/settings.json` con `"files.encoding": "utf8"`; rejilla 2×2 sustituida por lista vertical de una columna en `RoleLoginPanel`. Problemas locales, sin nuevo aviso global a Claude.

---

## Resumen de avisos correctivos acumulados

Cada aviso se envió a Claude como instrucción permanente dentro del mismo hilo del proyecto, de modo que las iteraciones siguientes lo respetaran sin repetirlo.

| #   | Origen | Regla establecida                                                                                                                           |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Iter 1 | No usar `: JSX.Element` como tipo de retorno (React 19 no expone el namespace JSX global).                                                  |
| 2   | Iter 1 | Generar siempre contenido real de ficheros binarios o advertir explícitamente de los placeholders.                                          |
| 3   | Iter 2 | Altura explícita en contenedores de mapa en móvil/tablet; callbacks tipados con `strict: true`; ERS es v8.0.                                |
| 4   | Iter 3 | En iteraciones grandes, incluir todos los ficheros fundacionales (tipos, servicios, hooks) antes de los componentes.                        |
| 5   | Iter 4 | Los códigos del ERS (RF-XX, RNF-XX, CU-XX) no deben aparecer en la UI; la trazabilidad vive en este seguimiento y en comentarios de código. |

## Estado final del prototipo

**Cobertura del ERS.** Cubiertos total o parcialmente: RF-01 (SSO mockeado), RF-02 a RF-06, RF-13 a RF-15, RF-19 a RF-33, RF-37, RF-38, RF-41 a RF-52; RNF-09, RNF-10, RNF-17 (parcial), RNF-18, RNF-20, RNF-21, RNF-29, RNF-30; CU-01 a CU-04, CU-06 a CU-13, CU-18 a CU-24.

**Fuera de alcance (por diseño).** Integración real con LumenSmart (RF-08 a RF-12, RF-16 a RF-18, RNF-01 a RNF-07), emparejamiento completo de voluntariado (RF-34 a RF-36), RF-39, RF-40, cumplimiento legal/disponibilidad 24/7 (RNF-22, RNF-24, RNF-26 a RNF-28) y empaquetado iOS nativo.

**Métricas.** ~5.800 líneas TS/TSX, ~1.200 líneas JSON (i18n), ~170 líneas CSS, ~55 ficheros fuente. 7 suites Vitest con 44 tests en ~3,4 s. Bundle de producción 564 kB (167 kB gzip). 5 commits principales, uno por iteración.
