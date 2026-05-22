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
  `marca_aceite` varchar(100) NOT NULL,
  `espesor` decimal(10,2) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `unidad_aceite` int(11) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
);
INSERT INTO `marca_aceite` (`id_marca_aceite`, `marca_aceite`, `espesor`, `precio`, `unidad_aceite`, `media_viajes`) VALUES
(1, 'marca', 5.00, 150.00, 2, 30),
(2, 'santos', 10.00, 300.00, 1, 30);

CREATE TABLE `aceite_reporte` (
  `id_ar` int(11) not null primary key auto_increment,
  `id_marca_aceite` int(11) DEFAULT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `unidad_aceite` int(11) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
);
INSERT INTO `aceite_reporte` (`id_marca_aceite`, `cantidad`, `precio_total`, `precio_unitario`, `unidad_aceite`, `fecha_compra`) VALUES
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
  `id_ar` int(11) DEFAULT NULL,
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


create table `empleado_reporte` (
  `id_er` int(11) primary key auto_increment,
  `id_empleado` int(11) DEFAULT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL,
  `id_gasto` int(11) DEFAULT NULL
);
-- --------------------------------------------------------
-- FLOTA
CREATE TABLE `flota` (
  `placa` varchar(10) NOT NULL primary key,
  `propietario` varchar(150) DEFAULT NULL,
  `chofer1` int(11) DEFAULT NULL,
  `chofer2` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `ubicacion` varchar(20) DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL
);
-- Data
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
  `dpFok` boolean DEFAULT NULL,
  `drFok` boolean DEFAULT NULL
);
-- --------------------------------------------------------
-- Estructura de tabla para la tabla `gasto`
CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `id_detalle` int(11) DEFAULT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL
);
-- Estructura de tabla para la tabla `descripcion`
CREATE TABLE `descripcion` (
  `id_descripcion` int(11) NOT NULL primary key auto_increment,
  `descripcion` varchar(500) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
);
-- --------------------------------------------------------
-- Estructura de tabla para la tabla `detalle`
CREATE TABLE `detalle` (
  `id_detalle` int(11) NOT NULL primary key auto_increment,
  `id_descripcion` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `tipo` varchar(10) DEFAULT NULL
);
-- -------------------------------------------------------- here
-- Estructura de tabla para la tabla `marca_rueda`
CREATE TABLE `marca_rueda` (
  `id_marca_rueda` int(11) NOT NULL primary key auto_increment,
  `marca_rueda` varchar(100) NOT NULL,
  `diametro` decimal(10,2) DEFAULT NULL,
  `grosor` decimal(10,2) DEFAULT NULL,
  `espesor` decimal(10,2) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
);
-- Volcado de datos para la tabla `marca_rueda`
INSERT INTO `marca_rueda` (`id_marca_rueda`, `marca_rueda`, `diametro`, `grosor`, `espesor`, `media_viajes`) VALUES
(1, 'MarcaR1', 49.50, 4.50, 2.00, 30),
(2, 'MarcaR2', 48.50, 4.00, 2.50, 30);
-- --------------------------------------------------------
-- Estructura de tabla para la tabla `rueda`
CREATE TABLE `rueda_reporte` (
  `id_rr` int(11) NOT NULL primary key auto_increment,
  `id_marca_rueda` int(11) DEFAULT NULL,
  `placa` varchar(10) NOT NULL DEFAULT '-',
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
);

CREATE TABLE `rueda_flota` (
  `id_rf` int(11) NOT NULL primary key auto_increment,
  `id_rr` int(11) DEFAULT NULL,
  `placa` varchar(10) NOT NULL DEFAULT '-',
  `codigo` varchar(20) NOT NULL,
  `viajes_hechos` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `fecha_uso` date DEFAULT NULL
);