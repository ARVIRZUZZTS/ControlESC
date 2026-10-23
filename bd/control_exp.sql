-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2026 at 04:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `controlexp2`
--

-- --------------------------------------------------------

--
-- Table structure for table `aceite_detalle`
--

CREATE TABLE `aceite_detalle` (
  `id_ad` int(11) NOT NULL,
  `id_al` int(11) DEFAULT NULL,
  `id_marca_aceite` int(11) DEFAULT NULL,
  `precio_ingresado` decimal(10,2) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `estado` enum('Agotado','En Uso','Almacen') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aceite_detalle`
--

INSERT INTO `aceite_detalle` (`id_ad`, `id_al`, `id_marca_aceite`, `precio_ingresado`, `stock`, `estado`) VALUES
(4, 14, 1, 0.00, 3.000, 'Almacen'),
(5, 15, 1, 0.00, 3.000, 'Almacen'),
(6, 15, 2, 0.00, 2.000, 'Almacen'),
(9, 17, 1, 300.00, 2.000, 'Almacen'),
(10, 17, 2, 1000.00, 3.000, 'Almacen'),
(11, 18, 1, 150.00, 1.000, 'Almacen'),
(13, 20, 2, 600.00, 2.000, 'Almacen'),
(14, 21, 2, 600.00, 2.000, 'Almacen'),
(15, 22, 2, 300.00, 1.000, 'Almacen');

-- --------------------------------------------------------

--
-- Table structure for table `aceite_flota`
--

CREATE TABLE `aceite_flota` (
  `id_af` int(11) NOT NULL,
  `id_ad` int(11) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `estado` enum('En Uso','Agotado') DEFAULT 'En Uso',
  `fecha_uso` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aceite_flota`
--

INSERT INTO `aceite_flota` (`id_af`, `id_ad`, `placa`, `cantidad`, `estado`, `fecha_uso`) VALUES
(5, 4, '1803-BNE', 5.813, 'En Uso', '2026-09-07'),
(6, 9, '1803-BNE', 5.813, 'En Uso', '2026-09-10'),
(7, 9, '1234-ABC', 1.938, 'En Uso', '2026-09-12'),
(8, 10, '1234-ABC', 0.750, 'En Uso', '2026-09-12'),
(11, 13, '1234-ABC', 15.000, 'En Uso', '0000-00-00'),
(13, 6, '1234-ABC', 30.000, 'En Uso', '0000-00-00'),
(14, 15, '1803-BNE', 7.500, 'En Uso', '0000-00-00'),
(15, 15, '2447-CPE', 5.625, 'En Uso', '0000-00-00');

-- --------------------------------------------------------

--
-- Table structure for table `aceite_lote`
--

CREATE TABLE `aceite_lote` (
  `id_al` int(11) NOT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_estimado` decimal(10,2) DEFAULT NULL,
  `precio_real` decimal(10,2) DEFAULT NULL,
  `estado_precio` enum('Subio','Bajo','Mantuvo') DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `stock_total` decimal(10,3) DEFAULT NULL,
  `estado` enum('Operativo','Eliminado') NOT NULL DEFAULT 'Operativo',
  `fecha_compra` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aceite_lote`
--

INSERT INTO `aceite_lote` (`id_al`, `precio_total`, `precio_estimado`, `precio_real`, `estado_precio`, `cantidad`, `stock_total`, `estado`, `fecha_compra`) VALUES
(1, 300.00, 0.00, 300.00, 'Subio', 2, 2.000, 'Eliminado', '2026-04-03'),
(2, 300.00, 0.00, 300.00, 'Subio', 1, 1.000, 'Eliminado', '2026-04-02'),
(3, 300.00, 0.00, 300.00, 'Subio', 3, 3.000, 'Eliminado', '2026-04-01'),
(4, 300.00, 0.00, 300.00, 'Subio', 2, 2.000, 'Eliminado', '2026-04-01'),
(5, 300.00, 0.00, 300.00, 'Subio', 4, 4.000, 'Eliminado', '2026-03-07'),
(6, 300.00, 0.00, 300.00, 'Subio', 2, 2.000, 'Eliminado', '2026-03-07'),
(7, 300.00, 0.00, 300.00, 'Subio', 2, 2.000, 'Eliminado', '2026-03-07'),
(8, 300.00, 0.00, 300.00, 'Subio', 3, 3.000, 'Eliminado', '2026-03-02'),
(9, 300.00, 0.00, 300.00, 'Subio', 2, 2.000, 'Eliminado', '2026-03-02'),
(10, 300.00, 0.00, 300.00, 'Subio', 1, 1.000, 'Eliminado', '2026-03-01'),
(11, 300.00, 0.00, 300.00, 'Subio', 2, 2.000, 'Eliminado', '2026-03-03'),
(14, 0.00, 450.00, 0.00, 'Bajo', 3, 3.000, 'Eliminado', '2026-09-06'),
(15, 0.00, 1050.00, 0.00, 'Bajo', 5, 5.000, 'Eliminado', '2026-09-06'),
(17, 1300.00, 1200.00, 1300.00, 'Subio', 5, 5.000, 'Eliminado', '2026-09-09'),
(18, 150.00, 150.00, 150.00, 'Mantuvo', 1, 1.000, 'Eliminado', '2026-09-09'),
(20, 660.00, 600.00, 660.00, 'Subio', 2, 2.000, 'Operativo', '2026-09-12'),
(21, 680.00, 600.00, 680.00, 'Subio', 2, 2.000, 'Operativo', '2026-10-02'),
(22, 330.00, 300.00, 330.00, 'Subio', 1, 1.000, 'Operativo', '2026-10-02');

-- --------------------------------------------------------

--
-- Table structure for table `anomalia`
--

CREATE TABLE `anomalia` (
  `id_anomalia` int(11) NOT NULL,
  `id_reporte` int(11) DEFAULT NULL,
  `detalle_anomalia` varchar(150) DEFAULT NULL,
  `gasto_subanomalia` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `anomalia`
--

INSERT INTO `anomalia` (`id_anomalia`, `id_reporte`, `detalle_anomalia`, `gasto_subanomalia`) VALUES
(11, 11, 'Aceite insuficiente en Cochabamba', 120.00);

-- --------------------------------------------------------

--
-- Table structure for table `anomalia_sistema`
--

CREATE TABLE `anomalia_sistema` (
  `id_as` int(11) NOT NULL,
  `placa` varchar(10) NOT NULL,
  `tipo` enum('Rueda','Aceite') NOT NULL,
  `evento` varchar(60) NOT NULL,
  `id_rd` int(11) DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL,
  `limite` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `detalle` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `anomalia_sistema`
--

INSERT INTO `anomalia_sistema` (`id_as`, `placa`, `tipo`, `evento`, `id_rd`, `viajes`, `limite`, `fecha`, `detalle`) VALUES
(15, '1234-ABC', 'Rueda', 'Rueda supero su vida util', 35, 52, 50, '2026-09-24', 'MIC-1042 en TREE D.E llego a 52 de 50 viajes. Programar cambio urgente.'),
(16, '1803-BNE', 'Aceite', 'Aceite insuficiente', NULL, 15, 17, '2026-09-25', 'Quedan 11.63 L y se requieren 1.77 L por viaje. Programar recarga de aceite.'),
(17, '2447-CPE', 'Aceite', 'Aceite cambiado antes de tiempo', NULL, 0, 17, '2026-10-02', 'Se recargaron 5.63 L con solo 0 viajes desde la ultima recarga (lo recomendado es 14 a 17).');

-- --------------------------------------------------------

--
-- Table structure for table `detalle`
--

CREATE TABLE `detalle` (
  `id_detalle` int(11) NOT NULL,
  `detalle` varchar(255) DEFAULT NULL,
  `tipo` varchar(10) DEFAULT NULL,
  `gasto_particular` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detalle_estimado`
--

CREATE TABLE `detalle_estimado` (
  `id_detalle_estimado` int(11) NOT NULL,
  `id_gasto_estimado` int(11) DEFAULT NULL,
  `detalle` varchar(255) DEFAULT NULL,
  `gasto_particular` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detalle_estimado`
--

INSERT INTO `detalle_estimado` (`id_detalle_estimado`, `id_gasto_estimado`, `detalle`, `gasto_particular`) VALUES
(3, 2, 'Cambio de Chicotillo', 550.00),
(4, 2, 'parachoque', 400.00);

-- --------------------------------------------------------

--
-- Table structure for table `diesel`
--

CREATE TABLE `diesel` (
  `id_diesel` int(11) NOT NULL,
  `precio_x_litro` decimal(10,2) DEFAULT NULL,
  `fecha_guardado` date DEFAULT NULL,
  `estado` enum('activo','baja') DEFAULT 'activo',
  `litros_comprados_totales` decimal(10,2) DEFAULT 0.00,
  `precio_total_pagado` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diesel`
--

INSERT INTO `diesel` (`id_diesel`, `precio_x_litro`, `fecha_guardado`, `estado`, `litros_comprados_totales`, `precio_total_pagado`) VALUES
(1, 6.00, '2026-09-18', 'baja', 100.00, 600.00),
(2, 25.00, '2026-09-22', 'baja', NULL, NULL),
(3, 26.00, '2026-09-22', 'activo', 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `flota`
--

CREATE TABLE `flota` (
  `placa` varchar(10) NOT NULL,
  `propietario` varchar(150) DEFAULT NULL,
  `chofer1` int(11) DEFAULT NULL,
  `chofer2` int(11) DEFAULT NULL,
  `id_fe` int(11) DEFAULT NULL,
  `id_ubicacion` int(11) DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL,
  `viajes_aceite` int(11) NOT NULL,
  `capacidad_aceite` decimal(10,3) NOT NULL DEFAULT 0.000,
  `aceite_actual` decimal(10,3) NOT NULL DEFAULT 0.000,
  `color1` varchar(7) DEFAULT '#6366f1',
  `color2` varchar(7) DEFAULT NULL,
  `color_texto` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flota`
--

INSERT INTO `flota` (`placa`, `propietario`, `chofer1`, `chofer2`, `id_fe`, `id_ubicacion`, `viajes`, `viajes_aceite`, `capacidad_aceite`, `aceite_actual`) VALUES
('1194-UKE', 'ERICK MENDOZA', 1, 0, 1, 1, 0, 0, 30.000, 0.000),
('1234-ABC', 'David Chavez', 15, 0, 1, 2, 10, 4, 30.000, 15.923),
('1461-KUX', 'VIVIAN CABALLERO', 2, 0, 1, 1, 0, 0, 30.000, 0.000),
('1580-EYR', 'JUAN QUISPE LLAMPA', 3, 0, 1, 1, 0, 0, 30.000, 0.000),
('1800-FIU', 'MIGUELINA PEREDO', 4, 0, 1, 1, 0, 0, 30.000, 0.000),
('1803-BNE', 'CARMEN VELASCO', 5, 0, 1, 1, 0, 15, 30.000, 19.126),
('2130-YXG', 'JHONNY VARGAS', 6, 0, 1, 1, 0, 0, 30.000, 0.000),
('2218-PCT', '-', 7, 0, 1, 1, 0, 0, 30.000, 0.000),
('2264-KGD', 'VICTOR HUGO VELASCO', 8, 0, 1, 1, 0, 0, 30.000, 0.000),
('2447-CPE', 'ELOY TERCEROS', 9, 0, 1, 1, 0, 0, 30.000, 5.625),
('2447-DKT', 'RICHAR IRUSTA', 10, 0, 1, 1, 0, 0, 30.000, 0.000),
('2494-RXU', 'JHONNY CABALLERO', 11, 0, 1, 1, 0, 0, 30.000, 0.000),
('2537-DER', 'REINALDO ALBERTO', 12, 0, 1, 1, 0, 0, 30.000, 0.000),
('2550-TFU', 'RUTH CABALLERO', 13, 0, 1, 1, 0, 0, 30.000, 0.000),
('2701-YNF', 'JHONNY CABALLERO', 14, 0, 1, 1, 0, 0, 30.000, 0.000),
('2830-UTA', 'JHONNY CABALLERO', 15, 0, 1, 1, 0, 0, 30.000, 0.000),
('2996-UKF', 'JHONNY CABALLERO', 16, 0, 1, 1, 0, 0, 30.000, 0.000),
('3056-EAY', 'JHONNY CABALLERO', 17, 0, 1, 1, 0, 0, 30.000, 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `flota_estados`
--

CREATE TABLE `flota_estados` (
  `id_fe` int(11) NOT NULL,
  `nombre_estado_flota` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flota_estados`
--

INSERT INTO `flota_estados` (`id_fe`, `nombre_estado_flota`) VALUES
(1, 'Parqueado'),
(2, 'Viajando'),
(3, 'Mecanico'),
(4, 'Accidente');

-- --------------------------------------------------------

--
-- Table structure for table `gasto`
--

CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `id_reporte` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `gasto_generico` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gasto`
--

INSERT INTO `gasto` (`id_gasto`, `id_reporte`, `titulo`, `gasto_generico`) VALUES
(30, 9, 'Reparacion de freno de aire', 320.00),
(31, 9, 'Viaticos del chofer', 300.00),
(32, 10, 'Cambio de neumaticos', 500.00),
(33, 10, 'Mantenimiento de frenos', 240.00),
(34, 11, 'Lavado y engrase', 100.00),
(35, 13, 'Reparacion de electromotor', 450.00),
(36, 13, 'Compra de refill', 350.00),
(37, 14, 'Cambio de amortiguadores', 400.00),
(38, 14, 'Reparacion electrica', 390.00);

-- --------------------------------------------------------

--
-- Table structure for table `gasto_estimado`
--

CREATE TABLE `gasto_estimado` (
  `id_gasto_estimado` int(11) NOT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `gasto_generico` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gasto_estimado`
--

INSERT INTO `gasto_estimado` (`id_gasto_estimado`, `titulo`, `gasto_generico`) VALUES
(2, 'Mecanico', 200.00);

-- --------------------------------------------------------

--
-- Table structure for table `marca_aceite`
--

CREATE TABLE `marca_aceite` (
  `id_marca_aceite` int(11) NOT NULL,
  `nombre_marca_aceite` varchar(100) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL DEFAULT 0.000,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marca_aceite`
--

INSERT INTO `marca_aceite` (`id_marca_aceite`, `nombre_marca_aceite`, `cantidad`, `precio`) VALUES
(1, 'marca', 0.000, 150.00),
(2, 'santos', 30.000, 300.00);

-- --------------------------------------------------------

--
-- Table structure for table `marca_rueda`
--

CREATE TABLE `marca_rueda` (
  `id_marca_rueda` int(11) NOT NULL,
  `nombre_marca_rueda` varchar(100) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `medida` decimal(10,2) DEFAULT NULL,
  `serie` varchar(50) DEFAULT NULL,
  `trilla` varchar(50) DEFAULT NULL,
  `aro` varchar(50) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marca_rueda`
--

INSERT INTO `marca_rueda` (`id_marca_rueda`, `nombre_marca_rueda`, `precio_unitario`, `medida`, `serie`, `trilla`, `aro`, `media_viajes`) VALUES
(1, 'Santos', 150.00, 23.00, '23', '23', '23', 23),
(4, 'Michelin', 200.00, 25.00, '548s', '25', 'Completo', 50);

-- --------------------------------------------------------

--
-- Table structure for table `personal`
--

CREATE TABLE `personal` (
  `id_personal` int(11) NOT NULL,
  `nombre_apellido` varchar(150) DEFAULT NULL,
  `mensual` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `id_te` int(11) DEFAULT NULL,
  `fecha_contrato` date DEFAULT current_timestamp(),
  `estado` varchar(10) NOT NULL DEFAULT 'Activo',
  `sucursal` int(11) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personal`
--

INSERT INTO `personal` (`id_personal`, `nombre_apellido`, `mensual`, `total`, `id_te`, `fecha_contrato`, `estado`, `sucursal`, `contrasena`) VALUES
(1, 'ERICK MENDOZA MONTESINOS', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(2, 'WILSON LAZARTE MONTAÑO', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(3, 'JUAN QUISPE LLAMPAS', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(4, 'MARIO CRUZ LACATO', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(5, '-', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(6, 'JHONNY VARGAS', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(7, 'ALEX SANDRO VILLARROEL ROMERO', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(8, 'VICTOR HUGO VELARSCO CAERO', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(9, 'ELOY TERCEROS MONTAÑO', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(10, 'RICHAR IRUSTA JIMENEZ', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(11, 'CALIXTO ANDIA QUINTEROS', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(12, 'REINALDO JORGE OCZACHOQUE', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(13, 'DEMETRIO GALINDO MERIDA', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(14, 'ARCENIO CABALLERO V.', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(15, 'ARIEL VARGAS VALLEJOS', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(16, 'JHONNY VARGAS HERBAS', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(17, 'HUGO GABRIEL RASGUIDO', 1500.00, 0.00, 1, '2026-04-10', 'activo', NULL, NULL),
(20, 'GABRIEL RENE MORENO', NULL, NULL, 2, NULL, 'activo', NULL, NULL),
(22, 'DAVID CHAVEZ', 500.00, 1000.00, 2, '2026-09-16', 'activo', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personal_reporte`
--

CREATE TABLE `personal_reporte` (
  `id_er` int(11) NOT NULL,
  `id_personal` int(11) DEFAULT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL,
  `id_gasto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posicion_rueda`
--

CREATE TABLE `posicion_rueda` (
  `id_pr` int(11) NOT NULL,
  `nombre_posicion` varchar(50) NOT NULL DEFAULT '-',
  `placa` varchar(10) NOT NULL,
  `posicion_x` decimal(5,2) NOT NULL DEFAULT 0.00,
  `posicion_y` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tipo` enum('doble','simple') NOT NULL DEFAULT 'simple'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posicion_rueda`
--

INSERT INTO `posicion_rueda` (`id_pr`, `nombre_posicion`, `placa`, `posicion_x`, `posicion_y`, `tipo`) VALUES
(34, 'TREE D.E', '1234-ABC', 76.19, 68.33, 'doble'),
(35, 'TREE D.I', '1234-ABC', 66.19, 68.33, 'doble'),
(36, 'ga', '1234-ABC', 73.55, 18.09, 'simple'),
(37, 'ga1', '1234-ABC', 20.92, 18.11, 'simple'),
(38, 'tr Ex', '1234-ABC', 22.09, 68.79, 'doble'),
(39, 'tr In', '1234-ABC', 12.09, 68.79, 'doble'),
(40, 'rtra2', '1234-ABC', 72.15, 78.90, 'simple'),
(41, 'rtra1', '1234-ABC', 18.52, 79.05, 'simple');

-- --------------------------------------------------------

--
-- Table structure for table `reporte`
--

CREATE TABLE `reporte` (
  `id_reporte` int(11) NOT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `estado` enum('Abierto','Finalizado') NOT NULL DEFAULT 'Abierto',
  `viajes` int(11) NOT NULL DEFAULT 0,
  `aceite_consumido` decimal(10,3) DEFAULT NULL,
  `fecha_partida` date DEFAULT NULL,
  `fecha_retorno` date DEFAULT NULL,
  `fecha_llegada` date DEFAULT NULL,
  `liquidacion_pasajes` decimal(10,2) DEFAULT NULL,
  `liquidacion_encomiendas` decimal(10,2) DEFAULT NULL,
  `liquidacion_pasajes_auxiliar` decimal(10,2) DEFAULT NULL,
  `diesel_partida` decimal(10,2) DEFAULT NULL,
  `diesel_llegada` decimal(10,2) DEFAULT NULL,
  `factura_diesel_partida` tinyint(1) DEFAULT NULL,
  `factura_diesel_retorno` tinyint(1) DEFAULT NULL,
  `peaje_ida` decimal(10,2) DEFAULT NULL,
  `peaje_retorno` decimal(10,2) DEFAULT NULL,
  `otros` varchar(300) DEFAULT NULL,
  `ingresos` varchar(300) DEFAULT NULL,
  `gasto_otros` decimal(10,2) DEFAULT NULL,
  `gastos_totales` decimal(10,2) DEFAULT NULL,
  `ubicacion_retorno` varchar(25) DEFAULT NULL,
  `ubicacion_llegada` varchar(50) DEFAULT NULL,
  `asignacion_efectivo` decimal(10,2) DEFAULT NULL,
  `asignacion_qr` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reporte`
--

INSERT INTO `reporte` (`id_reporte`, `placa`, `estado`, `viajes`, `aceite_consumido`, `fecha_partida`, `fecha_retorno`, `fecha_llegada`, `liquidacion_pasajes`, `liquidacion_encomiendas`, `liquidacion_pasajes_auxiliar`, `diesel_partida`, `diesel_llegada`, `factura_diesel_partida`, `factura_diesel_retorno`, `peaje_ida`, `peaje_retorno`, `otros`, `ingresos`, `gasto_otros`, `gastos_totales`, `ubicacion_retorno`, `ubicacion_llegada`, `asignacion_efectivo`, `asignacion_qr`) VALUES
(7, '1234-ABC', 'Finalizado', 1, 1.765, '2026-09-26', '2026-09-26', '2026-09-26', 123.00, 5666.00, 4808.00, 3000.00, NULL, 1, 0, 150.00, 150.00, NULL, NULL, 0.00, 3300.00, 'Santa Cruz', 'Cochabamba', 100.00, 149.97),
(8, '1234-ABC', 'Finalizado', 2, 3.530, '2026-09-10', '2026-09-10', '2026-09-11', 1850.00, 320.00, 0.00, 900.00, 850.00, 1, 1, 130.00, 130.00, NULL, NULL, 0.00, 2010.00, NULL, 'Santa Cruz - Cochabamba', 400.00, 150.00),
(9, '1234-ABC', 'Finalizado', 1, 1.765, '2026-09-13', '2026-09-13', '2026-09-13', 920.00, 180.00, 0.00, 750.00, 0.00, 1, 0, 130.00, 0.00, NULL, NULL, 0.00, 1500.00, NULL, 'Cochabamba - Santa Cruz', 200.00, 80.00),
(10, '1234-ABC', 'Finalizado', 2, 3.530, '2026-09-17', '2026-09-17', '2026-09-18', 2400.00, 450.00, 150.00, 1000.00, 950.00, 1, 1, 180.00, 180.00, NULL, NULL, 0.00, 3050.00, NULL, 'Montero - Santa Cruz - Cochabamba', 500.00, 200.00),
(11, '1234-ABC', 'Finalizado', 1, 1.765, '2026-09-20', '2026-09-21', '2026-09-22', 3100.00, 600.00, 0.00, 1800.00, 1750.00, 1, 1, 240.00, 240.00, NULL, NULL, 0.00, 4250.00, NULL, 'Cochabamba - La Paz', 600.00, 300.00),
(12, '1234-ABC', 'Finalizado', 2, 3.530, '2026-09-22', '2026-09-22', '2026-09-23', 2700.00, 380.00, 90.00, 1600.00, 1480.00, 1, 1, 300.00, 300.00, NULL, NULL, 0.00, 3680.00, NULL, 'La Paz - Oruro - Cochabamba', 450.00, 150.00),
(13, '1234-ABC', 'Finalizado', 1, 1.765, '2026-09-24', '2026-09-24', '2026-09-24', 1100.00, 260.00, 0.00, 980.00, 0.00, 1, 0, 200.00, 0.00, NULL, NULL, 0.00, 1980.00, NULL, 'Cochabamba - Montero', 250.00, 60.00),
(14, '1234-ABC', 'Abierto', 2, NULL, '2026-09-26', NULL, NULL, 1500.00, 200.00, 0.00, 880.00, 0.00, 1, 0, 130.00, 0.00, NULL, NULL, 0.00, 1800.00, NULL, 'Santa Cruz - Cochabamba - Montero', 300.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `responsable`
--

CREATE TABLE `responsable` (
  `id_responsable` int(11) NOT NULL,
  `id_gasto` int(11) DEFAULT NULL,
  `id_personal` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `responsable`
--

INSERT INTO `responsable` (`id_responsable`, `id_gasto`, `id_personal`) VALUES
(24, 30, 1),
(25, 31, 3),
(26, 32, 4),
(27, 33, 2),
(28, 34, 6),
(29, 35, 8),
(30, 36, 7),
(31, 37, 9),
(32, 38, 10);

-- --------------------------------------------------------

--
-- Table structure for table `rueda_detalle`
--

CREATE TABLE `rueda_detalle` (
  `id_rd` int(11) NOT NULL,
  `id_rl` int(11) NOT NULL,
  `id_marca_rueda` int(11) NOT NULL,
  `codigo` varchar(20) DEFAULT '-',
  `precio_rueda` decimal(10,2) NOT NULL,
  `viajes_hechos` int(11) NOT NULL,
  `estado` enum('Disponible','Operativa','Baja') NOT NULL DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rueda_detalle`
--

INSERT INTO `rueda_detalle` (`id_rd`, `id_rl`, `id_marca_rueda`, `codigo`, `precio_rueda`, `viajes_hechos`, `estado`) VALUES
(1, 1, 1, '-', 50.00, 0, 'Baja'),
(2, 1, 1, '-', 50.00, 0, 'Baja'),
(5, 2, 1, 'SAN-8802', 150.00, 20, 'Operativa'),
(6, 2, 1, 'SAN-7741', 150.00, 24, 'Operativa'),
(7, 3, 4, '-', 200.00, 0, 'Operativa'),
(8, 3, 1, '-', 150.00, 0, 'Disponible'),
(9, 3, 4, '-', 200.00, 0, 'Operativa'),
(10, 3, 4, '-', 200.00, 0, 'Disponible'),
(11, 3, 1, '-', 150.00, 0, 'Operativa'),
(12, 3, 1, '-', 150.00, 0, 'Disponible'),
(13, 3, 4, '-', 200.00, 0, 'Disponible'),
(16, 4, 4, '-', 200.00, 0, 'Operativa'),
(17, 4, 4, 'MIC-2087', 200.00, 44, 'Operativa'),
(18, 4, 4, 'MIC-3315', 200.00, 41, 'Operativa'),
(19, 4, 1, 'SAN-9014', 150.00, 11, 'Operativa'),
(20, 4, 1, 'SAN-1163', 150.00, 4, 'Operativa'),
(21, 4, 4, '-', 200.00, 0, 'Disponible'),
(22, 4, 4, '-', 200.00, 0, 'Disponible'),
(23, 4, 1, '-', 150.00, 0, 'Disponible'),
(24, 4, 1, '-', 150.00, 0, 'Disponible'),
(25, 4, 4, '-', 200.00, 0, 'Disponible'),
(26, 4, 4, '-', 200.00, 0, 'Disponible'),
(27, 4, 1, '-', 150.00, 0, 'Disponible'),
(28, 5, 4, '-', 200.00, 0, 'Operativa'),
(29, 6, 1, '-', 150.00, 0, 'Disponible'),
(30, 7, 1, '-', 150.00, 0, 'Operativa'),
(31, 7, 4, '-', 200.00, 0, 'Disponible'),
(35, 10, 4, 'MIC-1042', 250.00, 52, 'Operativa'),
(36, 10, 1, 'SAN-1229', 150.00, 0, 'Operativa'),
(37, 11, 4, '-', 250.00, 0, 'Disponible'),
(38, 11, 1, '-', 100.00, 0, 'Disponible');

-- --------------------------------------------------------

--
-- Table structure for table `rueda_flota`
--

CREATE TABLE `rueda_flota` (
  `id_rf` int(11) NOT NULL,
  `id_rd` int(11) DEFAULT NULL,
  `placa` varchar(10) NOT NULL DEFAULT '-',
  `id_pr` int(11) DEFAULT NULL,
  `viajes_hechos` int(11) DEFAULT 0,
  `estado` enum('Operativa','Baja') DEFAULT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `detalle` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rueda_flota`
--

INSERT INTO `rueda_flota` (`id_rf`, `id_rd`, `placa`, `id_pr`, `viajes_hechos`, `estado`, `fecha_instalacion`, `detalle`) VALUES
(1, 7, '1803-BNE', NULL, 0, 'Baja', '2026-09-02', ''),
(2, 9, '1803-BNE', NULL, 0, 'Operativa', '2026-09-02', ''),
(3, 7, '2447-CPE', NULL, 0, 'Operativa', '2026-09-02', ''),
(4, 11, '1803-BNE', NULL, 0, 'Operativa', '2026-09-02', ''),
(5, 28, '1803-BNE', NULL, 0, 'Baja', '2026-09-02', ''),
(6, 28, '2447-CPE', NULL, 0, 'Operativa', '2026-09-02', ''),
(7, 16, '2550-TFU', NULL, 0, 'Operativa', '2026-09-05', ''),
(8, 30, '2447-CPE', NULL, 0, 'Operativa', '2026-09-09', ''),
(65, 35, '1234-ABC', 34, 52, 'Operativa', '2025-11-08', '295/80R22.5'),
(66, 17, '1234-ABC', 35, 44, 'Operativa', '2025-12-02', '295/80R22.5'),
(67, 18, '1234-ABC', 36, 41, 'Operativa', '2026-01-14', '275/70R22.5'),
(68, 6, '1234-ABC', 37, 24, 'Operativa', '2026-03-21', '11R22.5'),
(69, 5, '1234-ABC', 38, 20, 'Operativa', '2026-04-30', '11R22.5'),
(70, 19, '1234-ABC', 39, 11, 'Operativa', '2026-07-11', '11R22.5'),
(71, 20, '1234-ABC', 40, 4, 'Operativa', '2026-09-05', '275/70R22.5'),
(72, 36, '1234-ABC', 41, 0, 'Operativa', '2026-09-25', '275/70R22.5');

-- --------------------------------------------------------

--
-- Table structure for table `rueda_lote`
--

CREATE TABLE `rueda_lote` (
  `id_rl` int(11) NOT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_estimado` decimal(10,2) DEFAULT NULL,
  `precio_real` decimal(10,2) DEFAULT NULL,
  `estado_precio` enum('Subio','Bajo','Mantuvo') DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `estado` enum('Operativo','Eliminado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rueda_lote`
--

INSERT INTO `rueda_lote` (`id_rl`, `precio_total`, `precio_estimado`, `precio_real`, `estado_precio`, `cantidad`, `stock`, `fecha_compra`, `estado`) VALUES
(1, 100.00, 300.00, 100.00, 'Bajo', 2, 2, '2026-08-26', 'Operativo'),
(2, 300.00, 300.00, 300.00, 'Mantuvo', 2, 0, '2026-08-30', 'Operativo'),
(3, 1250.00, 1250.00, 1250.00, 'Mantuvo', 7, 7, '2026-08-30', 'Operativo'),
(4, 2150.00, 2150.00, 2150.00, 'Mantuvo', 12, 12, '2026-09-02', 'Operativo'),
(5, 200.00, 200.00, 200.00, 'Mantuvo', 1, 1, '2026-09-02', 'Eliminado'),
(6, 150.00, 150.00, 150.00, 'Mantuvo', 1, 1, '2026-09-02', 'Operativo'),
(7, 350.00, 350.00, 350.00, 'Mantuvo', 2, 2, '2026-09-07', 'Operativo'),
(10, 400.00, 350.00, 400.00, 'Subio', 2, 0, '2026-09-09', 'Operativo'),
(11, 350.00, 350.00, 350.00, 'Mantuvo', 2, 2, '2026-09-09', 'Operativo');

-- --------------------------------------------------------

--
-- Table structure for table `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sucursal`
--

INSERT INTO `sucursal` (`id_sucursal`, `nombre`) VALUES
(1, 'Sucursal CBBA.'),
(2, 'Sucursal SC.'),
(3, 'No Tiene');

-- --------------------------------------------------------

--
-- Table structure for table `tipo_personal`
--

CREATE TABLE `tipo_personal` (
  `id_te` int(11) NOT NULL,
  `nombre_tipo_personal` varchar(50) DEFAULT NULL,
  `sucursal` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipo_personal`
--

INSERT INTO `tipo_personal` (`id_te`, `nombre_tipo_personal`, `sucursal`) VALUES
(1, 'Chofer Principal', 0),
(2, 'Chofer Auxiliar', 0),
(3, 'Ayudante', 0),
(4, 'Boletero', 1),
(8, 'encomiendas', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ubicacion`
--

CREATE TABLE `ubicacion` (
  `id_ubicacion` int(11) NOT NULL,
  `nombre_ubicacion` varchar(25) DEFAULT NULL,
  `precio_peaje` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ubicacion`
--

INSERT INTO `ubicacion` (`id_ubicacion`, `nombre_ubicacion`, `precio_peaje`) VALUES
(1, 'Cochabamba', 150.00),
(2, 'La Paz', 250.00),
(3, 'Santa Cruz', 250.00),
(4, 'Montero', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ubicaciones_llegada`
--

CREATE TABLE `ubicaciones_llegada` (
  `id_ubicaciones_llegada` int(11) NOT NULL,
  `nombre_ubicaciones_llegada` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ubicaciones_llegada`
--

INSERT INTO `ubicaciones_llegada` (`id_ubicaciones_llegada`, `nombre_ubicaciones_llegada`) VALUES
(1, 'La Paz - Santa Cruz'),
(2, 'Santa Cruz - La Paz');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aceite_detalle`
--
ALTER TABLE `aceite_detalle`
  ADD PRIMARY KEY (`id_ad`);

--
-- Indexes for table `aceite_flota`
--
ALTER TABLE `aceite_flota`
  ADD PRIMARY KEY (`id_af`);

--
-- Indexes for table `aceite_lote`
--
ALTER TABLE `aceite_lote`
  ADD PRIMARY KEY (`id_al`);

--
-- Indexes for table `anomalia`
--
ALTER TABLE `anomalia`
  ADD PRIMARY KEY (`id_anomalia`);

--
-- Indexes for table `anomalia_sistema`
--
ALTER TABLE `anomalia_sistema`
  ADD PRIMARY KEY (`id_as`),
  ADD KEY `idx_as_placa` (`placa`),
  ADD KEY `idx_as_fecha` (`fecha`);

--
-- Indexes for table `detalle`
--
ALTER TABLE `detalle`
  ADD PRIMARY KEY (`id_detalle`);

--
-- Indexes for table `detalle_estimado`
--
ALTER TABLE `detalle_estimado`
  ADD PRIMARY KEY (`id_detalle_estimado`);

--
-- Indexes for table `diesel`
--
ALTER TABLE `diesel`
  ADD PRIMARY KEY (`id_diesel`);

--
-- Indexes for table `flota`
--
ALTER TABLE `flota`
  ADD PRIMARY KEY (`placa`);

--
-- Indexes for table `flota_estados`
--
ALTER TABLE `flota_estados`
  ADD PRIMARY KEY (`id_fe`);

--
-- Indexes for table `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id_gasto`);

--
-- Indexes for table `gasto_estimado`
--
ALTER TABLE `gasto_estimado`
  ADD PRIMARY KEY (`id_gasto_estimado`);

--
-- Indexes for table `marca_aceite`
--
ALTER TABLE `marca_aceite`
  ADD PRIMARY KEY (`id_marca_aceite`);

--
-- Indexes for table `marca_rueda`
--
ALTER TABLE `marca_rueda`
  ADD PRIMARY KEY (`id_marca_rueda`);

--
-- Indexes for table `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id_personal`);

--
-- Indexes for table `personal_reporte`
--
ALTER TABLE `personal_reporte`
  ADD PRIMARY KEY (`id_er`);

--
-- Indexes for table `posicion_rueda`
--
ALTER TABLE `posicion_rueda`
  ADD PRIMARY KEY (`id_pr`);

--
-- Indexes for table `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`id_reporte`);

--
-- Indexes for table `responsable`
--
ALTER TABLE `responsable`
  ADD PRIMARY KEY (`id_responsable`);

--
-- Indexes for table `rueda_detalle`
--
ALTER TABLE `rueda_detalle`
  ADD PRIMARY KEY (`id_rd`);

--
-- Indexes for table `rueda_flota`
--
ALTER TABLE `rueda_flota`
  ADD PRIMARY KEY (`id_rf`);

--
-- Indexes for table `rueda_lote`
--
ALTER TABLE `rueda_lote`
  ADD PRIMARY KEY (`id_rl`);

--
-- Indexes for table `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`);

--
-- Indexes for table `tipo_personal`
--
ALTER TABLE `tipo_personal`
  ADD PRIMARY KEY (`id_te`);

--
-- Indexes for table `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD PRIMARY KEY (`id_ubicacion`);

--
-- Indexes for table `ubicaciones_llegada`
--
ALTER TABLE `ubicaciones_llegada`
  ADD PRIMARY KEY (`id_ubicaciones_llegada`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aceite_detalle`
--
ALTER TABLE `aceite_detalle`
  MODIFY `id_ad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `aceite_flota`
--
ALTER TABLE `aceite_flota`
  MODIFY `id_af` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `aceite_lote`
--
ALTER TABLE `aceite_lote`
  MODIFY `id_al` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `anomalia`
--
ALTER TABLE `anomalia`
  MODIFY `id_anomalia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `anomalia_sistema`
--
ALTER TABLE `anomalia_sistema`
  MODIFY `id_as` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `detalle`
--
ALTER TABLE `detalle`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `detalle_estimado`
--
ALTER TABLE `detalle_estimado`
  MODIFY `id_detalle_estimado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `diesel`
--
ALTER TABLE `diesel`
  MODIFY `id_diesel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `flota_estados`
--
ALTER TABLE `flota_estados`
  MODIFY `id_fe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `gasto`
--
ALTER TABLE `gasto`
  MODIFY `id_gasto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `gasto_estimado`
--
ALTER TABLE `gasto_estimado`
  MODIFY `id_gasto_estimado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `marca_aceite`
--
ALTER TABLE `marca_aceite`
  MODIFY `id_marca_aceite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `marca_rueda`
--
ALTER TABLE `marca_rueda`
  MODIFY `id_marca_rueda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal`
--
ALTER TABLE `personal`
  MODIFY `id_personal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `personal_reporte`
--
ALTER TABLE `personal_reporte`
  MODIFY `id_er` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posicion_rueda`
--
ALTER TABLE `posicion_rueda`
  MODIFY `id_pr` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `reporte`
--
ALTER TABLE `reporte`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `responsable`
--
ALTER TABLE `responsable`
  MODIFY `id_responsable` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `rueda_detalle`
--
ALTER TABLE `rueda_detalle`
  MODIFY `id_rd` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `rueda_flota`
--
ALTER TABLE `rueda_flota`
  MODIFY `id_rf` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `rueda_lote`
--
ALTER TABLE `rueda_lote`
  MODIFY `id_rl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id_sucursal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tipo_personal`
--
ALTER TABLE `tipo_personal`
  MODIFY `id_te` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `id_ubicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ubicaciones_llegada`
--
ALTER TABLE `ubicaciones_llegada`
  MODIFY `id_ubicaciones_llegada` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
