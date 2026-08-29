-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 29, 2026 at 03:31 AM
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
-- Table structure for table `aceite_flota`
--

CREATE TABLE `aceite_flota` (
  `id_af` int(11) NOT NULL,
  `id_al` int(11) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `unidad_aceite` decimal(10,2) DEFAULT NULL,
  `estado` decimal(10,2) DEFAULT NULL,
  `fecha_uso` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `aceite_lote`
--

CREATE TABLE `aceite_lote` (
  `id_al` int(11) NOT NULL,
  `id_marca_aceite` int(11) DEFAULT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `id_ua` int(2) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aceite_lote`
--

INSERT INTO `aceite_lote` (`id_al`, `id_marca_aceite`, `precio_total`, `precio_unitario`, `id_ua`, `cantidad`, `stock`, `fecha_compra`) VALUES
(1, 1, 300.00, 150.00, 3, 2.000, NULL, '2026-04-03'),
(2, 1, 300.00, 300.00, 2, 1.000, NULL, '2026-04-02'),
(3, 1, 300.00, 100.00, 1, 3.000, NULL, '2026-04-01'),
(4, 1, 300.00, 150.00, 2, 2.000, NULL, '2026-04-01'),
(5, 1, 300.00, 75.00, 1, 4.000, NULL, '2026-03-07'),
(6, 2, 300.00, 150.00, 1, 2.000, NULL, '2026-03-07'),
(7, 2, 300.00, 150.00, 1, 2.000, NULL, '2026-03-07'),
(8, 2, 300.00, 100.00, 3, 3.000, NULL, '2026-03-02'),
(9, 2, 300.00, 150.00, 1, 2.000, NULL, '2026-03-02'),
(10, 2, 300.00, 300.00, 2, 1.000, NULL, '2026-03-01'),
(11, 2, 300.00, 150.00, 3, 2.000, NULL, '2026-03-03');

-- --------------------------------------------------------

--
-- Table structure for table `descripcion`
--

CREATE TABLE `descripcion` (
  `id_descripcion` int(11) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detalle`
--

CREATE TABLE `detalle` (
  `id_detalle` int(11) NOT NULL,
  `id_descripcion` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `tipo` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `empleado` varchar(150) DEFAULT NULL,
  `mensual` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `id_te` int(11) DEFAULT NULL,
  `fecha_contrato` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `empleado`
--

INSERT INTO `empleado` (`id_empleado`, `empleado`, `mensual`, `total`, `id_te`, `fecha_contrato`) VALUES
(1, 'ERICK MENDOZA MONTESINOS', 1500.00, 0.00, 1, '2026-04-10'),
(2, 'WILSON LAZARTE MONTAÑO', 1500.00, 0.00, 1, '2026-04-10'),
(3, 'JUAN QUISPE LLAMPAS', 1500.00, 0.00, 1, '2026-04-10'),
(4, 'MARIO CRUZ LACATO', 1500.00, 0.00, 1, '2026-04-10'),
(5, '-', 1500.00, 0.00, 1, '2026-04-10'),
(6, 'JHONNY VARGAS', 1500.00, 0.00, 1, '2026-04-10'),
(7, 'ALEX SANDRO VILLARROEL ROMERO', 1500.00, 0.00, 1, '2026-04-10'),
(8, 'VICTOR HUGO VELARSCO CAERO', 1500.00, 0.00, 1, '2026-04-10'),
(9, 'ELOY TERCEROS MONTAÑO', 1500.00, 0.00, 1, '2026-04-10'),
(10, 'RICHAR IRUSTA JIMENEZ', 1500.00, 0.00, 1, '2026-04-10'),
(11, 'CALIXTO ANDIA QUINTEROS', 1500.00, 0.00, 1, '2026-04-10'),
(12, 'REINALDO JORGE OCZACHOQUE', 1500.00, 0.00, 1, '2026-04-10'),
(13, 'DEMETRIO GALINDO MERIDA', 1500.00, 0.00, 1, '2026-04-10'),
(14, 'ARCENIO CABALLERO V.', 1500.00, 0.00, 1, '2026-04-10'),
(15, 'ARIEL VARGAS VALLEJOS', 1500.00, 0.00, 1, '2026-04-10'),
(16, 'JHONNY VARGAS HERBAS', 1500.00, 0.00, 1, '2026-04-10'),
(17, 'HUGO GABRIEL RASGUIDO', 1500.00, 0.00, 1, '2026-04-10');

-- --------------------------------------------------------

--
-- Table structure for table `empleado_reporte`
--

CREATE TABLE `empleado_reporte` (
  `id_er` int(11) NOT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL,
  `id_gasto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id_u` int(11) DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flota`
--

INSERT INTO `flota` (`placa`, `propietario`, `chofer1`, `chofer2`, `id_fe`, `id_u`, `viajes`) VALUES
('1194-UKE', 'ERICK MENDOZA', 1, 0, 1, 1, 0),
('1461-KUX', 'VIVIAN CABALLERO', 2, 0, 1, 1, 0),
('1580-EYR', 'JUAN QUISPE LLAMPA', 3, 0, 1, 1, 0),
('1800-FIU', 'MIGUELINA PEREDO', 4, 0, 1, 1, 0),
('1803-BNE', 'CARMEN VELASCO', 5, 0, 1, 1, 0),
('2130-YXG', 'JHONNY VARGAS', 6, 0, 1, 1, 0),
('2218-PCT', '-', 7, 0, 1, 1, 0),
('2264-KGD', 'VICTOR HUGO VELASCO', 8, 0, 1, 1, 0),
('2447-CPE', 'ELOY TERCEROS', 9, 0, 1, 1, 0),
('2447-DKT', 'RICHAR IRUSTA', 10, 0, 1, 1, 0),
('2494-RXU', 'JHONNY CABALLERO', 11, 0, 1, 1, 0),
('2537-DER', 'REINALDO ALBERTO', 12, 0, 1, 1, 0),
('2550-TFU', 'RUTH CABALLERO', 13, 0, 1, 1, 0),
('2701-YNF', 'JHONNY CABALLERO', 14, 0, 1, 1, 0),
('2830-UTA', 'JHONNY CABALLERO', 15, 0, 1, 1, 0),
('2996-UKF', 'JHONNY CABALLERO', 16, 0, 1, 1, 0),
('3056-EAY', 'JHONNY CABALLERO', 17, 0, 1, 1, 0);

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
(3, 'Mecanico');

-- --------------------------------------------------------

--
-- Table structure for table `gasto`
--

CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `id_detalle` int(11) DEFAULT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marca_aceite`
--

CREATE TABLE `marca_aceite` (
  `id_marca_aceite` int(11) NOT NULL,
  `nombre_marca_aceite` varchar(100) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_ua` int(11) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marca_aceite`
--

INSERT INTO `marca_aceite` (`id_marca_aceite`, `nombre_marca_aceite`, `precio`, `id_ua`, `media_viajes`) VALUES
(1, 'marca', 150.00, 2, 30),
(2, 'santos', 300.00, 1, 30);

-- --------------------------------------------------------

--
-- Table structure for table `marca_rueda`
--

CREATE TABLE `marca_rueda` (
  `id_marca_rueda` int(11) NOT NULL,
  `nombre_marca_rueda` varchar(100) NOT NULL,
  `medida` decimal(10,2) DEFAULT NULL,
  `serie` varchar(50) DEFAULT NULL,
  `trilla` varchar(50) DEFAULT NULL,
  `aro` varchar(50) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marca_rueda`
--

INSERT INTO `marca_rueda` (`id_marca_rueda`, `nombre_marca_rueda`, `medida`, `serie`, `trilla`, `aro`, `media_viajes`) VALUES
(1, 'Santos', 23.00, '23', '23', '23', 23);

-- --------------------------------------------------------

--
-- Table structure for table `posicion_rueda`
--

CREATE TABLE `posicion_rueda` (
  `id_pr` int(11) NOT NULL,
  `nombre_posicion` varchar(50) NOT NULL DEFAULT '-',
  `placa` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reporte`
--

CREATE TABLE `reporte` (
  `id_rep` int(11) NOT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `fecha_partida` date DEFAULT NULL,
  `fecha_retorno` date DEFAULT NULL,
  `fecha_llegada` date DEFAULT NULL,
  `liq_pasajes` decimal(10,2) DEFAULT NULL,
  `liq_encomiendas` decimal(10,2) DEFAULT NULL,
  `diesel_partida` decimal(10,2) DEFAULT NULL,
  `diesel_llegada` decimal(10,2) DEFAULT NULL,
  `dpFactura` tinyint(1) DEFAULT NULL,
  `drFactura` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rueda_flota`
--

CREATE TABLE `rueda_flota` (
  `id_rf` int(11) NOT NULL,
  `id_rl` int(11) DEFAULT NULL,
  `placa` varchar(10) NOT NULL DEFAULT '-',
  `codigo` varchar(20) NOT NULL,
  `viajes_hechos` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `fecha_uso` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rueda_lote`
--

CREATE TABLE `rueda_lote` (
  `id_rl` int(11) NOT NULL,
  `id_marca_rueda` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rueda_lote`
--

INSERT INTO `rueda_lote` (`id_rl`, `id_marca_rueda`, `precio_unitario`, `precio_total`, `cantidad`, `stock`, `fecha_compra`) VALUES
(1, 1, 50.00, 100.00, 2, 2, '2026-08-26');

-- --------------------------------------------------------

--
-- Table structure for table `tipo_empleado`
--

CREATE TABLE `tipo_empleado` (
  `id_te` int(11) NOT NULL,
  `tipo_empleado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipo_empleado`
--

INSERT INTO `tipo_empleado` (`id_te`, `tipo_empleado`) VALUES
(1, 'Chofer Principal'),
(2, 'Chofer Auxiliar'),
(3, 'Ayudante'),
(4, 'Boletero'),
(5, 'Ayudante');

-- --------------------------------------------------------

--
-- Table structure for table `ubicacion`
--

CREATE TABLE `ubicacion` (
  `id_u` int(11) NOT NULL,
  `nombre_ubicacion` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ubicacion`
--

INSERT INTO `ubicacion` (`id_u`, `nombre_ubicacion`) VALUES
(1, 'Cochabamba'),
(2, 'La Paz'),
(3, 'Santa Cruz'),
(4, 'Montero');

-- --------------------------------------------------------

--
-- Table structure for table `unidad_aceite`
--

CREATE TABLE `unidad_aceite` (
  `id_ua` int(11) NOT NULL,
  `unidad_aceite` varchar(30) NOT NULL,
  `conversion` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unidad_aceite`
--

INSERT INTO `unidad_aceite` (`id_ua`, `unidad_aceite`, `conversion`) VALUES
(1, 'LITROS', 1.000),
(2, 'GALONES', 3.875),
(3, 'BALDES', 30.000);