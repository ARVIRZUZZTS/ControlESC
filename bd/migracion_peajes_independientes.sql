-- Migracion: peajes independientes (zonas intermedias)
CREATE TABLE IF NOT EXISTS peajes (
    id_peaje INT AUTO_INCREMENT PRIMARY KEY,
    nombre_peaje VARCHAR(20) NOT NULL,
    peaje DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Quitar precio_peaje de destinos (los peajes ya no son destinos)
ALTER TABLE destinos DROP COLUMN IF EXISTS precio_peaje;
