-- Migracion: color de texto del badge de flota
ALTER TABLE flota ADD COLUMN color_texto VARCHAR(7) DEFAULT NULL;
