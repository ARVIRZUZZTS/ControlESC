-- Migracion del Sistema de Reportes
-- Aplicar con: mysql -u root controlexp2 < migracion_reportes.sql
-- (ejecutar con el servicio de MySQL/MariaDB iniciado)

-- 1. Renombrar columna legada en gasto (tabla vacia)
ALTER TABLE `gasto`
  CHANGE `id_rep` `id_reporte` INT(11) DEFAULT NULL;

-- 2. Tabla reporte: renombrar + agregar columnas nuevas
ALTER TABLE `reporte`
  CHANGE `id_rep` `id_reporte` INT(11) NOT NULL AUTO_INCREMENT,
  CHANGE `liq_pasajes` `liquidacion_pasajes` DECIMAL(10,2) DEFAULT NULL,
  CHANGE `liq_encomiendas` `liquidacion_encomiendas` DECIMAL(10,2) DEFAULT NULL,
  CHANGE `dpFactura` `factura_diesel_partida` TINYINT(1) DEFAULT NULL,
  CHANGE `drFactura` `factura_diesel_retorno` TINYINT(1) DEFAULT NULL,
  ADD COLUMN `liquidacion_pasajes_auxiliar` DECIMAL(10,2) DEFAULT NULL AFTER `liquidacion_encomiendas`,
  ADD COLUMN `peaje_ida` DECIMAL(10,2) DEFAULT NULL AFTER `factura_diesel_retorno`,
  ADD COLUMN `peaje_retorno` DECIMAL(10,2) DEFAULT NULL AFTER `peaje_ida`,
  ADD COLUMN `otros` VARCHAR(300) DEFAULT NULL AFTER `peaje_retorno`,
  ADD COLUMN `gasto_otros` DECIMAL(10,2) DEFAULT NULL AFTER `otros`,
  ADD COLUMN `ubicacion_retorno` VARCHAR(25) DEFAULT NULL AFTER `gasto_otros`,
  ADD COLUMN `ubicacion_llegada` VARCHAR(50) DEFAULT NULL AFTER `ubicacion_retorno`,
  ADD COLUMN `asignacion_efectivo` DECIMAL(10,2) DEFAULT NULL AFTER `ubicacion_llegada`,
  ADD COLUMN `asignacion_qr` DECIMAL(10,2) DEFAULT NULL AFTER `asignacion_efectivo`;

-- 3. Nueva tabla: catalogo de peajes
CREATE TABLE IF NOT EXISTS `peaje` (
  `id_subpeaje` int(11) NOT NULL AUTO_INCREMENT,
  `precio_subpeaje` decimal(10,2) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  PRIMARY KEY (`id_subpeaje`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Nueva tabla: destinos de llegada
CREATE TABLE IF NOT EXISTS `ubicaciones_llegada` (
  `id_ubicaciones_llegada` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_ubicaciones_llegada` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_ubicaciones_llegada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `ubicaciones_llegada` (id_ubicaciones_llegada, nombre_ubicaciones_llegada)
VALUES (1, 'La Paz-Santa Cruz'), (2, 'Santa Cruz-La Paz');

-- 5. Nueva tabla: anomalias del reporte
CREATE TABLE IF NOT EXISTS `anomalia` (
  `id_anomalia` int(11) NOT NULL AUTO_INCREMENT,
  `id_reporte` int(11) DEFAULT NULL,
  `detalle_anomalia` varchar(150) DEFAULT NULL,
  `detalle_subanomalia` varchar(255) DEFAULT NULL,
  `gasto_subanomalia` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_anomalia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;