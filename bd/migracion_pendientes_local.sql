-- =====================================================
-- Migracion local: pendientes + varchar PKs + updated_at
-- Ejecutar en phpMyAdmin sobre la base controlexp2.
-- =====================================================

-- 1. Crear tabla pendientes
CREATE TABLE IF NOT EXISTS pendientes (
    id_pend VARCHAR(20) NOT NULL PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    accion VARCHAR(10) NOT NULL,
    id_local VARCHAR(20) NOT NULL,
    datos TEXT NOT NULL,
    estado VARCHAR(15) NOT NULL DEFAULT 'pendiente',
    creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sincronizado_at TIMESTAMP NULL,
    KEY idx_tabla (tabla),
    KEY idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Crear sync_meta (tracking de ultima sincronizacion)
CREATE TABLE IF NOT EXISTS sync_meta (
    clave VARCHAR(50) PRIMARY KEY,
    valor VARCHAR(50) NOT NULL
);
INSERT INTO sync_meta (clave, valor) VALUES ('last_sync_at', '2000-01-01 00:00:00')
ON DUPLICATE KEY UPDATE valor = valor;

-- 3. Cambiar PKs de int a varchar (3 tablas + FKs)
ALTER TABLE sucursal MODIFY id_sucursal VARCHAR(20) NOT NULL;
ALTER TABLE destinos MODIFY id VARCHAR(20) NOT NULL;
ALTER TABLE personal MODIFY id_personal VARCHAR(20) NOT NULL;
ALTER TABLE personal MODIFY sucursal VARCHAR(20);
ALTER TABLE destinos MODIFY sucursal VARCHAR(20);
ALTER TABLE flota MODIFY id_destino VARCHAR(20);

-- 4. Agregar updated_at local
ALTER TABLE sucursal ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE destinos ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE personal ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 5. Limpiar destinos y re-poblar desde Supabase
CREATE TABLE IF NOT EXISTS destinos_backup AS SELECT * FROM destinos;
DELETE FROM destinos;
INSERT INTO destinos (id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono, updated_at) VALUES
('1','Cochabamba',0,'2','CBBA','Av. Ayacucho S/N Sudoeste Edif Terminal de Buses Bodega N° 6','73794391', NOW()),
('2','Montero',0,'1','MON','TERMINAL NUEVA MONTERO TELF: 61379109','76402612', NOW()),
('3','Santa Cruz',0,'1','SCZ','C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7','73606700', NOW()),
('4','Trinidad',1,'1','TRD','Terminal de trinidad s/n','76402612', NOW()),
('5','Yacuiba',1,'1','YCB','C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7 - Yacuiba','76402612', NOW()),
('6','Puerto Suarez',1,'1','PTZ','','', NOW()),
('7','Yayagua',1,'2','LLG','','', NOW());

-- 6. Migrar personal: IDs "P" para no sincronizados
SET @pend = 0;
UPDATE personal SET id_personal = CONCAT((@pend := @pend + 1), 'P')
WHERE contrasena IS NULL OR contrasena = '' ORDER BY id_personal;

-- Crear registro de Jhonny Caballero en local (existe en Supabase como id 10)
INSERT INTO personal (id_personal, nombre_apellido, id_te, sucursal, contrasena, estado, sync_id, updated_at)
VALUES ('10', 'Jhonny Caballero', 8, '1', '123456', 'activo', 'OK', NOW());

-- 7. Asignar sync_id a personal
UPDATE personal SET sync_id = 'OK' WHERE contrasena IS NOT NULL AND contrasena != '';
UPDATE personal SET sync_id = 'P' WHERE contrasena IS NULL OR contrasena = '';

-- 8. Sucursal: IDs ya coinciden (1,2,3) — solo cambiar tipo (hecho en paso 3)
-- Actualizar updated_at
UPDATE sucursal SET updated_at = NOW();