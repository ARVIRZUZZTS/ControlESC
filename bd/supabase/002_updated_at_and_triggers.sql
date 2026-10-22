-- =====================================================
-- Supabase: agregar updated_at, UNIQUE, triggers
-- Ejecutar en el SQL Editor del dashboard de Supabase.
-- =====================================================

-- 1. Agregar updated_at a las 3 tablas sincronizadas
ALTER TABLE public.sucursal ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.destinos ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. UNIQUE en destinos.nombre_destino (evitar duplicados de otras PCs)
ALTER TABLE public.destinos ADD CONSTRAINT destinos_nombre_unique UNIQUE (nombre_destino);

-- 3. Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sucursal_updated ON public.sucursal;
CREATE TRIGGER trg_sucursal_updated BEFORE UPDATE ON public.sucursal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_destinos_updated ON public.destinos;
CREATE TRIGGER trg_destinos_updated BEFORE UPDATE ON public.destinos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_usuarios_updated ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Actualizar updated_at en registros existentes
UPDATE public.sucursal SET updated_at = now();
UPDATE public.destinos SET updated_at = now();
UPDATE public.usuarios SET updated_at = now();
