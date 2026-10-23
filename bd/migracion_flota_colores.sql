-- =====================================================
-- Migracion: colores por flota (degradado)
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- Agrega color1 (principal) y color2 (secundario opcional).
-- Si color2 es NULL o igual a color1 -> color solido.
-- NO borra datos existentes.
-- =====================================================

ALTER TABLE flota ADD COLUMN color1 VARCHAR(7) DEFAULT '#6366f1';
ALTER TABLE flota ADD COLUMN color2 VARCHAR(7) DEFAULT NULL;

UPDATE flota SET color1 = '#6366f1' WHERE color1 IS NULL OR color1 = '';

-- Color por defecto para flotas existentes (puede editarse luego)
UPDATE flota SET color2 = NULL WHERE color2 = '';
