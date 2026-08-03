-- --------------------------------------------------------
-- UNIDAD ACEITE
CREATE TABLE `unidad_aceite` (
  `id_ua` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `unidad_aceite` varchar(30) NOT NULL,
  `conversion` decimal(10,3) NOT NULL
);
INSERT INTO `unidad_aceite` (`id_ua`, `unidad_aceite`, `conversion`) VALUES
(1, 'LITROS', 1.000),
(2, 'GALONES', 3.875),
(3, 'BALDES', 30.000);
-- -------------------------------------------------------------------
-- Estructura de tabla para la tabla `aceite`
--
CREATE TABLE `marca_aceite` (
  `id_marca_aceite` int(11) NOT NULL primary key auto_increment,
  `nombre_marca_aceite` varchar(100) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_ua` int(11) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
);
INSERT INTO `marca_aceite` (`id_marca_aceite`, `nombre_marca_aceite`, `precio`, `id_ua`, `media_viajes`) VALUES
(1, 'marca', 150.00, 2, 30),
(2, 'santos', 300.00, 1, 30);
-- -------------------------------------------------------------------
CREATE TABLE `aceite_lote` (
  `id_al` int(11) not null primary key auto_increment,
  `id_marca_aceite` int(11) DEFAULT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `id_ua` int(2) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
);
INSERT INTO `aceite_lote` (`id_marca_aceite`, `cantidad`, `precio_total`, `precio_unitario`, `id_ua`, `fecha_compra`) VALUES
(1, 2.000, 300.00, 150.00, 3, '2026-04-03'),
(1, 1.000, 300.00, 300.00, 2, '2026-04-02'),
(1, 3.000, 300.00, 100.00, 1, '2026-04-01'),
(1, 2.000, 300.00, 150.00, 2, '2026-04-01'),
(1, 4.000, 300.00, 75.00, 1, '2026-03-07'),
(2, 2.000, 300.00, 150.00, 1, '2026-03-07'),
(2, 2.000, 300.00, 150.00, 1, '2026-03-07'),
(2, 3.000, 300.00, 100.00, 3, '2026-03-02'),
(2, 2.000, 300.00, 150.00, 1, '2026-03-02'),
(2, 1.000, 300.00, 300.00, 2, '2026-03-01'),
(2, 2.000, 300.00, 150.00, 3, '2026-03-03');

CREATE TABLE `aceite_flota` (
  `id_af` int(11) primary key auto_increment,
  `id_al` int(11) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `unidad_aceite` decimal(10,2) DEFAULT NULL,
  `estado` decimal(10,2) DEFAULT NULL,
  `fecha_uso` date DEFAULT NULL
);

-- --------------------------------------------------------
CREATE TABLE `empleado` (
  `id_empleado` int(11) primary key auto_increment,
  `empleado` varchar(150) DEFAULT NULL,
  `mensual` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `id_te` decimal(10,2) DEFAULT NULL,
  `fecha_contrato` date DEFAULT NULL
);
INSERT INTO `empleado` (`empleado`, `mensual`, `total`, `id_te`, `fecha_contrato`) VALUES
('ERICK MENDOZA MONTESINOS', 1500.00, 0.00, 1, '2026-04-10'),
('WILSON LAZARTE MONTAÑO', 1500.00, 0.00, 1, '2026-04-10'),
('JUAN QUISPE LLAMPAS', 1500.00, 0.00, 1, '2026-04-10'),
('MARIO CRUZ LACATO', 1500.00, 0.00, 1, '2026-04-10'),
('-', 1500.00, 0.00, 1, '2026-04-10'),
('JHONNY VARGAS', 1500.00, 0.00, 1, '2026-04-10'),
('ALEX SANDRO VILLARROEL ROMERO', 1500.00, 0.00, 1, '2026-04-10'),
('VICTOR HUGO VELARSCO CAERO', 1500.00, 0.00, 1, '2026-04-10'),
('ELOY TERCEROS MONTAÑO', 1500.00, 0.00, 1, '2026-04-10'),
('RICHAR IRUSTA JIMENEZ', 1500.00, 0.00, 1, '2026-04-10'),
('CALIXTO ANDIA QUINTEROS', 1500.00, 0.00, 1, '2026-04-10'),
('REINALDO JORGE OCZACHOQUE', 1500.00, 0.00, 1, '2026-04-10'),
('DEMETRIO GALINDO MERIDA', 1500.00, 0.00, 1, '2026-04-10'),
('ARCENIO CABALLERO V.', 1500.00, 0.00, 1, '2026-04-10'),
('ARIEL VARGAS VALLEJOS', 1500.00, 0.00, 1, '2026-04-10'),
('JHONNY VARGAS HERBAS', 1500.00, 0.00, 1, '2026-04-10'),
('HUGO GABRIEL RASGUIDO', 1500.00, 0.00, 1, '2026-04-10');
-- --------------------------------------------------------

CREATE TABLE `tipo_empleado` (
  `id_te` int(11) primary key auto_increment,
  `tipo_empleado` varchar(50) DEFAULT NULL
);

insert into `tipo_empleado` (`tipo_empleado`) values 
('Chofer Principal'),
('Chofer Auxiliar'), 
('Ayudante'),
('Boletero'), 
('Ayudante');
-- --------------------------------------------------------
create table `empleado_reporte` (
  `id_er` int(11) primary key auto_increment,
  `id_empleado` int(11) DEFAULT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL,
  `id_gasto` int(11) DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `flota` (
  `placa` varchar(10) NOT NULL primary key,
  `propietario` varchar(150) DEFAULT NULL,
  `chofer1` int(11) DEFAULT NULL,
  `chofer2` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `ubicacion` varchar(20) DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL
);
INSERT INTO `flota` (`placa`, `propietario`, `chofer1`, `chofer2`, `estado`, `ubicacion`, `viajes`) VALUES
('1194-UKE', 'ERICK MENDOZA', 1, 0, 'Parqueado', 'Cochabamba', 0),
('1461-KUX', 'VIVIAN CABALLERO', 2, 0, 'Parqueado', 'Cochabamba', 0),
('1580-EYR', 'JUAN QUISPE LLAMPA', 3, 0, 'Parqueado', 'Cochabamba', 0),
('1800-FIU', 'MIGUELINA PEREDO', 4, 0, 'Parqueado', 'Cochabamba', 0),
('1803-BNE', 'CARMEN VELASCO', 5, 0, 'Parqueado', 'Cochabamba', 0),
('2130-YXG', 'JHONNY VARGAS', 6, 0, 'Parqueado', 'Cochabamba', 0),
('2218-PCT', '-', 7, 0, 'Parqueado', 'Cochabamba', 0),
('2264-KGD', 'VICTOR HUGO VELASCO', 8, 0, 'Parqueado', 'Cochabamba', 0),
('2447-CPE', 'ELOY TERCEROS', 9, 0, 'Parqueado', 'Cochabamba', 0),
('2447-DKT', 'RICHAR IRUSTA', 10, 0, 'Parqueado', 'Cochabamba', 0),
('2494-RXU', 'JHONNY CABALLERO', 11, 0, 'Parqueado', 'Cochabamba', 0),
('2537-DER', 'REINALDO ALBERTO', 12, 0, 'Parqueado', 'Cochabamba', 0),
('2550-TFU', 'RUTH CABALLERO', 13, 0, 'Parqueado', 'Cochabamba', 0),
('2701-YNF', 'JHONNY CABALLERO', 14, 0, 'Parqueado', 'Cochabamba', 0),
('2830-UTA', 'JHONNY CABALLERO', 15, 0, 'Parqueado', 'Cochabamba', 0),
('2996-UKF', 'JHONNY CABALLERO', 16, 0, 'Parqueado', 'Cochabamba', 0),
('3056-EAY', 'JHONNY CABALLERO', 17, 0, 'Parqueado', 'Cochabamba', 0);
-- --------------------------------------------------------
CREATE TABLE `reporte` (
  `id_rep` int(11) NOT NULL primary key auto_increment,
  `placa` varchar(10) DEFAULT NULL,
  `fecha_partida` date DEFAULT NULL,
  `fecha_retorno` date DEFAULT NULL,
  `fecha_llegada` date DEFAULT NULL,
  `liq_pasajes` decimal(10,2) DEFAULT NULL,
  `liq_encomiendas` decimal(10,2) DEFAULT NULL,
  `diesel_partida` decimal(10,2) DEFAULT NULL,
  `diesel_llegada` decimal(10,2) DEFAULT NULL,
  `dpFactura` boolean DEFAULT NULL,
  `drFactura` boolean DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `id_detalle` int(11) DEFAULT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `descripcion` (
  `id_descripcion` int(11) NOT NULL primary key auto_increment,
  `descripcion` varchar(500) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `detalle` (
  `id_detalle` int(11) NOT NULL primary key auto_increment,
  `id_descripcion` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `tipo` varchar(10) DEFAULT NULL
);
-- -------------------------------------------------------- here
CREATE TABLE `marca_rueda` (
  `id_marca_rueda` int(11) NOT NULL primary key auto_increment,
  `nombre_marca_rueda` varchar(100) NOT NULL,
  `medida` decimal(10,2) DEFAULT NULL,
  `serie` varchar(50) DEFAULT NULL,
  `trilla` varchar(50) DEFAULT NULL,
  `aro` varchar(50) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `rueda_lote` (
  `id_rl` int(11) NOT NULL primary key auto_increment,
  `id_marca_rueda` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `rueda_flota` (
  `id_rf` int(11) NOT NULL primary key auto_increment,
  `id_rl` int(11) DEFAULT NULL,
  `placa` varchar(10) NOT NULL DEFAULT '-',
  `codigo` varchar(20) NOT NULL,
  `viajes_hechos` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `fecha_uso` date DEFAULT NULL
);
-- --------------------------------------------------------
CREATE TABLE `posicion_rueda` (
  `id_pr` int(11) NOT NULL primary key auto_increment,
  `nombre_posicion` varchar(50) NOT NULL DEFAULT '-',
  `placa` varchar(10) NOT NULL  
);