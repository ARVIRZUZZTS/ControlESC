CREATE TABLE `flota` (
  `placa` varchar(10) NOT NULL,
  `propietario` varchar(100) DEFAULT NULL,
  `conductor1` varchar(100) DEFAULT NULL,
  `licencia1` varchar(20) DEFAULT NULL,
  `conductor2` varchar(100) DEFAULT NULL,
  `licencia2` varchar(20) DEFAULT NULL,
  `nombre_planilla` varchar(30) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`placa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;