-- Migracion: Campo de Ingresos (nota) en el Reporte
-- Aplicar con: mysql -u root controlexp2 < migracion_ingresos.sql
-- (ejecutar con el servicio de MySQL/MariaDB iniciado)

ALTER TABLE `reporte`
  ADD COLUMN `ingresos` VARCHAR(300) DEFAULT NULL AFTER `otros`;