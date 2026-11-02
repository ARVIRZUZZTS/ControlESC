# Resultados de implementación (Planillas)

Carpeta: `pasajerosx-control-esc/`
Fecha: implementación incremental

## 1. Subagente A - Análisis de `bd/pasajerosx/planillas.sql`
- Resultado: OK.
- Tablas: `flota` (placa, propietario, conductores, licencias, nombre_planilla) y `planilla` (id, nombre, tipo, numAs, posX, posY, estado).
- Datos: 23 planillas, 1172 elementos. IDs originales 1903-4131.
- Decisión aplicada: IDs renumerados desde 1 en ControlESC (`controlexp2.planilla` ahora tiene 1172 filas, id 1..1172).

## 2. Subagente B - Endpoints de PasajerosX
- Resultado: OK.
- Endpoints identificados: `getAllBus`, `getBus`, `eliminarBus`, `saveBus` (operaciones n/e/c).
- Contrato JSON replicado en ControlESC:
  - `GET php/api/get/planillas/route.php`
  - `GET php/api/get/planilla/route.php?nombre=...`
  - `POST php/api/store/planilla/route.php`
  - `POST php/api/store/planillaEliminar/route.php`

## 3. Subagente C - HTML/CSS de PasajerosX
- Resultado: OK.
- Referencias copiadas en `referencias/html` y `referencias/css`.
- Estilos base reutilizados: `.bus`, `.asiento`, `.extra`, botones de acción.

## 4. Subagente D - JavaScript de PasajerosX
- Resultado: OK.
- Referencias copiadas en `referencias/js`.
- Diagramador portado a `planillaEditor.html` + `js/planillaEditor.js` + `css/planillaEditor.css` con endpoints adaptados a ControlESC.

## 5. Subagente E - Consolidación
- Resultado: OK.
- `PLAN.md` creado con subagentes A-K, orden de ejecución y decisiones.

## 6. Subagente F - Ajustes en ControlESC
- Resultado: OK.
- Agregado botón `PLANILLAS` en `js/views/ajustes.js` entre `DIESEL` y `UBIC. LLEGADA`.
- Creada vista `js/views/ajustes/planillas.js` (listado, nuevo, editar, copiar, eliminar).

## 7. Subagente G - Diagramador
- Resultado: OK (port inicial).
- Archivos creados:
  - `planillaEditor.html`
  - `js/planillaEditor.js`
  - `css/planillaEditor.css`
- Endpoints adaptados:
  - `php/api/get/planilla/route.php`
  - `php/api/store/planilla/route.php`
- Prueba create/edit/copy/delete: OK (TEST_PLANILLA creado, leído y eliminado).

## 8. Subagente H - Detalle de flota: asignar planilla
- Resultado: OK.
- Botón `Asignar Planilla` agregado en `js/views/entitie/flota.js` (title con space-between).
- Modal con buscador + grid de 2 columnas + imágenes WebP.
- Endpoint: `php/api/store/flotaPlanilla/route.php`.
- Prueba: asignación de `LEITO` a `1234-ABC` OK; luego revertida a NULL.
- `php/api/get/flotaEnt/route.php` actualizado para incluir `nombre_planilla`.

## 9. Subagente I - Imágenes WebP
- Resultado: OK.
- Generadas 23 imágenes en `img/planillas/` (ej. `LEITO.webp`, `LEITO_-_SEMI_CAMA.webp`).
- Script temporal eliminado tras la generación.

## 10. Subagente J - Supabase
- Resultado: Plan definido (no implementado aún).
- Propuesta: tabla `planillas` (JSON por planilla) + `planilla_cambios` (hash/version) + sync periódico + toast.
- Viabilidad: viable; 23 planillas, ~1172 elementos; recomendado JSON por planilla.

## 11. Subagente K - Eliminación segura
- Resultado: OK (frontend + backend).
- Endpoint de verificación: `php/api/auth/verificarContra/route.php`.
- Modal de contraseña con estilo rojo (`modal-danger`) en eliminación de planillas.
- Backend elimina planilla y desasigna de flota.

## Pruebas de endpoints
- `GET php/api/get/planillas/route.php` -> OK (23 planillas).
- `GET php/api/get/planilla/route.php?nombre=LEITO` -> OK (49 elementos).
- `POST php/api/store/planilla/route.php` (create TEST_PLANILLA) -> OK.
- `GET php/api/get/planilla/route.php?nombre=TEST_PLANILLA` -> OK (2 elementos).
- `POST php/api/store/planillaEliminar/route.php` (delete TEST_PLANILLA) -> OK.
- `POST php/api/store/flotaPlanilla/route.php` (assign/unassign LEITO a 1234-ABC) -> OK.
- `GET php/api/get/flotaEnt/route.php?placa=1234-ABC` -> OK (incluye `nombre_planilla`).

## Pendientes
- Supabase sync completo (subagente J).
- Ajustes visuales del diagramador dentro de ControlESC (embebido vs nueva pestaña).
- Verificación de contraseña con sesión real (endpoint listo, requiere login).