-- =====================================================
-- Local MySQL: limpieza para modo online-only
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- =====================================================

-- Eliminar tablas de sync
DROP TABLE IF EXISTS pendientes;
DROP TABLE IF EXISTS sync_meta;
DROP TABLE IF EXISTS sync_pendiente;

-- Eliminar columna sync_id de personal (ya no se necesita)
ALTER TABLE personal DROP COLUMN IF EXISTS sync_id;

-- Eliminar columna updated_at (ya no se necesita)
ALTER TABLE sucursal DROP COLUMN IF EXISTS updated_at;
ALTER TABLE destinos DROP COLUMN IF EXISTS updated_at;
ALTER TABLE personal DROP COLUMN IF EXISTS updated_at;

-- Revertir PKs a int (si se cambiaron a varchar)
-- NOTA: solo ejecutar si las PKs son varchar actualmente
-- ALTER TABLE sucursal MODIFY id_sucursal INT NOT NULL;
-- ALTER TABLE destinos MODIFY id INT NOT NULL;
-- ALTER TABLE personal MODIFY id_personal INT NOT NULL;