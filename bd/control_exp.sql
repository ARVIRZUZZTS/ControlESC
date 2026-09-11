-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2026 at 04:27 AM
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
  `precio_ingresado` decimal(10,2) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `estado` enum('Agotado','En Uso','Almacen') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `aceite_flota`
--

CREATE TABLE `aceite_flota` (
  `id_af` int(11) NOT NULL,
  `id_ad` int(11) DEFAULT NULL,
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
  `id_marca_aceite` int(11) NOT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `stock_total` decimal(10,3) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aceite_lote`
--

INSERT INTO `aceite_lote` (`id_al`, `id_marca_aceite`, `precio_total`, `cantidad`, `stock_total`, `fecha_compra`) VALUES
(1, 1, 300.00, 2.000, 2.000, '2026-04-03'),
(2, 1, 300.00, 1.000, 1.000, '2026-04-02'),
(3, 1, 300.00, 3.000, 3.000, '2026-04-01'),
(4, 1, 300.00, 2.000, 2.000, '2026-04-01'),
(5, 1, 300.00, 4.000, 4.000, '2026-03-07'),
(6, 1, 300.00, 2.000, 2.000, '2026-03-07'),
(7, 1, 300.00, 2.000, 2.000, '2026-03-07'),
(8, 1, 300.00, 3.000, 3.000, '2026-03-02'),
(9, 1, 300.00, 2.000, 2.000, '2026-03-02'),
(10, 1, 300.00, 1.000, 1.000, '2026-03-01'),
(11, 1, 300.00, 2.000, 2.000, '2026-03-03');

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
(2, 'WILSON LAZARTE MONTAÃ‘O', 1500.00, 0.00, 1, '2026-04-10'),
(3, 'JUAN QUISPE LLAMPAS', 1500.00, 0.00, 1, '2026-04-10'),
(4, 'MARIO CRUZ LACATO', 1500.00, 0.00, 1, '2026-04-10'),
(5, '-', 1500.00, 0.00, 1, '2026-04-10'),
(6, 'JHONNY VARGAS', 1500.00, 0.00, 1, '2026-04-10'),
(7, 'ALEX SANDRO VILLARROEL ROMERO', 1500.00, 0.00, 1, '2026-04-10'),
(8, 'VICTOR HUGO VELARSCO CAERO', 1500.00, 0.00, 1, '2026-04-10'),
(9, 'ELOY TERCEROS MONTAÃ‘O', 1500.00, 0.00, 1, '2026-04-10'),
(10, 'RICHAR IRUSTA JIMENEZ', 1500.00, 0.00, 1, '2026-04-10'),
(11, 'CALIXTO ANDIA QUINTEROS', 1500.00, 0.00, 1, '2026-04-10'),
(12, 'REINALDO JORGE OCZACHOQUE', 1500.00, 0.00, 1, '2026-04-10'),
(13, 'DEMETRIO GALINDO MERIDA', 1500.00, 0.00, 1, '2026-04-10'),
(14, 'ARCENIO CABALLERO V.', 1500.00, 0.00, 1, '2026-04-10'),
(15, 'ARIEL VARGAS VALLEJOS', 1500.00, 0.00, 1, '2026-04-10'),
(16, 'JHONNY VARGAS HERBAS', 1500.00, 0.00, 1, '2026-04-10'),
(17, 'HUGO GABRIEL RASGUIDO', 1500.00, 0.00, 1, '2026-04-10'),
(20, 'GABRIEL RENE MORENO', NULL, NULL, 2, NULL);

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
  `viajes` int(11) DEFAULT NULL,
  `capacidad_aceite` decimal(10,3) NOT NULL DEFAULT 0.000,
  `aceite_actual` decimal(10,3) NOT NULL DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flota`
--

INSERT INTO `flota` (`placa`, `propietario`, `chofer1`, `chofer2`, `id_fe`, `id_u`, `viajes`, `capacidad_aceite`, `aceite_actual`) VALUES
('1194-UKE', 'ERICK MENDOZA', 1, 0, 1, 1, 0, 30.000, 0.000),
('1234-ABC', 'David Chavez', 15, 0, 1, 2, 0, 30.000, 0.000),
('1461-KUX', 'VIVIAN CABALLERO', 2, 0, 1, 1, 0, 30.000, 0.000),
('1580-EYR', 'JUAN QUISPE LLAMPA', 3, 0, 1, 1, 0, 30.000, 0.000),
('1800-FIU', 'MIGUELINA PEREDO', 4, 0, 1, 1, 0, 30.000, 0.000),
('1803-BNE', 'CARMEN VELASCO', 5, 0, 1, 1, 0, 30.000, 0.000),
('2130-YXG', 'JHONNY VARGAS', 6, 0, 1, 1, 0, 30.000, 0.000),
('2218-PCT', '-', 7, 0, 1, 1, 0, 30.000, 0.000),
('2264-KGD', 'VICTOR HUGO VELASCO', 8, 0, 1, 1, 0, 30.000, 0.000),
('2447-CPE', 'ELOY TERCEROS', 9, 0, 1, 1, 0, 30.000, 0.000),
('2447-DKT', 'RICHAR IRUSTA', 10, 0, 1, 1, 0, 30.000, 0.000),
('2494-RXU', 'JHONNY CABALLERO', 11, 0, 1, 1, 0, 30.000, 0.000),
('2537-DER', 'REINALDO ALBERTO', 12, 0, 1, 1, 0, 30.000, 0.000),
('2550-TFU', 'RUTH CABALLERO', 13, 0, 1, 1, 0, 30.000, 0.000),
('2701-YNF', 'JHONNY CABALLERO', 14, 0, 1, 1, 0, 30.000, 0.000),
('2830-UTA', 'JHONNY CABALLERO', 15, 0, 1, 1, 0, 30.000, 0.000),
('2996-UKF', 'JHONNY CABALLERO', 16, 0, 1, 1, 0, 30.000, 0.000),
('3056-EAY', 'JHONNY CABALLERO', 17, 0, 1, 1, 0, 30.000, 0.000);

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
  `id_ua` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marca_aceite`
--

INSERT INTO `marca_aceite` (`id_marca_aceite`, `nombre_marca_aceite`, `precio`, `id_ua`) VALUES
(1, 'marca', 150.00, 2),
(2, 'santos', 300.00, 1);

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
(1, 1, 1, '-', 50.00, 0, 'Disponible'),
(2, 1, 1, '-', 50.00, 0, 'Disponible'),
(5, 2, 1, '-', 150.00, 0, 'Disponible'),
(6, 2, 1, '-', 150.00, 0, 'Disponible'),
(7, 3, 4, '-', 200.00, 0, 'Operativa'),
(8, 3, 1, '-', 150.00, 0, 'Disponible'),
(9, 3, 4, '-', 200.00, 0, 'Operativa'),
(10, 3, 4, '-', 200.00, 0, 'Disponible'),
(11, 3, 1, '-', 150.00, 0, 'Operativa'),
(12, 3, 1, '-', 150.00, 0, 'Disponible'),
(13, 3, 4, '-', 200.00, 0, 'Disponible'),
(16, 4, 4, '-', 200.00, 0, 'Operativa'),
(17, 4, 4, '-', 200.00, 0, 'Disponible'),
(18, 4, 4, '-', 200.00, 0, 'Disponible'),
(19, 4, 1, '-', 150.00, 0, 'Disponible'),
(20, 4, 1, '-', 150.00, 0, 'Disponible'),
(21, 4, 4, '-', 200.00, 0, 'Disponible'),
(22, 4, 4, '-', 200.00, 0, 'Disponible'),
(23, 4, 1, '-', 150.00, 0, 'Disponible'),
(24, 4, 1, '-', 150.00, 0, 'Disponible'),
(25, 4, 4, '-', 200.00, 0, 'Disponible'),
(26, 4, 4, '-', 200.00, 0, 'Disponible'),
(27, 4, 1, '-', 150.00, 0, 'Disponible'),
(28, 5, 4, '-', 200.00, 0, 'Operativa'),
(29, 6, 1, '-', 150.00, 0, 'Disponible');

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
`fecha_instalacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rueda_flota`
--

INSERT INTO `rueda_flota` (`id_rf`, `id_rd`, `placa`, `viajes_hechos`, `estado`, `fecha_instalacion`) VALUES
(1, 7, '1803-BNE', 0, 'Baja', '2026-09-02'),
(2, 9, '1803-BNE', 0, 'Operativa', '2026-09-02'),
(3, 7, '2447-CPE', 0, 'Operativa', '2026-09-02'),
(4, 11, '1803-BNE', 0, 'Operativa', '2026-09-02'),
(5, 28, '1803-BNE', 0, 'Baja', '2026-09-02'),
(6, 28, '2447-CPE', 0, 'Operativa', '2026-09-02'),
(7, 16, '2550-TFU', 0, 'Operativa', '2026-09-05');

-- --------------------------------------------------------

--
-- Table structure for table `rueda_lote`
--

CREATE TABLE `rueda_lote` (
  `id_rl` int(11) NOT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `estado` enum('Operativo','Eliminado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rueda_lote`
--

INSERT INTO `rueda_lote` (`id_rl`, `precio_total`, `cantidad`, `stock`, `fecha_compra`, `estado`) VALUES
(1, 100.00, 2, 2, '2026-08-26', 'Operativo'),
(2, 300.00, 2, 2, '2026-08-30', 'Operativo'),
(3, 1250.00, 7, 7, '2026-08-30', 'Operativo'),
(4, 2150.00, 12, 12, '2026-09-02', 'Operativo'),
(5, 200.00, 1, 1, '2026-09-02', 'Eliminado'),
(6, 150.00, 1, 1, '2026-09-02', 'Operativo');

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
-- Indexes for table `descripcion`
--
ALTER TABLE `descripcion`
  ADD PRIMARY KEY (`id_descripcion`);

--
-- Indexes for table `detalle`
--
ALTER TABLE `detalle`
  ADD PRIMARY KEY (`id_detalle`);

--
-- Indexes for table `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`);

--
-- Indexes for table `empleado_reporte`
--
ALTER TABLE `empleado_reporte`
  ADD PRIMARY KEY (`id_er`);

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
-- Indexes for table `posicion_rueda`
--
ALTER TABLE `posicion_rueda`
  ADD PRIMARY KEY (`id_pr`);

--
-- Indexes for table `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`id_rep`);

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
-- Indexes for table `tipo_empleado`
--
ALTER TABLE `tipo_empleado`
  ADD PRIMARY KEY (`id_te`);

--
-- Indexes for table `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD PRIMARY KEY (`id_u`);

--
-- Indexes for table `unidad_aceite`
--
ALTER TABLE `unidad_aceite`
  ADD PRIMARY KEY (`id_ua`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aceite_detalle`
--
ALTER TABLE `aceite_detalle`
  MODIFY `id_ad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `aceite_flota`
--
ALTER TABLE `aceite_flota`
  MODIFY `id_af` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `aceite_lote`
--
ALTER TABLE `aceite_lote`
  MODIFY `id_al` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `descripcion`
--
ALTER TABLE `descripcion`
  MODIFY `id_descripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `detalle`
--
ALTER TABLE `detalle`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `empleado_reporte`
--
ALTER TABLE `empleado_reporte`
  MODIFY `id_er` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `flota_estados`
--
ALTER TABLE `flota_estados`
  MODIFY `id_fe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `marca_aceite`
--
ALTER TABLE `marca_aceite`
  MODIFY `id_marca_aceite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `marca_rueda`
--
ALTER TABLE `marca_rueda`
  MODIFY `id_marca_rueda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `posicion_rueda`
--
ALTER TABLE `posicion_rueda`
  MODIFY `id_pr` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reporte`
--
ALTER TABLE `reporte`
  MODIFY `id_rep` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rueda_detalle`
--
ALTER TABLE `rueda_detalle`
  MODIFY `id_rd` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `rueda_flota`
--
ALTER TABLE `rueda_flota`
  MODIFY `id_rf` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `rueda_lote`
--
ALTER TABLE `rueda_lote`
  MODIFY `id_rl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tipo_empleado`
--
ALTER TABLE `tipo_empleado`
  MODIFY `id_te` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `id_u` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `unidad_aceite`
--
ALTER TABLE `unidad_aceite`
  MODIFY `id_ua` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

