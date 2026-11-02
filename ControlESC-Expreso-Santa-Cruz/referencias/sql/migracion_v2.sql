-- migracion_v2.sql
-- Migración de BD: bus → planilla + nueva flota
-- Ejecutar DESPUÉS de importar pasajeros.sql y auxFLota.sql

-- 1. Renombrar tabla bus a planilla
RENAME TABLE bus TO planilla;

-- 2. Respaldar datos de flota anterior (si existe)
CREATE TABLE IF NOT EXISTS flota_backup AS SELECT * FROM flota;

-- 3. Eliminar tabla flota antigua y crear nueva
DROP TABLE IF EXISTS flota;
CREATE TABLE flota (
  placa VARCHAR(10) NOT NULL,
  propietario VARCHAR(100) DEFAULT NULL,
  conductor1 VARCHAR(100) DEFAULT NULL,
  licencia1 VARCHAR(20) DEFAULT NULL,
  conductor2 VARCHAR(100) DEFAULT NULL,
  licencia2 VARCHAR(20) DEFAULT NULL,
  nombre_planilla VARCHAR(30) DEFAULT NULL,
  PRIMARY KEY (placa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Migrar datos desde flota_backup (auxFLota), vinculando planilla por prefijo de letras
INSERT INTO flota (placa, propietario, conductor1, licencia1, nombre_planilla)
SELECT
  fb.placa,
  fb.propietario,
  fb.chofer,
  fb.licencia,
  (
    SELECT DISTINCT p.nombre
    FROM planilla p
    WHERE p.nombre LIKE CONCAT(SUBSTRING_INDEX(fb.placa, '-', -1), ' ', '%')
    LIMIT 1
  )
FROM flota_backup fb;

-- 5. Limpiar tabla temporal
DROP TABLE IF EXISTS flota_backup;
