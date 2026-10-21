-- =====================================================
-- Supabase: sucursal + roles (tipo_empleado -> rol)
-- Ejecutar en el SQL Editor del dashboard de Supabase.
-- Las tablas se crean por SQL para que RLS quede en OFF.
-- =====================================================

-- Tabla sucursal (fuente de verdad en la nube)
-- ids enteros para compatibilidad con usuarios.sucursal (hoy usa 1/2)
CREATE TABLE IF NOT EXISTS public.sucursal (
  id_sucursal serial PRIMARY KEY,
  nombre varchar(50) NOT NULL UNIQUE
);

-- Seed con las 3 sucursales del sistema local
INSERT INTO public.sucursal (id_sucursal, nombre) VALUES
  (1, 'Sucursal CBBA.'),
  (2, 'Sucursal SC.'),
  (3, 'No Tiene')
ON CONFLICT (id_sucursal) DO NOTHING;

-- La secuencia arranca en 1 por el seed explicito: la movemos a 3
-- para que el proximo INSERT autogenerado sea el id 4
SELECT setval(pg_get_serial_sequence('public.sucursal', 'id_sucursal'), 3, true);

-- Roles: la columna tipo_empleado pasa a llamarse rol
ALTER TABLE public.usuarios RENAME COLUMN tipo_empleado TO rol;

-- Usuario administrador de este sistema (login: Jhonny Caballero / 12345)
INSERT INTO public.usuarios (nombre, rol, estado, sucursal, "contraseña", sincronizado, cambio_contra)
SELECT 'Jhonny Caballero', 'admin', 'activo', 1, '12345', 1, false
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios WHERE nombre = 'Jhonny Caballero'
);

-- Verificacion (opcional):
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
-- SELECT * FROM public.sucursal;
-- SELECT id_usuario, nombre, rol, estado, sucursal FROM public.usuarios;
