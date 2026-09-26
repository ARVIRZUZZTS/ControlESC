-- Datos de prueba para la flota ficticia 1234-ABC (David Chavez)
-- Objetivo: poder revisar el HISTORIAL DE REPORTES y la vista de AVISOS
--           con ejemplos de todos los niveles (critico, aviso, normal).
--
-- Como usarlo:   mysql -u root controlexp2 < bd/datos_prueba_1234ABC.sql
-- Como deshacer: mysql -u root controlexp2 < bd/datos_prueba_1234ABC.sql  (es re-ejecutable)
--                o DELETE manual de reporte/anomalia_sistema con viajes = 15.

SET @placa := '1234-ABC';
SET @litros_por_viaje := 1.765;   -- capacidad 30 L / 17 viajes por cambio

START TRANSACTION;

-- ---------------------------------------------------------------------------
-- 1. Limpieza para poder correr el script varias veces
-- ---------------------------------------------------------------------------
DELETE FROM anomalia_sistema
WHERE (placa = @placa AND evento IN ('Rueda supero su vida util', 'Aceite insuficiente'))
   OR (placa = '1803-BNE' AND evento = 'Aceite insuficiente');
DELETE FROM reporte WHERE placa = @placa AND id_reporte >= 8;

-- Las ruedas que estaban en la flota vuelven al almacen
UPDATE rueda_detalle
SET estado = 'Disponible', viajes_hechos = 0
WHERE id_rd IN (5, 6, 17, 18, 19, 20, 35, 36);
DELETE FROM rueda_flota WHERE placa = @placa;

-- ---------------------------------------------------------------------------
-- 2. Ruedas: 8 posiciones llenas, con 2 criticas, 3 en aviso y 3 normales
--    Michelin (media_viajes 50) -> aviso desde 40, critico desde 50
--    Santos  (media_viajes 23) -> aviso desde 19, critico desde 23
-- ---------------------------------------------------------------------------
UPDATE rueda_detalle SET codigo = 'MIC-1042', estado = 'Operativa', viajes_hechos = 52 WHERE id_rd = 35;
UPDATE rueda_detalle SET codigo = 'MIC-2087', estado = 'Operativa', viajes_hechos = 44 WHERE id_rd = 17;
UPDATE rueda_detalle SET codigo = 'MIC-3315', estado = 'Operativa', viajes_hechos = 41 WHERE id_rd = 18;
UPDATE rueda_detalle SET codigo = 'SAN-7741', estado = 'Operativa', viajes_hechos = 24 WHERE id_rd = 6;
UPDATE rueda_detalle SET codigo = 'SAN-8802', estado = 'Operativa', viajes_hechos = 20 WHERE id_rd = 5;
UPDATE rueda_detalle SET codigo = 'SAN-9014', estado = 'Operativa', viajes_hechos = 11 WHERE id_rd = 19;
UPDATE rueda_detalle SET codigo = 'SAN-1163', estado = 'Operativa', viajes_hechos = 4  WHERE id_rd = 20;
UPDATE rueda_detalle SET codigo = 'SAN-1229', estado = 'Operativa', viajes_hechos = 0  WHERE id_rd = 36;

INSERT INTO rueda_flota (id_rd, placa, id_pr, viajes_hechos, estado, fecha_instalacion, detalle) VALUES
    (35, @placa, 34, 52, 'Operativa', '2025-11-08', '295/80R22.5'),
    (17, @placa, 35, 44, 'Operativa', '2025-12-02', '295/80R22.5'),
    (18, @placa, 36, 41, 'Operativa', '2026-01-14', '275/70R22.5'),
    ( 6, @placa, 37, 24, 'Operativa', '2026-03-21', '11R22.5'),
    ( 5, @placa, 38, 20, 'Operativa', '2026-04-30', '11R22.5'),
    (19, @placa, 39, 11, 'Operativa', '2026-07-11', '11R22.5'),
    (20, @placa, 40,  4, 'Operativa', '2026-09-05', '275/70R22.5'),
    (36, @placa, 41,  0, 'Operativa', '2026-09-25', '275/70R22.5');

-- ---------------------------------------------------------------------------
-- 3. Flota: 10 viajes hechos y 4 desde el ultimo cambio de aceite
--    (4 <= 10 -> badge VERDE en el highlight de ACEITE)
--    El aviso de aceite se lo dejamos a 1803-BNE para que tambien se vea.
-- ---------------------------------------------------------------------------
UPDATE flota
SET viajes = 10,
    viajes_aceite = 4,
    aceite_actual = 15.923
WHERE placa = @placa;

UPDATE flota
SET viajes_aceite = 15
WHERE placa = '1803-BNE';

-- ---------------------------------------------------------------------------
-- 4. Reportes finalizados + 1 abierto para el historial
--    balance = (liquidaciones + asignaciones) - gastos_totales
--    #9 y #13 quedan en negativo para ver el balance en rojo
-- ---------------------------------------------------------------------------
INSERT INTO reporte
    (id_reporte, placa, estado, viajes, aceite_consumido,
     fecha_partida, fecha_retorno, fecha_llegada,
     liquidacion_pasajes, liquidacion_encomiendas, liquidacion_pasajes_auxiliar,
     diesel_partida, diesel_llegada, factura_diesel_partida, factura_diesel_retorno,
     peaje_ida, peaje_retorno, otros, gasto_otros, gastos_totales,
     ubicacion_retorno, ubicacion_llegada, asignacion_efectivo, asignacion_qr)
VALUES
    (8,  @placa, 'Finalizado', 2, 3.530,
     '2026-09-10', '2026-09-10', '2026-09-11',
     1850.00, 320.00, 0.00,
     900.00, 850.00, 1, 1,
     130.00, 130.00, NULL, 0.00, 2010.00,
     NULL, 'Santa Cruz - Cochabamba', 400.00, 150.00),

    (9,  @placa, 'Finalizado', 1, 1.765,
     '2026-09-13', '2026-09-13', '2026-09-13',
     920.00, 180.00, 0.00,
     750.00, 0.00, 1, 0,
     130.00, 0.00, NULL, 0.00, 1500.00,
     NULL, 'Cochabamba - Santa Cruz', 200.00, 80.00),

    (10, @placa, 'Finalizado', 2, 3.530,
     '2026-09-17', '2026-09-17', '2026-09-18',
     2400.00, 450.00, 150.00,
     1000.00, 950.00, 1, 1,
     180.00, 180.00, NULL, 0.00, 3050.00,
     NULL, 'Montero - Santa Cruz - Cochabamba', 500.00, 200.00),

    (11, @placa, 'Finalizado', 1, 1.765,
     '2026-09-20', '2026-09-21', '2026-09-22',
     3100.00, 600.00, 0.00,
     1800.00, 1750.00, 1, 1,
     240.00, 240.00, NULL, 0.00, 4250.00,
     NULL, 'Cochabamba - La Paz', 600.00, 300.00),

    (12, @placa, 'Finalizado', 2, 3.530,
     '2026-09-22', '2026-09-22', '2026-09-23',
     2700.00, 380.00, 90.00,
     1600.00, 1550.00, 1, 1,
     300.00, 300.00, NULL, 0.00, 3680.00,
     NULL, 'La Paz - Oruro - Cochabamba', 450.00, 150.00),

    (13, @placa, 'Finalizado', 1, 1.765,
     '2026-09-24', '2026-09-24', '2026-09-24',
     1100.00, 260.00, 0.00,
     980.00, 0.00, 1, 0,
     200.00, 0.00, NULL, 0.00, 1980.00,
     NULL, 'Cochabamba - Montero', 250.00, 60.00),

    (14, @placa, 'Abierto', 2, NULL,
     '2026-09-26', NULL, NULL,
     1500.00, 200.00, 0.00,
     880.00, 0.00, 1, 0,
     130.00, 0.00, NULL, 0.00, 1800.00,
     NULL, 'Santa Cruz - Cochabamba - Montero', 300.00, 0.00);

-- ---------------------------------------------------------------------------
-- 5. Anomalias de sistema (badge morado en AVISOS)
-- ---------------------------------------------------------------------------
INSERT INTO anomalia_sistema (placa, tipo, evento, id_rd, viajes, limite, fecha, detalle) VALUES
    (@placa, 'Rueda', 'Rueda supero su vida util', 35, 52, 50, '2026-09-24',
     'MIC-1042 en TREE D.E llego a 52 de 50 viajes. Programar cambio urgente.'),
    ('1803-BNE', 'Aceite', 'Aceite insuficiente', NULL, 15, 17, '2026-09-25',
     'Quedan 11.63 L y se requieren 1.77 L por viaje. Programar recarga de aceite.');

COMMIT;
