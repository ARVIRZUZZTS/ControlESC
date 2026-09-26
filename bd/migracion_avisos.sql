-- Migracion: Gastos Totales en el Reporte y limpieza de Sub Anomalia
-- Aplicar con: mysql -u root controlexp2 < migracion_avisos.sql
-- (ejecutar con el servicio de MySQL/MariaDB iniciado)

-- 1. Agregar el total de gastos del reporte (diesel + peajes + otros + anomalias)
ALTER TABLE `reporte`
  ADD COLUMN `gastos_totales` DECIMAL(10,2) DEFAULT NULL AFTER `gasto_otros`;

-- 2. Recalcular los gastos totales de los reportes que ya existen
UPDATE `reporte`
SET `gastos_totales` = COALESCE(`diesel_partida`, 0)
                     + COALESCE(`diesel_llegada`, 0)
                     + COALESCE(`peaje_ida`, 0)
                     + COALESCE(`peaje_retorno`, 0)
                     + COALESCE(`gasto_otros`, 0);

-- 3. Eliminar el sub detalle de las anomalias (era una nota redundante)
ALTER TABLE `anomalia`
  DROP COLUMN `detalle_subanomalia`;
