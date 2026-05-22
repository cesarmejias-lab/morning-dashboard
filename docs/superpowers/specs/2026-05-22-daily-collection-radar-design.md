# Diseno Daily Collection Radar

Fecha: 2026-05-22
Proyecto: Morning Dashboard
Estado: diseno conversacional aprobado; pendiente revision de spec

## Resumen

Reemplazar la tarjeta actual "CLZ Music Recommendation" por "Daily Collection Radar": un modulo musical matinal que mantiene un album como protagonista y anade unas pocas senales utiles sobre la coleccion. La experiencia debe sentirse como un curador diario de la coleccion CLZ propia, no como un selector aleatorio de discos.

La mejora depende de evolucionar `music-collection.json` con metadata opcional. El dashboard debe seguir funcionando cuando solo existan los campos basicos actuales.

## Objetivos

- Hacer que el modulo CLZ sea mas util para descubrimiento, redescubrimiento y lectura de coleccion.
- Mantener la recomendacion como foco visual y de interaccion.
- Anadir inteligencia ligera de coleccion: generos poco vistos, discos anadidos hace tiempo, formatos o ediciones interesantes, cobertura por decadas y calidad de metadata.
- Enriquecer el sync de CLZ cuando las paginas publicas expongan mas detalle, sin inventar metadata.
- Preservar el modelo estatico/PWA y el flujo actual de sincronizacion con GitHub Actions.

## No Objetivos

- No requerir credenciales privadas de CLZ ni almacenar tokens en el dashboard.
- No reemplazar la tarjeta actual de Discogs.
- No anadir un backend mas alla de los archivos estaticos y el script de sync existente.
- No inferir genero, mood o edicion desde artista/titulo cuando CLZ no exponga esos datos.
- No hacer que la implementacion dependa de tener metadata perfecta en toda la coleccion.

## Estado Actual

El dashboard es una app estatica servida desde `index.html`, `styles.css`, `dashboard.js` y `server.js`. Los datos musicales se generan en `music-collection.json` mediante `sync-collection.js` y se refrescan con `refresh-clz.js` o el workflow de GitHub Actions.

El JSON actual mantiene esta forma de alto nivel:

```json
{
  "username": "cesarmejias",
  "syncedAt": "ISO date string",
  "total": 5105,
  "albums": []
}
```

La tarjeta CLZ actual:

- carga `music-collection.json`;
- escoge un album aleatorio;
- muestra portada, titulo, artista, ano, total de releases y enlaces de accion;
- soporta Roll, Sync CLZ, busqueda en Spotify, busqueda en YouTube y enlaces a CLZ.

Este diseno evoluciona esa superficie sin reemplazar todo el dashboard.

## Experiencia De Usuario

La tarjeta pasa a llamarse "Daily Collection Radar". El contenido principal sigue siendo una recomendacion de un album con portada, titulo, artista, ano y detalles de formato/edicion cuando existan.

La tarjeta debe mostrar una razon breve y humana, por ejemplo:

- "Un disco de jazz que no ha salido por aqui recientemente."
- "Elegido desde una esquina poco visible de los noventa."
- "Una edicion en CD de un formato que aparece poco en la rotacion matinal."

El area de radar debe ser compacta: dos o tres senales pequenas, no un informe. Buenas senales incluyen:

- genero o estilo poco representado en recomendaciones recientes;
- album anadido hace bastante tiempo;
- formato o edicion interesante;
- decada o zona de coleccion que no aparece a menudo;
- nota de calidad de metadata cuando el enriquecimiento sea incompleto.

Las acciones se mantienen ligeras:

- Roll para otra recomendacion;
- Sync CLZ para abrir el workflow actual de GitHub Actions;
- View on CLZ;
- buscar en Spotify;
- buscar en YouTube.

Un boton separado "Why this?" queda como opcional. La primera opcion debe ser mostrar una razon clara en linea antes de anadir otro control.

## Contrato De Datos

`music-collection.json` debe conservar los campos superiores actuales: `username`, `syncedAt`, `total` y `albums`.

Cada album debe seguir siendo compatible con los campos basicos actuales:

```json
{
  "id": "string",
  "title": "string",
  "artist": "string",
  "year": "string | number | null",
  "cover": "string | null"
}
```

Los campos enriquecidos opcionales por album son:

```json
{
  "genres": ["string"],
  "styles": ["string"],
  "moods": ["string"],
  "format": "string | null",
  "edition": "string | null",
  "addedAt": "ISO date string | null",
  "metadataQuality": {
    "level": "basic | partial | enriched",
    "missing": ["string"]
  }
}
```

El payload tambien puede incluir un resumen superior generado durante el sync:

```json
{
  "summary": {
    "genres": [{ "name": "string", "count": 0 }],
    "styles": [{ "name": "string", "count": 0 }],
    "formats": [{ "name": "string", "count": 0 }],
    "decades": [{ "name": "string", "count": 0 }],
    "metadataQuality": {
      "basic": 0,
      "partial": 0,
      "enriched": 0
    }
  }
}
```

Todos los campos nuevos son opcionales. El dashboard debe tratar valores ausentes como desconocidos, no como errores.

## Arquitectura De Sync

`sync-collection.js` debe separarse en responsabilidades mas claras a medida que crezca el enriquecimiento:

- crawler principal: inicializa la sesion publica de CLZ y coordina las peticiones;
- extractor de listado: lee la coleccion paginada y produce registros basicos;
- extractor de detalle: consulta paginas de detalle solo cuando haga falta y extrae metadata expuesta;
- normalizador: convierte datos crudos de CLZ al contrato JSON estable;
- generador de resumen: produce agregados y metricas de calidad;
- writer: compara payloads y escribe `music-collection.json` solo cuando cambia el contenido.

El sync debe usar throttling y concurrencia limitada al pedir paginas de detalle. La coleccion tiene mas de 5.000 albumes, asi que el enriquecimiento debe evitar peticiones agresivas y, cuando sea practico, usar cache o reanudacion.

Si CLZ solo expone datos de listado para un album, el sync debe escribir un registro basico valido y, si se emite `metadataQuality`, marcar `level = "basic"`. Si parte del enriquecimiento funciona, debe marcar `partial` o `enriched` segun los campos realmente presentes.

## Arquitectura Del Dashboard

El lado del dashboard debe separar la feature CLZ en unidades pequenas, aunque inicialmente vivan dentro de `dashboard.js`:

- collection loader: carga y valida `music-collection.json`;
- recommendation engine: elige un album usando factores ponderados;
- reason generator: convierte los factores elegidos en una explicacion humana;
- radar signal builder: escoge dos o tres senales compactas de coleccion;
- history store: guarda un historial local pequeno en `localStorage`;
- renderer: pinta Daily Collection Radar en la region actual de la tarjeta CLZ.

El renderer debe degradar correctamente. Con datos basicos, la tarjeta sigue recomendando un disco y mostrando las acciones actuales. Con datos enriquecidos, anade formato, edicion, tags, razones y senales de radar.

## Logica De Recomendacion

La recomendacion debe ser ponderada, no puramente aleatoria. El scoring de candidatos puede combinar:

- variedad: evitar artistas y discos vistos recientemente;
- redescubrimiento: favorecer discos anadidos hace tiempo o zonas de coleccion poco vistas;
- vibra musical: usar genero, estilo o mood cuando existan;
- interes de coleccion: favorecer formatos, ediciones, decadas o categorias poco frecuentes;
- azar de respaldo: mantener frescura cuando haya poca metadata.

El detalle del scoring debe quedarse interno. La UI debe mostrar una razon simple que una persona entienda.

El historial local debe ser pequeno:

- usar `localStorage`;
- guardar IDs de album, artistas, timestamps y senales de genero/estilo mostradas;
- expirar o ignorar entradas antiguas despues de una ventana razonable;
- no bloquear la recomendacion si el almacenamiento no esta disponible.

## Errores Y Fallbacks

- Si falta `music-collection.json` o esta vacio, mantener el estado actual de setup/error con Sync CLZ y enlaces a CLZ.
- Si faltan campos enriquecidos, ocultar esos elementos en vez de mostrar etiquetas vacias.
- Si falla el enriquecimiento de detalle en algunos albumes, conservar registros basicos y reflejar la calidad en el resumen JSON.
- Si todos los candidatos aparecen como recientes, relajar las reglas de historial antes de fallar.
- Si `localStorage` falla o esta deshabilitado, continuar con una recomendacion en memoria para la carga actual.
- Si CLZ cambia el markup, el extractor de detalle debe fallar sin romper el extractor de listado.

## Pruebas

Usar `npm run check` como validacion base de sintaxis.

Anadir pruebas o fixtures enfocados cuando sea practico para:

- normalizar registros CLZ basicos, parciales y enriquecidos;
- calcular calidad de metadata;
- puntuar recomendaciones con y sin campos enriquecidos;
- generar textos de razon con fallback;
- filtrar historial;
- renderizar sin campos opcionales.

Si el proyecto aun no tiene test runner, la planificacion de implementacion debe decidir si conviene anadir un script pequeno de Node o mantener la primera pasada en funciones puras y verificacion manual en navegador.

## Notas De Implementacion

Implementar en pasos:

1. Introducir contrato de datos y normalizador conservando la salida actual.
2. Anadir extraccion enriquecida con fallbacks y throttling.
3. Anadir resumen de coleccion a `music-collection.json`.
4. Refactorizar lo justo la logica CLZ del dashboard para soportar recomendacion, razones, senales de radar e historial.
5. Cambiar el copy de la tarjeta y renderizar detalles enriquecidos cuando existan.
6. Verificar render estatico, PWA, flujo de sync y comportamiento con datos degradados.

La primera implementacion debe priorizar una experiencia degradada fiable sobre un enriquecimiento perfecto pero fragil.

## Riesgos Abiertos

- Las paginas de detalle de CLZ pueden no exponer publicamente toda la metadata deseada.
- Enriquecer miles de albumes puede hacer lento el sync si no hay throttling y cache.
- La logica actual del dashboard esta concentrada en `dashboard.js`, asi que los cambios deben ser acotados para evitar regresiones no relacionadas.
- La cobertura de metadata puede ser irregular, y la UI debe hacer que los datos incompletos se sientan intencionales en vez de rotos.
