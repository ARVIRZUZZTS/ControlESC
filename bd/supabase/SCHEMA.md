# Schema Supabase

> Proyecto: `mxonuyelhoxenasrtvpf` (https://mxonuyelhoxenasrtvpf.supabase.co)
> Dump realizado: 2026-10-16
> Método: REST API (anon key) — solo lectura
> RLS: **Desactivado** en todas las tablas (creadas por SQL Editor)

---

## Tablas existentes (3)

### 1. `sucursal`

Fuente de verdad para las sucursales. Se sincroniza con MySQL local (tabla `sucursal`).

| Columna | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id_sucursal` | `int` (serial) | PK | Auto-increment. Arranca en 4 (3 seed + 1 admin). |
| `nombre` | `varchar(50)` | UNIQUE, NOT NULL | |

**Datos (3 filas):**

| id_sucursal | nombre |
|---|---|
| 1 | Sucursal CBBA. |
| 2 | Sucursal SC. |
| 3 | No Tiene |

**Relaciones:** `usuarios.sucursal` → `sucursal.id_sucursal`, `destinos.sucursal` → `sucursal.id_sucursal`

---

### 2. `usuarios`

Fuente de verdad para los usuarios/personal que acceden al sistema. Se sincroniza con MySQL local (tabla `personal`).

| Columna | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id_usuario` | `int` (serial) | PK | Auto-increment. |
| `nombre` | `varchar` | NOT NULL | Nombre y apellido. |
| `rol` | `varchar` | | Antes se llamaba `tipo_empleado`. Renombrado el 2026-10-15. |
| `estado` | `varchar` | | `'activo'` o `'inactivo'`. |
| `sucursal` | `int` | FK → `sucursal.id_sucursal` | Sucursal asignada (solo para roles con sucursal). |
| `contraseña` | `varchar` | | Texto plano (no hasheada). |
| `creado` | `timestamp` | | Fecha de creación (auto). |
| `sincronizado` | `int` | | Flag de sincronización (1 = sincronizado). |
| `cambio_contra` | `boolean` | | `true` si el usuario cambió su contraseña al menos una vez. |

**Datos (10 filas):**

| id_usuario | nombre | rol | estado | sucursal | contraseña | sincronizado | cambio_contra |
|---|---|---|---|---|---|---|---|
| 1 | juan perez | encomiendas | activo | 1 | 654321 | 2 | true |
| 2 | juan 2 | encomiendas | activo | 1 | 987654 | 2 | true |
| 3 | suc2 | encomiendas | activo | 2 | admin123 | 1 | false |
| 4 | cocha | encomiendas | activo | 1 | abc123 | 1 | true |
| 5 | coocha | Boletero | activo | 1 | 753357 | 1 | true |
| 6 | santa | encomiendas | activo | 2 | 1234 | 1 | false |
| 7 | santa | encomiendas | activo | 2 | 1234 | 1 | false |
| 8 | santa | encomiendas | activo | 2 | 1234 | 1 | false |
| 9 | juan sc | encomiendas | activo | 2 | 369258 | 1 | true |
| 10 | Jhonny Caballero | admin | activo | 1 | 123456 | 1 | true |

**Nota:** El usuario admin (id 10) tiene `contraseña = '123456'` en Supabase. En el espejo local (`usuarios_rol`) tiene `contrasena = '12345'`. El cambio se hizo en algún momento y no se sincronizó.

---

### 3. `destinos`

Fuente de verdad para los destinos/ubicaciones. Se sincroniza con MySQL local (tabla `ubicacion`, que se renombrará a `destinos`).

| Columna | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | `int` (serial) | PK | Auto-increment. |
| `nombre_destino` | `varchar` | NOT NULL | Nombre del destino (antes: nombre_ubicacion). |
| `tiene_tramos` | `boolean` | DEFAULT false | Si el destino tiene tramos. |
| `sucursal` | `int` | FK → `sucursal.id_sucursal` | Sucursal a la que depende. |
| `abrev` | `varchar` | | Abreviación (máx 3 caracteres). Antes: abreviacion. |
| `informacion` | `varchar` | | Descripción/info del destino. |
| `telefono` | `varchar` | | Teléfono de contacto. |
| `sincronizado` | `int` | NOT NULL, DEFAULT 1 | 1 = sincronizado, 0 = pendiente. |

**Datos (7 filas):**

| id | nombre_destino | tiene_tramos | sucursal | abrev | informacion | telefono |
|---|---|---|---|---|---|---|
| 1 | Cochabamba | false | 2 | CBBA | Av. Ayacucho S/N Sudoeste Edif Terminal de Buses Bodega N° 6 | 73794391 |
| 2 | Montero | false | 1 | MON | TERMINAL NUEVA MONTERO TELF: 61379109 | 76402612 |
| 3 | Santa Cruz | false | 1 | SCZ | C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7 | 73606700 |
| 4 | Trinidad | true | 1 | TRD | Terminal de trinidad s/n | 76402612 |
| 5 | Yacuiba | true | 1 | YCB | C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7 - Yacuiba | 76402612 |
| 6 | Puerto Suarez | true | 1 | PTZ | (vacío) | (vacío) |
| 7 | Yayagua | true | 2 | LLG | (vacío) | (vacío) |

**Relaciones:** `destinos.sucursal` → `sucursal.id_sucursal`

---

## Tablas que NO existen en Supabase

Las siguientes tablas existen solo en MySQL local (`controlexp2`):

| Tabla local | Descripción | ¿Se sincroniza? |
|---|---|---|
| `personal` | Empleados (nombre, tipo, mensual, total, fecha_contrato, estado, sucursal, contrasena) | Parcial (solo crear) |
| `tipo_personal` | Tipos de personal (nombre_tipo_personal, sucursal) | No |
| `ubicacion` | Ubicaciones/destinos (nombre_ubicacion, precio_peaje + campos nuevos) | Sí (se renombrará a `destinos`) |
| `ubicaciones_llegada` | Ubicaciones de llegada para reportes | No |
| `flota` | Flotas (placa, propietario, chofer1, chofer2, id_fe, id_ubicacion, viajes) | No |
| `flota_estados` | Estados de flota | No |
| `reporte` | Reportes de viaje | No |
| `gasto` | Gastos por reporte | No |
| `gasto_estimado` | Plantillas de gasto | No |
| `detalle` | Detalles de gasto | No |
| `detalle_estimado` | Plantillas de detalle | No |
| `anomalia` | Anomalías por reporte | No |
| `anomalia_sistema` | Anomalías del sistema | No |
| `responsable` | Responsables de gasto | No |
| `marca_aceite` | Marcas de aceite | No |
| `aceite_detalle` | Detalles de aceite | No |
| `aceite_lote` | Lotes de aceite | No |
| `aceite_flota` | Aceite instalado en flota | No |
| `marca_rueda` | Marcas de rueda | No |
| `rueda_detalle` | Detalles de rueda | No |
| `rueda_lote` | Lotes de rueda | No |
| `rueda_flota` | Rueda instalada en flota | No |
| `posicion_rueda` | Posiciones de rueda en flota | No |
| `personal_reporte` | Personal asignado a reporte | No |
| `diesel` | Diesel por reporte | No |
| `peaje` | Peajes por reporte | No |
| `sync_pendiente` | Cola de sincronización offline | Local only |
| `usuarios_rol` | Espejo de credenciales para login offline | Local only |

---

## Tablas planeadas (no creadas aún)

_(Ninguna pendiente — `destinos` ya existe en Supabase.)_

---

## Notas de seguridad

- **RLS:** Desactivado en todas las tablas. La anon key tiene acceso completo (SELECT, INSERT, UPDATE, DELETE).
- **Contraseñas:** Almacenadas en texto plano en Supabase (`contraseña`).
- **Autenticación:** Se maneja en PHP (sesiones + roles). Supabase no tiene auth nativo configurado.

---

## Sincronización

### Flujo actual (implementado)
- **PUSH (local → Supabase):** Al loguear + cada 5 min vía `setInterval` en `main.js`.
  - Tablas sincronizadas: `sucursal`, `usuarios` (solo crear).
  - Cola: tabla `sync_pendiente` (MySQL local).
- **PULL (Supabase → local):** No existe aún. Se implementará para `destinos`.
- **Login offline:** Espejo local `usuarios_rol` (MySQL) con credenciales cacheadas.

### Sync pendiente de implementar
- `personalEditar` y `personalEstado` no sincronizan a Supabase.
- `destinos` (pull + push) no implementado aún.