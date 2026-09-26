-- Migracion: finalizacion de reportes, viajes automaticos y anomalias de mantenimiento

ALTER TABLE reporte
    ADD COLUMN estado ENUM('Abierto','Finalizado') NOT NULL DEFAULT 'Abierto' AFTER placa,
    ADD COLUMN viajes INT NOT NULL DEFAULT 0 AFTER estado,
    ADD COLUMN aceite_consumido DECIMAL(10,3) NULL DEFAULT NULL AFTER viajes;

UPDATE reporte SET estado = IF(fecha_llegada IS NULL, 'Abierto', 'Finalizado');

CREATE TABLE IF NOT EXISTS anomalia_sistema (
    id_as INT NOT NULL AUTO_INCREMENT,
    placa VARCHAR(10) NOT NULL,
    tipo ENUM('Rueda','Aceite') NOT NULL,
    evento VARCHAR(60) NOT NULL,
    id_rd INT NULL DEFAULT NULL,
    viajes INT NULL DEFAULT NULL,
    limite INT NULL DEFAULT NULL,
    fecha DATE NOT NULL,
    detalle VARCHAR(255) NULL DEFAULT NULL,
    PRIMARY KEY (id_as),
    KEY idx_as_placa (placa),
    KEY idx_as_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
