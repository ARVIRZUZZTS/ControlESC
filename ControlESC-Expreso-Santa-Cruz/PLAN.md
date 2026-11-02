# Plan: Boletería (Boletero + Gerente de Boleteria) — Expreso Santa Cruz

Carpeta de trabajo: `ControlESC-Expreso-Santa-Cruz/`
Referencias copiadas en: `ControlESC-Expreso-Santa-Cruz/referencias/` (pasajerosx + React)

Este documento consolida la exploración de PasajerosX/ControlESC y el plan de implementación en Expreso Santa Cruz (React + Supabase).
Cada bloque (A-Z) puede ser ejecutado por un subagente independiente.

---

## A. Análisis de base de datos (MySQL `pasajerosp` + Supabase)

**Tablas legacy relevantes (pasajerosx)**
- `flota`: `placa` PK, `propietario`, `conductor1`, `licencia1`, `conductor2`, `licencia2`, `nombre_planilla`, `marca`
- `planilla`: `id`, `nombre`, `tipo` (asiento/puerta/baño/tv/2do piso), `numAs`, `posX`, `posY`, `estado`
- `reporte`: `codR`, `con1`, `lic1`, `con2`, `lic2`, `ayudante`, `destino`, `placa`, `fecha`, `hora`, `carril`
- `persona`: `codP`, `nombre`, `ci`, `codR` (FK), `fecha`, `destino`, `precio`, `asiento`
- `chofer`: `id`, `nombre_chofer`, `licencia`
- `destino`: `nombreZona`

**Decisión (Supabase, nuevas tablas)**
Crear en `supabase/migrations/004_boleteria.sql`:
- `flotas` (placa PK, propietario, marca, conductor1, licencia1, conductor2, licencia2, nombre_planilla, sucursal, estado)
- `planillas` (id serial, nombre, tipo, num_as, pos_x, pos_y, estado, sucursal)
- `reportes` (cod_r serial PK, con1, lic1, con2, lic2, ayudante, destino, placa, fecha, hora, carril, precio, extra, sucursal, estado, creado, sincronizado)
- `personas` (cod_p serial, nombre, ci, cod_r FK, fecha, destino, precio, asiento, tipo_pago {efectivo,qr}, registrador, sucursal)
- `choferes` (id, nombre_chofer, licencia, sucursal)
- `asignaciones_boletero` (id, cod_r, boletero, asientos text[], color, luz_verde bool)
- `permisos` → PENDIENTE (solo documentar)

Índices por `sucursal`, `fecha`, `cod_r`. RLS no se toca (consistente con app actual).

**Notas**
- `precio` = precio por asiento fijado por gerente; `extra` = máximo adicional cobrable por boletero.
- Chofer se crea como "Chofer" (visual) y se guarda en `conductor1`.
- `permisos` queda pendiente.

---

## B. Endpoints de PasajerosX (referencia)

Rutas base: `C:\xampp\htdocs\pasajerosx` (copiadas en `referencias/`).

- `php/pasajero/nuevaPersona.php` — POST (nombre, ci, fecha, destino, precio, asiento, codR?) → insert persona; valida ocupación.
- `php/nomina/nuevaNomina.php` — POST (c1,l1,c2,l2,ay,pl,dt,fe,hr,ca) → insert reporte, devuelve codR.
- `php/common/getBus.php` — GET placa o nombre → planilla rows (join flota).
- `php/common/getList.php` — GET → datalists (conductores, licencias, ayudante, placa, destino, hora, carril, planillasCompletas).
- `php/common/getPasajeros.php?codR`, `php/common/reporte.php?codR`.
- `php/flota/*` (getFlota, saveFlota, eliminarFlota).
- `php/chofer/*` (getChofer, saveChofer, eliminarChofer).
- `php/asientos/saveBus.php` — POST JSON (nombreBus, elementos[], operacion, nombreOriginal).
- `php/planillas/*` (getAllBus, eliminarBus).
- `php/buses/getBusesDiarios.php?fecha`.
- `php/diario/*` (getDiarios, obtenerReportesDiarios, asignarReporte, actualizarAsiento, getPasajeros2, getPasajerosPorReporte, getHoraReporte, getMarca).
- `php/editar/*` (updateReporte, updatePasajero, deletePasajero, eliminarReporte).
- `php/ver/*` (getAsientos).

**Decisión (React)**
Portar a `src/modules/boleteria/services/boleteriaService.js` usando el patrón `apiRequest` (Supabase REST) de `encomiendasService.js`. Mantener contratos equivalentes (select/insert/update/delete por tabla).

---

## C. HTML y CSS de PasajerosX

Archivos de referencia: `referencias/html/*.html`, `referencias/css/*.css`.

**Layout legacy**
- Página completa (`body` 100vh) con fondo `img/f1.jpg` (blur).
- `header`: logo + título/fecha/hora.
- `main`: sidebar `#botones` + área `#lista` scrollable.
- `layout2.css` sobrescribe a estilo plano.

**Clases clave (diagrama)**
- `.bus` 440x700 gris rounded overflow hidden; `.asiento` 40x40 verde.
- Estados: `.asOcu` rojo, `.asLib` verde, `.asPos` morado.
- Extras: `.extra` con `.elePue` (puerta), `.eleBan` (baño), `.eleTv` (tv), `.ele2` (2do piso).
- Botones: `#crear` (verde), `#back` (rojo), modal de impresión azul `#003591`.

**Decisión para Expreso**
- Reutilizar estructura/estilos del diagrama pero adaptados a componentes React (`BusDiagram.jsx`).
- Tema azul vía `.boleteria-theme` (variables CSS) en lugar del rojo vino de encomiendas.
- Mantener touch targets ≥44px y mobile-first.

---

## D. JavaScript de PasajerosX (lógica)

Archivos: `referencias/js/*.js`.

**pasajero.js**
- `asientosSeleccionados` array; toggle por click; manual input.
- Validación de asientos ocupados antes de guardar.
- Impresión de tickets (full/price/time/empty/group) con modal.
- `crear()` inserta persona(s) vía `nuevaPersona.php`.

**nomina.js**
- Datalists, placa select → flota autocomplete (propietario, marca, conductores, licencias, planilla), save → `nuevaNomina.php`, redirect a ver.

**asientos.js**
- Designer: agregar asiento/puerta/baño/tv/2do piso, 3/4 columnas, save → `saveBus.php`, edit/copy modes, drag, reset, delete mode.

**ver.js / editar.js / diario.js**
- Carga reporte + pasajeros, diagrama, impresión (list/empty/detail/individual/orden salida), edición con validación de duplicados/ocupados, asignación de reporte a pasajero diario.

**Decisión**
- Portar la lógica de selección de asientos y validación a `BusDiagram.jsx` + `NuevoPasajero.jsx`.
- Portar el designer a `PlanillasCrud.jsx` (fase posterior).
- Omitir impresión en esta fase; agregar pantalla `GraciasCompra.jsx`.

---

## E. React (Expreso) — patrones a seguir

Referencias: `referencias/react/*`.

- `EncomiendaForm.jsx`: patrón de form, guards `tieneAcceso`, cache, toast, navigate.
- `encomiendasService.js`: `apiRequest` con `VITE_SUPABASE_URL/_KEY`.
- `cacheService.js`: localStorage TTL 5 min.
- `roles.js`: `MODULOS`, `modulosPorRol`, `tieneAcceso`, `rutaHome`, `ROLES_CONOCIDOS`.
- `variables.css` / `components.css` / `mobile.css`: estilos base.
- `App.jsx`, `Menu.jsx`, `BottomNav.jsx`: ruteo y navegación.

**Decisión**
- Crear módulo `src/modules/boleteria/` espejo de `encomiendas`.
- Agregar roles `'Boletero'` y `'Gerente de Boleteria'`.
- Generalizar `BottomNav` para renderizar módulos del rol.

---

## F. Roles y ruteo (subagente)

**Archivos a tocar**
- `src/config/roles.js`: agregar `'Gerente de Boleteria'` a `ROLES_CONOCIDOS`; módulos `boleteria-nominas`, `boleteria-historial`, `boleteria-gestion`.
- `src/App.jsx`: rutas protegidas.
- `src/components/BottomNav.jsx`: generalizar.

**Roles exactos**
- `'Boletero'` (existente)
- `'Gerente de Boleteria'` (nuevo, sin tilde)

---

## G. Tema azul (subagente)

**Archivo nuevo**
- `src/styles/boleteria.css` con `.boleteria-theme { --color-primary: #1565c0; --color-primary-dark: #0d47a1; --color-secondary: #e3f2fd; --color-secondary-dark: #bbdefb; }` y focus box-shadow azul.

**Integración**
- Importar en `main.jsx`/`App.jsx`.
- Envolver raíz de componentes boletería en `<div className="boleteria-theme ...">`.
- Agregar `.bg-boleteria` en `mobile.css`.

---

## H. BusDiagram + FlotaCarousel (subagente)

**Componentes**
- `BusDiagram.jsx`: props `planilla`, `ocupados`, `seleccionados`, `onToggle`, `readOnly`, `colorByBoletero`. Render absoluto `pos_x/pos_y`. Tipos: asiento (verde/rojo/morado), puerta/baño/tv/2do piso. Touch ≥44px.
- `FlotaCarousel.jsx`: contenedor `scroll-snap-type: x mandatory`, items `scroll-snap-align: center`, indicadores, touch. Sin librería.

**Referencia de posiciones**: `referencias/css/pasajero.css` (`.asiento`, `.extra`, `.elePue`, `.eleBan`, `.eleTv`, `.ele2`).

---

## I. Boletero flow (subagente)

**Componentes**
- `NominaList.jsx`: listado de reportes del día por sucursal (cache). Empty state si 0.
- `NuevoPasajero.jsx`: orquesta carga de reportes → FlotaCarousel (si >1) → BusDiagram → confirmación → PasajeroForm.
- `PasajeroForm.jsx`:
  - 1 asiento: nombre, CI; precio editable hasta `precio+extra` (base readonly + extra editable); destino readonly; tipo pago efectivo/qr.
  - >1 asiento: toggle "Familia" arriba → si activo, 2 inputs (familia + CI) para todos; si no, N bloques (asiento, nombre, CI).
- `GraciasCompra.jsx`: "Gracias por su compra y por preferir a Expreso Santa Cruz" + logo.
- `HistorialBoletero.jsx`: cards de reportes donde vendió (asientos, total, monto a entregar).

**Validaciones**
- Asientos ocupados no seleccionables.
- Precio ≤ `precio + extra`.
- Cache invalidation en writes.

---

## J. Gerente flow (subagente)

**Componentes**
- `GerenteGestion.jsx`: hub de CRUDs.
- `NominaForm.jsx`: crear/editar reporte (select placa → autocomplete flota; destino, carril, fecha, hora, precio, extra). Max asientos por boletero (default 6, configurable).
- `FlotasCrud.jsx`: CRUD flota (placa, propietario, marca, conductor1, licencia1, conductor2, licencia2, nombre_planilla).
- `ChoferesCrud.jsx`: CRUD chofer (solo "Chofer", guardado en conductor1).
- `BoleterosCrud.jsx`: crear boletero (insert usuarios rol `'Boletero'`, sucursal del gerente).
- `PlanillasCrud.jsx`: listar/editar/copiar/eliminar diseños (fase posterior, portar designer).
- `ReporteGerente.jsx`: ingresos/egresos por flota; por boletero qué asientos vendió y cuánto; colores aleatorios por boletero en diagrama (border + nombre); "Luz verde" activable por boletero/gerente.

**Luz verde**
- Activable por boletero y gerente. Si activo, los asientos no vendidos del boletero quedan disponibles para otros. Mostrar en reporte quién vendió qué.

---

## K. Servicio + cache (subagente)

**Archivo** `src/modules/boleteria/services/boleteriaService.js`
- Patrón `apiRequest` de `encomiendasService.js`.
- Funciones: getFlotas, saveFlota, deleteFlota; getPlanillas, getPlanilla, savePlanilla, deletePlanilla; getReportes (por fecha/sucursal), createReporte, updateReporte, deleteReporte; getPersonas (por cod_r), createPersona (batch), updatePersona, deletePersona; getChoferes, saveChofer, deleteChofer; getBoleteros (usuarios rol Boletero), createBoletero; getAsignaciones, saveAsignacion, updateLuzVerde.

**Cache** `src/modules/boleteria/services/cacheService.js`
- Keys: `boleteria_nominas_{sucursal}_{fecha}`, `boleteria_flotas_{sucursal}`, `boleteria_planillas`, TTL 5 min.
- Invalidar en writes; prefetch al entrar a Nóminas.

---

## L. Pantalla de agradecimiento (subagente)

**Componente** `GraciasCompra.jsx`
- Mensaje: "Gracias por su compra y por preferir a Expreso Santa Cruz" + logo.
- Mostrar tras guardar pasajero(s), antes de volver a Nóminas.

---

## M. Cochabamba-mobile (plan para fase posterior)

**Ubicación**: `cochabamba-mobile/` (vanilla JS).
- Replicar boletería en vanilla JS siguiendo el plan de esta carpeta.
- Auth Supabase (email/password), `localStorage.user`.
- Data: mismas tablas Supabase.
- Subagentes aplicarán este mismo plan (adaptando a vanilla).
- Por ahora: solo documentar; implementación posterior.

---

## N. Pendientes (documentar en README)

- Tabla `permisos` + UI.
- Implementación en `cochabamba-mobile/`.
- Limpieza de datos en Supabase.
- Impresión de tickets/orden de salida (fase posterior).

---

## O. Fases de implementación (orden)

1. Fase 0 — Base: SQL migrations + roles + rutas + tema CSS.
2. Fase 1 — Servicio + cache.
3. Fase 2 — BusDiagram + FlotaCarousel.
4. Fase 3 — Boletero flow (NominaList, NuevoPasajero, PasajeroForm, GraciasCompra, HistorialBoletero).
5. Fase 4 — Gerente CRUDs + NominaForm.
6. Fase 5 — ReporteGerente (colores, luz verde, ingresos/egresos).
7. Fase 6 — Optimización + Planillas designer.
8. Fase 7 — Verificación (lint, build) + docs pendientes.

---

## P. Subagentes sugeridos

- DB agent: migrations + seed.
- Service agent: boleteriaService + cache.
- Theme agent: boleteria.css + bg.
- Diagram agent: BusDiagram + FlotaCarousel.
- Boletero agent: flow + form + historial + gracias.
- Gerente agent: CRUDs + nominas + reporte.
- Reports agent: ReporteGerente (colores, luz verde).
- Optimizer agent: caching + prefetch.
- Verifier agent: lint/build + smoke.
- Cochabamba agent (fase posterior): vanilla port.
- Doc agent: README pendientes.

---

## Q. Riesgos

- Scope grande → fases verificables.
- Sin tests automatizados → lint/build + verificación manual.
- Concurrencia de asientos → validar ocupación en insert y refrescar cache.
- RLS no configurado → mantener consistencia con app actual.

---

## R. Orden de ejecución recomendado

1. A-E: consolidación de contexto (realizado).
2. F-G: roles + tema (Fase 0).
3. K: servicio + cache (Fase 1).
4. H: BusDiagram + carrusel (Fase 2).
5. I-L: boletero flow + gracias (Fase 3).
6. J: gerente (Fase 4-5).
7. M-N: cochabamba + pendientes (fase posterior).

---

## Notas finales

- No se modificaron archivos de `bd/` en commits anteriores (excluidos).
- Este plan asume que los subagentes A-Z ejecutarán cada bloque y actualizarán `result.md` con resultados.
- Si se requiere, copiar archivos adicionales de PasajerosX/ControlESC en `referencias/`.
