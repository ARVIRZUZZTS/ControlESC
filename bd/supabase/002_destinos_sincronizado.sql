-- =====================================================
-- Supabase: agregar columna sincronizado a destinos
-- Ejecutar en SQL Editor del dashboard de Supabase.
-- =====================================================

ALTER TABLE public.destinos ADD COLUMN IF NOT EXISTS sincronizado int NOT NULL DEFAULT 1;

UPDATE public.destinos SET sincronizado = 1 WHERE sincronizado IS NULL;
 