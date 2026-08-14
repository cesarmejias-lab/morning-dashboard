# Diseño Utilidad Matinal: Veredicto Meteorológico y Todoist

Fecha: 2026-08-14
Proyecto: Morning Dashboard
Estado: diseño conversacional aprobado; pendiente revisión de spec

## Resumen

Convertir la banda superior del dashboard de decorativa en operativa, con dos cambios que no aumentan el número de tarjetas:

1. **Veredicto meteorológico**: la tarjeta Weather pasa de mostrar números a responder una pregunta concreta ("¿me llevo paraguas y a qué hora llueve?"). El dato ya se está descargando; falta interpretarlo.
2. **Tarjeta Todoist (solo lectura)**: las tareas vencidas y de hoy, leídas directamente desde la API de Todoist en el navegador, ocupando el hueco que deja Exchange Rates.

Ambos cambios respetan el modelo estático/PWA: sin backend, sin secretos en el repositorio y sin datos personales fuera del navegador.

Este diseño es la primera porción de un conjunto mayor identificado en la conversación previa (agenda, tráfico, prensa, tareas). Las otras piezas quedan explícitamente fuera y tendrán su propio ciclo de diseño.

## Objetivos

- Que la primera fila del dashboard responda preguntas de decisión matinal, no solo muestre medidas.
- Responder "¿paraguas?" con un umbral explicable y con la ventana horaria concreta.
- Mostrar las tareas vencidas y de hoy sin salir del dashboard.
- Mantener el token de Todoist exclusivamente en el navegador del usuario.
- No aumentar la altura de la página: el veredicto es una línea dentro de Weather y Todoist reutiliza el hueco de Rates.
- Mantener la lógica nueva en módulos puros y testables, siguiendo el patrón de `clz-radar.js`.

## No Objetivos

- No escribir en Todoist. La tarjeta no puede completar, crear, modificar ni borrar tareas.
- No añadir agenda (ICS), tráfico ni prensa. Son piezas separadas con su propio diseño.
- No introducir backend, proxy ni GitHub Actions para datos personales.
- No commitear nunca tareas ni token al repositorio, que es público.
- No cachear respuestas de Todoist en disco (Cache Storage) ni ofrecer tareas offline.
- No sustituir el bloque actual de condiciones y previsión a 5 días de Weather: el veredicto se añade encima.
- No reordenar el resto de la parrilla ni tocar las tarjetas de música, relojes o Hacker News.

## Estado Actual

El dashboard es una app estática (`index.html`, `styles.css`, `dashboard.js`, `clz-radar.js`, `sw.js`) servida desde GitHub Pages, con `server.js` para desarrollo local.

La parrilla tiene siete tarjetas, en este orden: Weather, World Clocks, Exchange Rates, Inspiration, Daily Collection Radar, Discogs Daily Record y Top Hacker News. Las cuatro primeras forman la banda superior; las tres últimas son a ancho completo.

`fetchWeather()` ya solicita a Open-Meteo, por cada ciudad configurada:

```text
current = temperature_2m, apparent_temperature, weathercode, windspeed_10m, relativehumidity_2m
daily   = weathercode, temperature_2m_max, temperature_2m_min, precipitation_probability_max
forecast_days = 5
```

Es decir, la probabilidad de precipitación diaria **ya está disponible en el navegador**; lo que falta es la resolución horaria para localizar la ventana de lluvia, y el amanecer/atardecer.

`refresh()` lanza cada fuente de forma independiente con su propio manejo de error, de modo que el fallo de una tarjeta no afecta al resto.

`dashboard.js` concentra casi toda la lógica del navegador (unas 1.030 líneas) y ya expone helpers reutilizables: `byId`, `escapeHtml`, `safeUrl`, `setCardMessage`, `readStoredJson` y el objeto `STORAGE` con las claves de `localStorage`.

`clz-radar.js` establece la convención del proyecto para lógica pura: un módulo con doble export (CommonJS cuando existe `module.exports`, global `CLZRadar` en navegador), consumido por `dashboard.js` mediante `getCLZRadarApi()` y cubierto por pruebas con `node:test` en `tests/`.

`sw.js` clasifica cada petición en tres estrategias: red primero para APIs y para el app shell (`index.html`, `dashboard.js`, `styles.css`), y caché primero con revalidación en segundo plano para el resto.

## Hallazgos Verificados

Comprobado el 2026-08-14 mediante peticiones directas:

- `OPTIONS https://api.todoist.com/api/v1/tasks` con `Origin: https://cesarmejias-lab.github.io` responde `200` e incluye `Access-Control-Allow-Origin` con ese mismo origen, `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS` y `Access-Control-Allow-Headers: Authorization,Content-Type`. **La API es llamable desde el navegador sin proxy.**
- `GET` sin token responde `401`, como corresponde.
- La API REST v2 (`https://api.todoist.com/rest/v2/...`) responde **`410 Gone`** tanto en `/tasks` como en `/projects`. Está retirada: cualquier documentación o ejemplo que la use ya no es válido.

No verificado, y por tanto a confirmar durante la implementación:

- El esquema exacto de la respuesta de `/api/v1/tasks`.
- Si la v1 admite filtrado en servidor (equivalente al `filter=today` de la v2) y con qué sintaxis.
- El comportamiento de paginación.

## Experiencia De Usuario

### Veredicto meteorológico

Sobre el bloque de condiciones actuales aparece una única línea que responde a la pregunta del día. Dos formas según haya lluvia prevista o no:

```text
☂ Paraguas: sí — 70% entre las 17h y las 20h · sensación máx 24° · anochece 21:34
Sin lluvia hoy · sensación máx 31° · anochece 21:34
```

Reglas de presentación:

- El veredicto corresponde a la ciudad de la pestaña activa y solo al día de hoy.
- Tres estados de paraguas: `sí` (probabilidad ≥ 50%), `quizá` (30-49%) y `no` (< 30%).
- La ventana horaria es la primera racha contigua de horas con probabilidad sobre umbral, contada **desde la hora actual** hasta el fin del día local. A las 08:00 no interesa que haya llovido a las 03:00.
- Si no queda ninguna ventana en lo que resta del día, se muestra el estado sin ventana.
- El bloque existente de condiciones actuales y previsión a 5 días se mantiene intacto debajo.

### Tarjeta Todoist

Ocupa la posición que hoy tiene Exchange Rates, en la banda superior.

Con token configurado, la tarjeta muestra una cabecera de resumen y la lista de tareas:

```text
Tareas — 2 atrasadas · 5 para hoy

[!] Contestar requerimiento          Asuntos      vencía ayer
[!] Revisar contrato marco           Asuntos      09:30
    Llamar al notario                Personal     12:00
```

Reglas de presentación:

- Primero las vencidas, después las de hoy.
- Dentro de cada grupo: por hora de vencimiento si la tienen y, a igualdad, por prioridad descendente.
- La prioridad se refleja con color, no con texto.
- El proyecto se muestra si está disponible; si no, se omite en lugar de mostrar una etiqueta vacía.
- Sin tareas: mensaje afirmativo breve ("Nada pendiente para hoy"), no una tarjeta vacía.
- No hay ningún control capaz de modificar Todoist.

Sin token configurado, la tarjeta muestra un estado de **configuración, no de error**, siguiendo el patrón visual de `renderCLZSetup()` y `renderDiscogsSetup()`: explicación breve, campo `type="password"` para pegar el token, botón de guardar y enlace a la página de Todoist donde se obtiene.

## Contrato De Datos

### Open-Meteo

Se amplía la petición existente con dos añadidos:

```text
daily  += sunrise, sunset, apparent_temperature_max, apparent_temperature_min
hourly  = precipitation_probability
```

El resto de parámetros no cambia. `forecast_days=5` se mantiene.

`apparent_temperature_max` y `apparent_temperature_min` son necesarios porque la petición actual solo pide `apparent_temperature` dentro de `current`: la sensación térmica máxima y mínima del día no se pueden derivar de lo que ya se descarga.

### Veredicto

`buildVerdict()` produce una estructura plana, sin HTML:

```json
{
  "umbrella": "yes | maybe | no",
  "maxProbability": 0,
  "window": { "from": "17:00", "to": "20:00" },
  "sunrise": "07:21",
  "sunset": "21:34",
  "feelsLike": { "max": 0, "min": 0 },
  "degraded": false
}
```

`window` es `null` cuando no hay racha sobre umbral en lo que resta del día. `degraded` se marca `true` cuando falta la serie horaria y el veredicto se ha derivado solo de `precipitation_probability_max`; en ese caso `window` es siempre `null`.

### Todoist

Del payload de la API solo se consumen los campos necesarios, tolerando ausencias:

```json
{
  "id": "string",
  "content": "string",
  "due": { "date": "YYYY-MM-DD", "datetime": "ISO date string | null" },
  "priority": 1,
  "project_id": "string | null",
  "url": "string | null"
}
```

Toda tarea sin `due` se descarta: la tarjeta trata de hoy y de lo vencido. Los campos que falten se omiten en el render en lugar de mostrarse vacíos. El esquema real se confirmará contra la documentación durante la implementación; si difiere, se ajusta el normalizador y no el resto del código.

## Arquitectura

Se añaden dos módulos de lógica pura que siguen el patrón de doble export de `clz-radar.js`, cargados en `index.html` antes de `dashboard.js`:

**`weather-verdict.js`** expone `WeatherVerdict` con:

- `buildVerdict({ data, now, thresholds })`: recibe la respuesta cruda de Open-Meteo y devuelve el contrato de veredicto. Sin DOM, sin red, sin reloj implícito (`now` se inyecta).
- `formatVerdict(verdict)`: convierte el veredicto en las partes de texto que el renderizador coloca en la línea.

**`todoist.js`** expone `TodoistTasks` con:

- `normalizeTask(raw)`: proyecta el payload crudo al contrato mínimo, devolviendo `null` si la tarea no es utilizable.
- `partitionTasks(tasks, todayISO)`: separa en `{ overdue, dueToday }` descartando lo que no vence. El parámetro es una fecha `YYYY-MM-DD`; las claves del resultado son listas.
- `sortForMorning(group)`: ordena por hora y prioridad.

En `dashboard.js` se añade únicamente la capa de red y render:

- `fetchTodoistTasks()`: lee el token de `localStorage`, llama a la API y delega la interpretación en `TodoistTasks`.
- `renderTodoistCard(groups)` y `renderTodoistSetup()`.
- `saveTodoistToken()`, enlazado desde `bindEvents()` con el patrón `data-action` ya existente.
- `STORAGE.todoistToken = 'morning_dashboard_todoist_token'`.
- En `renderWeather()`, la línea de veredicto se inserta antes del bloque de condiciones actuales.

Se retira Exchange Rates: la tarjeta de `index.html`, las funciones `fetchRates()`, `renderRates()` y `renderRatesSkeleton()`, su llamada en `refresh()` y la entrada `frankfurter.dev` de la lista de APIs de `sw.js`.

La razón de mantener la lógica en módulos aparte y no dentro de `dashboard.js` es doble: `dashboard.js` ya está en el límite de tamaño manejable, y la lógica de umbrales y particiones es exactamente lo que conviene probar sin navegador.

## Seguridad Y Privacidad

El repositorio es público y el dashboard se sirve desde GitHub Pages. De ahí las siguientes decisiones, que son parte del diseño y no detalles de implementación:

- El token de Todoist vive **solo** en `localStorage`. No se commitea, no viaja a GitHub Actions y no se envía a ningún sitio que no sea `api.todoist.com`.
- El token de Todoist es de larga duración y concede acceso completo de lectura y escritura a la cuenta. Todoist no permite OAuth sin `client_secret`, lo que exigiría un servidor, así que no hay alternativa de menor alcance en un sitio estático. La mitigación disponible es limitar el uso a lectura y poder revocarlo: Todoist → Ajustes → Integraciones → Developer, regenerar el token. La spec asume este riesgo de forma explícita.
- El campo del token es `type="password"` y su valor **nunca se vuelve a renderizar** en la página una vez guardado.
- Todo el contenido de tarea pasa por `escapeHtml()` y todo enlace por `safeUrl()`, usando los helpers existentes. El contenido de las tareas es texto libre y se inyecta vía `innerHTML` como el resto de la interfaz.
- `api.todoist.com` **se excluye del service worker**: el manejador de `fetch` retorna sin interceptar. Dos motivos independientes. Primero, con las reglas actuales la petición no encaja en la lista de APIs ni en el app shell, por lo que caería en caché primero y mostraría tareas rancias, que es precisamente el fallo corregido en este mismo repositorio el 2026-08-14. Segundo, no interesa dejar el contenido de las tareas en texto claro en Cache Storage. El coste aceptado es que no hay tareas sin conexión.

## Errores Y Fallbacks

Veredicto meteorológico:

- Sin serie horaria en la respuesta: se deriva el estado de `precipitation_probability_max`, se marca `degraded` y se omite la ventana.
- Sin `sunrise`/`sunset`: se omiten esos fragmentos de la línea; el resto se muestra.
- Error de la petición de Weather: se mantiene el comportamiento actual de la tarjeta. El veredicto no introduce un modo de fallo nuevo, porque se calcula sobre datos ya descargados.
- El veredicto nunca debe impedir que se pinten las condiciones actuales: si `buildVerdict()` lanzara, se omite la línea y se registra en consola.

Todoist:

- Sin token: estado de configuración, no error.
- `401`: mensaje explicando que el token no es válido o ha sido revocado, con acceso al campo para reintroducirlo. No se borra el token automáticamente.
- `403` y `429`: mensaje diferenciado indicando permiso insuficiente o exceso de peticiones; en `429` se invita a reintentar más tarde sin reintento automático.
- Fallo de red: mensaje de que no se han podido cargar las tareas. Sin caché de respaldo, por decisión de privacidad.
- Respuesta con forma inesperada: las tareas no normalizables se descartan y la tarjeta muestra las válidas. Si ninguna lo es, se informa de respuesta no reconocida en lugar de mostrar una lista vacía engañosa.
- `localStorage` no disponible: la tarjeta funciona en modo configuración durante la sesión, sin persistir.
- Cualquier fallo queda contenido en su tarjeta: `refresh()` mantiene una promesa y un `catch` por fuente.

## Pruebas

`npm test` (`node --test tests/*.test.js`) sigue siendo la puerta, y `npm run check` la validación de sintaxis. `npm run check` debe actualizarse para incluir los dos módulos nuevos.

`tests/weather-verdict.test.js`:

- Los tres umbrales de paraguas, incluidos los bordes exactos 30 y 50.
- Detección de la primera racha contigua sobre umbral.
- Racha que ya ha pasado respecto a `now`: no debe reportarse.
- Racha que llega hasta el fin del día.
- Ausencia de serie horaria: `degraded` a `true` y `window` a `null`.
- Ausencia de `sunrise`/`sunset`.
- Probabilidades nulas o no numéricas intercaladas en la serie.

`tests/todoist.test.js`:

- Partición en vencidas y de hoy respecto a una fecha fija.
- Tareas sin `due` descartadas.
- Tareas futuras excluidas.
- Orden por hora y desempate por prioridad.
- Lista vacía.
- Payload con campos ausentes o tipos inesperados: `normalizeTask` devuelve `null` sin lanzar.

Ambos módulos son puros y reciben `now`/`today` inyectados, de modo que las pruebas no dependen del reloj del sistema ni de la zona horaria de la máquina.

Verificación manual en navegador, porque las pruebas no tocan red ni DOM: estado sin token, token inválido (`401`), token válido con tareas, token válido sin tareas, y comprobación en DevTools de que no existe entrada de `api.todoist.com` en Cache Storage.

## Notas De Implementación

Orden sugerido, cada paso verificable de forma independiente:

1. Retirar Exchange Rates (tarjeta, funciones, llamada en `refresh()`, entrada en `sw.js`), dejando el hueco en la parrilla.
2. Crear `weather-verdict.js` con sus pruebas, antes de tocar el render.
3. Ampliar la URL de Open-Meteo y renderizar la línea de veredicto.
4. Crear `todoist.js` con sus pruebas, sin red.
5. Añadir la exclusión de `api.todoist.com` en `sw.js` y subir la versión de `CACHE_NAME`.
6. Añadir capa de red, estado de configuración y render de la tarjeta Todoist.
7. Verificación manual del listado anterior y revisión de que la altura de la página no ha crecido.

El paso 5 debe ir antes del 6: si se implementa la tarjeta con el service worker aún interceptando, el primer resultado quedará cacheado y el diagnóstico se vuelve confuso.

Al tocar `sw.js` hay que subir `CACHE_NAME` para que la caché anterior se purgue, y recordar que el navegador necesita una recarga adicional para activar el service worker nuevo.

## Riesgos Abiertos

- El esquema de respuesta y el filtrado de la API v1 de Todoist no están verificados. Si no hay filtro en servidor, se filtra por `due.date` en cliente; si la colección de tareas fuese grande, habría que revisar paginación. Es el único punto del diseño que puede obligar a ajustar el contrato de datos.
- La v2 retirada (`410 Gone`) implica que buena parte de los ejemplos públicos y de la memoria de herramientas sobre Todoist están obsoletos. Conviene confirmar cada endpoint contra la documentación vigente antes de escribir código.
- El token de acceso total en `localStorage` es un riesgo aceptado, no resuelto. Cualquier futura inyección de HTML sin escapar en el dashboard lo convierte en fuga de credencial.
- `dashboard.js` sigue creciendo. Este diseño lo contiene sacando la lógica a módulos, pero la capa de render sigue concentrada y en algún momento pedirá una separación por tarjetas.
- El umbral del 50% para el paraguas es un juicio, no un dato. Puede necesitar ajuste tras unos días de uso real; por eso `buildVerdict()` recibe los umbrales como parámetro.
