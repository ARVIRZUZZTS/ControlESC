-- =====================================================
-- Supabase: limpieza para modo online-only
-- Ejecutar en el SQL Editor del dashboard de Supabase.
-- =====================================================

-- Eliminar columnas innecesarias (ya no se necesita sync)
ALTER TABLE public.destinos DROP COLUMN IF EXISTS sincronizado;
ALTER TABLE public.destinos DROP COLUMN IF EXISTS updated_at;
ALTER TABLE public.sucursal DROP COLUMN IF EXISTS updated_at;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS updated_at;

-- Eliminar triggers de updated_at (ya no se necesitan)
DROP TRIGGER IF EXISTS trg_sucursal_updated ON public.sucursal;
DROP TRIGGER IF EXISTS trg_destinos_updated ON public.destinos;
DROP TRIGGER IF EXISTS trg_usuarios_updated ON public.usuarios;

-- Eliminar funcion de trigger (si no se usa en otra tabla)
DROP FUNCTION IF EXISTS update_updated_at();
