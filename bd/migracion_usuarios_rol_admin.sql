-- =====================================================
-- Migracion: usuarios_rol solo admins
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- =====================================================

-- Limpiar usuarios_rol (solo admins tienen acceso)
DELETE FROM usuarios_rol;

-- Insertar solo el admin (Jhonny Caballero)
INSERT INTO usuarios_rol (nombre, rol, contrasena) VALUES
('Jhonny Caballero', 'admin', '123456');

-- Verificar
SELECT * FROM usuarios_rol;
