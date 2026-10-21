-- Migración: Agregar soporte de Supabase y sucursal al personal

-- Crear tabla sucursal
CREATE TABLE IF NOT EXISTS sucursal (
  id_sucursal int(11) NOT NULL,
  nombre varchar(50) DEFAULT NULL,
  PRIMARY KEY (id_sucursal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar sucursales si no existen
INSERT IGNORE INTO sucursal (id_sucursal, nombre) VALUES (1, 'Sucursal Cbba.');
INSERT IGNORE INTO sucursal (id_sucursal, nombre) VALUES (2, 'Sucursal SC.');

-- Agregar campo sucursal a tipo_personal
ALTER TABLE tipo_personal ADD COLUMN IF NOT EXISTS sucursal int(11) DEFAULT NULL;

-- Agregar campos a personal
ALTER TABLE personal ADD COLUMN IF NOT EXISTS sucursal int(11) DEFAULT NULL;
ALTER TABLE personal ADD COLUMN IF NOT EXISTS contrasena varchar(255) DEFAULT NULL;

-- Actualizar estado a minúsculas para consistencia con Supabase
UPDATE personal SET estado = 'activo' WHERE estado = 'Activo';
UPDATE personal SET estado = 'inactivo' WHERE estado = 'Baja';
