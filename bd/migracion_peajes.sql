-- Migracion: Peajes integrados a la tabla de Ubicaciones
-- Aplicar con: mysql -u root controlexp2 < migracion_peajes.sql
-- (ejecutar con el servicio de MySQL/MariaDB iniciado)

-- 1. Agregar columna de precio de peaje a la tabla ubicacion (decimal 10,2 = precio)
ALTER TABLE `ubicacion`
  ADD COLUMN `precio_peaje` DECIMAL(10,2) DEFAULT NULL AFTER `nombre_ubicacion`;

-- 2. Migrar los peajes existentes como ubicaciones con precio (si los hay)
INSERT INTO `ubicacion` (nombre_ubicacion, precio_peaje)
SELECT CONCAT('Peaje Bs. ', precio_subpeaje), precio_subpeaje
FROM `peaje`
WHERE precio_subpeaje IS NOT NULL;

-- 3. Eliminar la tabla peajes (el peaje ahora es una ubicacion con precio)
DROP TABLE IF EXISTS `peaje`;