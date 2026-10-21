-- =====================================================
-- Migracion local: ubicacion -> destinos
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- Renombra la tabla y columnas para coincidir con Supabase.
-- Agrega los campos nuevos de destinos.
-- NO borra datos existentes. precio_peaje se mantiene (solo local).
-- IDs locales NO coinciden con Supabase (ej: local Montero=4, Supabase Montero=2).
-- El sync usa nombre_destino como clave, no el id.
-- =====================================================

-- 1. Renombrar tabla
RENAME TABLE ubicacion TO destinos;

-- 2. Renombrar columnas para coincidir con Supabase
ALTER TABLE destinos CHANGE id_ubicacion id INT;
ALTER TABLE destinos CHANGE nombre_ubicacion nombre_destino VARCHAR(50);

-- 3. Agregar campos nuevos de destinos (Supabase)
ALTER TABLE destinos ADD COLUMN tiene_tramos TINYINT(1) DEFAULT 0;
ALTER TABLE destinos ADD COLUMN sucursal INT DEFAULT NULL;
ALTER TABLE destinos ADD COLUMN abrev VARCHAR(3) DEFAULT NULL;
ALTER TABLE destinos ADD COLUMN informacion VARCHAR(255) DEFAULT NULL;
ALTER TABLE destinos ADD COLUMN telefono VARCHAR(20) DEFAULT NULL;

-- 4. Actualizar FK en flota (renombrar columna)
ALTER TABLE flota CHANGE id_ubicacion id_destino INT;

-- 5. Actualizar filas existentes con datos de Supabase (match por nombre)
UPDATE destinos SET tiene_tramos=0, sucursal=2, abrev='CBBA', informacion='Av. Ayacucho S/N Sudoeste Edif Terminal de Buses Bodega N° 6', telefono='73794391' WHERE nombre_destino='Cochabamba';
UPDATE destinos SET tiene_tramos=0, sucursal=1, abrev='SCZ', informacion='C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7', telefono='73606700' WHERE nombre_destino='Santa Cruz';
UPDATE destinos SET tiene_tramos=0, sucursal=1, abrev='MON', informacion='TERMINAL NUEVA MONTERO TELF: 61379109', telefono='76402612' WHERE nombre_destino='Montero';
-- La Paz no existe en Supabase: se mantiene como esta (se subira via sync)