-- =====================================================
-- Cola de sincronizacion hacia Supabase
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- Guarda las operaciones hechas sin internet para subirlas
-- cuando vuelva la conexion (solo sucursal y usuarios).
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_pendiente (
  id_pend INT(11) NOT NULL AUTO_INCREMENT,
  tabla VARCHAR(50) NOT NULL,
  operacion VARCHAR(10) NOT NULL,
  datos TEXT NOT NULL,
  id_local INT(11) DEFAULT NULL,
  estado VARCHAR(10) NOT NULL DEFAULT 'pendiente',
  error TEXT DEFAULT NULL,
  creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pend),
  KEY idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
