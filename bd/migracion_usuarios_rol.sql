-- =====================================================
-- Migracion local: espejo de roles para login sin internet
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- Se rellena sola desde PHP en cada login con conexion;
-- esto solo crea la tabla y siembra el admin para el modo offline.
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios_rol (
  nombre varchar(150) NOT NULL,
  rol varchar(30) NOT NULL DEFAULT 'usuario',
  contrasena varchar(50) DEFAULT NULL,
  actualizado timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO usuarios_rol (nombre, rol, contrasena) VALUES
  ('Jhonny Caballero', 'admin', '12345')
ON DUPLICATE KEY UPDATE rol = 'admin', contrasena = '12345';
