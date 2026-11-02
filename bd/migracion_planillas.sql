-- Migracion planillas (ControlESC)
CREATE TABLE IF NOT EXISTS planilla (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    tipo VARCHAR(20) DEFAULT NULL,
    numAs INT(11) DEFAULT 0,
    posX INT(11) DEFAULT NULL,
    posY INT(11) DEFAULT NULL,
    estado INT(5) DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_planilla_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE flota ADD COLUMN IF NOT EXISTS nombre_planilla VARCHAR(30) DEFAULT NULL;
