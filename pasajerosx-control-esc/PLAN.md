# Plan: Integración de Planillas (PasajerosX -> ControlESC)

Carpeta de trabajo: `pasajerosx-control-esc/`
Referencias copiadas en: `pasajerosx-control-esc/referencias/`

Este documento consolida la exploración de PasajerosX y el plan de integración en ControlESC.
Cada bloque (A-K) puede ser ejecutado por un subagente independiente.

---

## A. Análisis de base de datos (`bd/pasajerosx/planillas.sql`)

**Tablas relevantes**

- `flota`
  - `placa`, `propietario`, `conductor1`, `licencia1`, `conductor2`, `licencia2`, `nombre_planilla`
  - No tiene PK/AUTO_INCREMENT en el dump.
  - Relación lógica: `flota.nombre_planilla` ↔ `planilla.nombre`.

- `planilla`
  - `id`, `nombre`, `tipo`, `numeroAsiento` (INSERT usa `numAs`), `posX`, `posY`, `estado`
  - No tiene PK/AUTO_INCREMENT en el dump (ids hardcodeados).
  - `estado` = 0 en todas las filas.

**Datos**
- 6 planillas: LEITO, SEMI CAMA - LEITO, LEITO - SEMI CAMA, LEITO 43, LEITO 41, LEITO 40.
- IDs originales: 3756 a 4131.
- En ControlESC los IDs deben renumerarse desde 1.
- Elementos por planilla: 48 a 63 filas; asientos: 40 a 53.
- Tipos de elemento: `asiento`, `puerta`, `tv`, `baño`, `2do piso`.

**Decisión**
- Crear tabla local `planilla` con `id` AUTO_INCREMENT.
- Mapear cada elemento con `nombre` de planilla.
- No copiar el id original; dejar que MySQL genere nuevos ids desde 1.

---

## B. Endpoints de PasajerosX

Rutas base: `C:\xampp\htdocs\pasajerosx`

- `php/planillas/getAllBus.php`
  - GET, sin parámetros.
  - Devuelve nombres distintos de planilla ordenados por `nombre`.

- `php/common/getBus.php`
  - GET `?nombre=<planilla>` (también soporta `?placa=` vía `flota`).
  - Devuelve filas de `planilla` para esa planilla.

- `php/planillas/eliminarBus.php`
  - POST form-urlencoded `nombre=<planilla>`.
  - Elimina todas las filas de esa planilla.

- `php/asientos/saveBus.php`
  - POST JSON:
    ```json
    {
      "nombreBus": "string",
      "elementos": [
        {"tipo":"asiento|puerta|baño|tv|2do piso","numAs":"number o x","posX":"10px","posY":"10px"}
      ],
      "operacion": "n|e|c",
      "nombreOriginal": "string o null"
    }
    ```
  - `n`: crea nueva planilla.
  - `e`: elimina la planilla original y reinserta con el nuevo nombre si cambió.
  - `c`: copia la planilla con nuevo nombre.

**Decisión**
- Portar la lógica a endpoints PHP de ControlESC bajo `php/api/store/planilla*` y `php/api/get/planilla*`.
- Mantener el mismo contrato JSON para facilitar el diagramador.

---

## C. HTML y CSS de PasajerosX

Archivos de referencia:
- `referencias/html/planillas.html`
- `referencias/css/planillas.css`
- `referencias/css/layout2.css`
- `referencias/css/asientos.css`

**Layout**
- Página completa (`body` 100vh) con fondo `img/f1.jpg` (blur).
- `header`: logo + título/fecha/hora.
- `main`: sidebar `#botones` + área `#lista` scrollable.
- `layout2.css` sobrescribe a estilo plano (header blanco, sidebar 256px, lista blanca).

**Clases clave**
- `.bus-container` (440px), `.bus` (440x700, gris, rounded, overflow hidden).
- `.busButt` fila de 3 botones.
- `.asiento` 40x40 verde; estados `.asOcu` (rojo), `.asLib` (verde), `.asPos` (morado).
- Extras: `.extra` con `.elePue`, `.eleBan`, `.eleTv`, `.ele2` e imágenes `puerta.png`, `bath.png`, `tv.png`, `2do.png`.
- Botones: `#crear` (morado), `#back` (rojo), `.editBut`, `.copiarBut`, `.elimBut`.

**Scroll / modal**
- `#lista`: `max-height: 800px`, `overflow-y: auto`.
- No hay modal; eliminación usa `confirm()` nativo.

**Decisión para ControlESC**
- Reutilizar estructura y estilos, adaptando a la UI existente (botones `.ajustesBtn`, modales de `components/modal.js`).

---

## D. JavaScript de PasajerosX

Archivos:
- `referencias/js/planillas.js`
- `referencias/js/asientos.js`

**planillas.js**
- `cargarBuses()`:
  - GET `php/planillas/getAllBus.php`.
  - Renderiza plantillas de bus en pares (`grupo-buses`).
  - Cada bus tiene título, mini diseño y botones EDITAR/COPIAR/ELIMINAR.
- `cargarMiniDisenoBus(nombre, contenedor)`:
  - GET `php/common/getBus.php?nombre=...`.
  - Dibuja asientos `.asiento` y extras `.extra` con posicionamiento absoluto.
- Acciones:
  - `editar(nombre)` -> `asientos.html?nombre=...&tp=e`
  - `copy(nombre)` -> `asientos.html?nombre=...&tp=c`
  - `del(nombre)` -> `confirm()` + POST `eliminarBus.php`, recarga lista.

**asientos.js**
- Lee `nombre` y `tp` (`n`, `e`, `c`).
- Nuevo: crea 44 asientos por defecto.
- Editar/copiar: carga diseño existente.
- Soporta arrastre, agregar asientos/elementos, regenerar 3/4 columnas, reset, modo eliminar.
- `guardarPosiciones()` POST JSON a `saveBus.php` y vuelve a `planillas.html`.

**Decisión**
- Portar el diagramador a `js/views/ajustes/planillasEditor.js` o iframe controlado.
- Mantener el contrato de datos y la UX de arrastre.

---

## E. Consolidación y carpeta de trabajo

**Entregables**
- `pasajerosx-control-esc/PLAN.md` (este documento).
- `pasajerosx-control-esc/referencias/` con copias de HTML/CSS/JS/SQL/PHP.
- Cada subagente A-D debe dejar su resumen en este archivo (secciones A-D ya incluidas).

---

## F. Ajustes en ControlESC (menú)

**Ubicación**
- En `js/views/ajustes.js`, agregar botón `PLANILLAS` entre `DIESEL` y `UBIC. LLEGADA`.

**Implementación**
- Importar `planillasView` desde `./ajustes/planillas.js`.
- Agregar botón y listener.
- Crear vista `planillasView()` con CRUD y diagramador.

---

## G. Diagramador de planillas (ControlESC)

**Funciones**
- Listar planillas ordenadas alfabéticamente.
- Crear (diagramador nuevo).
- Editar.
- Copiar.
- Eliminar (con contraseña).

**Datos**
- Tabla `planilla` local con IDs desde 1.
- Endpoints:
  - `GET php/api/get/planillas/route.php`
  - `GET php/api/get/planilla/route.php?nombre=...`
  - `POST php/api/store/planilla/route.php` (create/edit/copy)
  - `POST php/api/store/planillaEliminar/route.php` (delete con contraseña)

**UX**
- Grid de 2 columnas con scroll.
- Buscador por nombre.
- Botones editar/copiar/eliminar por tarjeta.

---

## H. Detalle de flota: asignar planilla

**Ubicación**
- En `js/views/entitie/flota.js`, en `#titleDin` con `space-between`, agregar botón “Asignar Planilla”.

**Modal**
- Modal con scroll y buscador.
- Grid de 2 columnas con imágenes WebP.
- Selección guarda `flota.nombre_planilla` (o tabla pivote).
- Recargar detalle tras asignar.

**Visual**
- Icono/imagen de planilla (WebP) por cada opción.

---

## I. Generación de imágenes WebP

**Objetivo**
- Generar thumbnails WebP de cada planilla en `img/planillas/`.
- Tamaño pequeño, alta calidad.

**Estrategia**
- Opción 1: renderizado headless (si hay Chromium/Playwright) a partir del HTML/CSS.
- Opción 2: generación manual/semiautomática con captura de pantalla.
- Naming: `{nombre_planilla}.webp` (normalizar espacios a `_` o `-`).

**Entregable**
- Imágenes listas antes de usar el modal de asignación.

---

## J. Supabase: viabilidad y sincronización

**Tablas propuestas**
1. `planillas`
   - Datos en bruto (nombre, tipo, numAs, posX, posY, estado) o JSON por planilla.
2. `planilla_cambios`
   - `nombre`, `version/hash`, `updated_at`, `deleted`.

**Flujo**
- Subida: al crear/editar/copiar/eliminar, enviar a Supabase.
- Bajada: revisar cada X minutos si hubo cambios; si hubo, descargar y notificar con toast.
- Eliminación: solo con contraseña.

**Viabilidad**
- 6 planillas x ~50 filas = ~300 filas.
- Recomendado: guardar cada planilla como un JSON en una fila para reducir llamadas.
- Alternativa: enviar 50 filas por planilla (viable pero más lento).

**Decisión final**
- Usar 1 fila por planilla con JSON + tabla de cambios para detectar updates.

---

## K. Eliminación segura

**Modal**
- Reutilizar modal de contraseña existente (buscar en `components/modal.js` o `cuenta.js`).
- Confirmar contraseña antes de eliminar planilla o desasignar de flota.

**Reglas**
- Eliminación siempre requiere contraseña.
- Mostrar toast/notificación de éxito o error.

---

## Orden de ejecución recomendado

1. A-E: consolidación de contexto (ya realizado).
2. DB migration (A + B).
3. Endpoints ControlESC (G).
4. Vista Ajustes + Planillas (F + G).
5. Detalle flota asignar planilla (H).
6. Imágenes WebP (I).
7. Supabase (J).
8. Eliminación con contraseña (K).

---

## Notas finales

- No se modificaron archivos de `bd/` en el commit anterior (excluidos).
- Este plan asume que los subagentes A-K ejecutarán cada bloque y actualizarán este documento con resultados.
- Si se requiere, copiar archivos adicionales de PasajerosX en `referencias/`.