-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: controlexp2
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aceite_detalle`
--

DROP TABLE IF EXISTS `aceite_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aceite_detalle` (
  `id_ad` int(11) NOT NULL AUTO_INCREMENT,
  `id_al` int(11) DEFAULT NULL,
  `id_marca_aceite` int(11) DEFAULT NULL,
  `precio_ingresado` decimal(10,2) DEFAULT NULL,
  `stock` decimal(10,3) DEFAULT NULL,
  `estado` enum('Agotado','En Uso','Almacen') DEFAULT NULL,
  PRIMARY KEY (`id_ad`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aceite_detalle`
--

LOCK TABLES `aceite_detalle` WRITE;
/*!40000 ALTER TABLE `aceite_detalle` DISABLE KEYS */;
INSERT INTO `aceite_detalle` VALUES (4,14,1,0.00,3.000,'Almacen'),(5,15,1,0.00,3.000,'Almacen'),(6,15,2,0.00,2.000,'Almacen'),(9,17,1,300.00,2.000,'Almacen'),(10,17,2,1000.00,3.000,'Almacen'),(11,18,1,150.00,1.000,'Almacen'),(13,20,2,600.00,2.000,'Almacen');
/*!40000 ALTER TABLE `aceite_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aceite_flota`
--

DROP TABLE IF EXISTS `aceite_flota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aceite_flota` (
  `id_af` int(11) NOT NULL AUTO_INCREMENT,
  `id_ad` int(11) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `estado` enum('En Uso','Agotado') DEFAULT 'En Uso',
  `fecha_uso` date DEFAULT NULL,
  PRIMARY KEY (`id_af`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aceite_flota`
--

LOCK TABLES `aceite_flota` WRITE;
/*!40000 ALTER TABLE `aceite_flota` DISABLE KEYS */;
INSERT INTO `aceite_flota` VALUES (5,4,'1803-BNE',5.813,'En Uso','2026-09-07'),(6,9,'1803-BNE',5.813,'En Uso','2026-09-10'),(7,9,'1234-ABC',1.938,'En Uso','2026-09-12'),(8,10,'1234-ABC',0.750,'En Uso','2026-09-12');
/*!40000 ALTER TABLE `aceite_flota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aceite_lote`
--

DROP TABLE IF EXISTS `aceite_lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aceite_lote` (
  `id_al` int(11) NOT NULL AUTO_INCREMENT,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_estimado` decimal(10,2) DEFAULT NULL,
  `precio_real` decimal(10,2) DEFAULT NULL,
  `estado_precio` enum('Subio','Bajo','Mantuvo') DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `stock_total` decimal(10,3) DEFAULT NULL,
  `estado` enum('Operativo','Eliminado') NOT NULL DEFAULT 'Operativo',
  `fecha_compra` date DEFAULT NULL,
  PRIMARY KEY (`id_al`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aceite_lote`
--

LOCK TABLES `aceite_lote` WRITE;
/*!40000 ALTER TABLE `aceite_lote` DISABLE KEYS */;
INSERT INTO `aceite_lote` VALUES (1,300.00,0.00,300.00,'Subio',2,2.000,'Eliminado','2026-04-03'),(2,300.00,0.00,300.00,'Subio',1,1.000,'Eliminado','2026-04-02'),(3,300.00,0.00,300.00,'Subio',3,3.000,'Eliminado','2026-04-01'),(4,300.00,0.00,300.00,'Subio',2,2.000,'Eliminado','2026-04-01'),(5,300.00,0.00,300.00,'Subio',4,4.000,'Eliminado','2026-03-07'),(6,300.00,0.00,300.00,'Subio',2,2.000,'Eliminado','2026-03-07'),(7,300.00,0.00,300.00,'Subio',2,2.000,'Eliminado','2026-03-07'),(8,300.00,0.00,300.00,'Subio',3,3.000,'Eliminado','2026-03-02'),(9,300.00,0.00,300.00,'Subio',2,2.000,'Eliminado','2026-03-02'),(10,300.00,0.00,300.00,'Subio',1,1.000,'Eliminado','2026-03-01'),(11,300.00,0.00,300.00,'Subio',2,2.000,'Eliminado','2026-03-03'),(14,0.00,450.00,0.00,'Bajo',3,3.000,'Eliminado','2026-09-06'),(15,0.00,1050.00,0.00,'Bajo',5,5.000,'Eliminado','2026-09-06'),(17,1300.00,1200.00,1300.00,'Subio',5,5.000,'Eliminado','2026-09-09'),(18,150.00,150.00,150.00,'Mantuvo',1,1.000,'Eliminado','2026-09-09'),(20,660.00,600.00,660.00,'Subio',2,2.000,'Operativo','2026-09-12');
/*!40000 ALTER TABLE `aceite_lote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descripcion`
--

DROP TABLE IF EXISTS `descripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `descripcion` (
  `id_descripcion` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(500) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_descripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descripcion`
--

LOCK TABLES `descripcion` WRITE;
/*!40000 ALTER TABLE `descripcion` DISABLE KEYS */;
/*!40000 ALTER TABLE `descripcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle`
--

DROP TABLE IF EXISTS `detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_descripcion` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `tipo` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_detalle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle`
--

LOCK TABLES `detalle` WRITE;
/*!40000 ALTER TABLE `detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado`
--

DROP TABLE IF EXISTS `empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL AUTO_INCREMENT,
  `empleado` varchar(150) DEFAULT NULL,
  `mensual` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `id_te` int(11) DEFAULT NULL,
  `fecha_contrato` date DEFAULT current_timestamp(),
  PRIMARY KEY (`id_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado`
--

LOCK TABLES `empleado` WRITE;
/*!40000 ALTER TABLE `empleado` DISABLE KEYS */;
INSERT INTO `empleado` VALUES (1,'ERICK MENDOZA MONTESINOS',1500.00,0.00,1,'2026-04-10'),(2,'WILSON LAZARTE MONTAÑO',1500.00,0.00,1,'2026-04-10'),(3,'JUAN QUISPE LLAMPAS',1500.00,0.00,1,'2026-04-10'),(4,'MARIO CRUZ LACATO',1500.00,0.00,1,'2026-04-10'),(5,'-',1500.00,0.00,1,'2026-04-10'),(6,'JHONNY VARGAS',1500.00,0.00,1,'2026-04-10'),(7,'ALEX SANDRO VILLARROEL ROMERO',1500.00,0.00,1,'2026-04-10'),(8,'VICTOR HUGO VELARSCO CAERO',1500.00,0.00,1,'2026-04-10'),(9,'ELOY TERCEROS MONTAÑO',1500.00,0.00,1,'2026-04-10'),(10,'RICHAR IRUSTA JIMENEZ',1500.00,0.00,1,'2026-04-10'),(11,'CALIXTO ANDIA QUINTEROS',1500.00,0.00,1,'2026-04-10'),(12,'REINALDO JORGE OCZACHOQUE',1500.00,0.00,1,'2026-04-10'),(13,'DEMETRIO GALINDO MERIDA',1500.00,0.00,1,'2026-04-10'),(14,'ARCENIO CABALLERO V.',1500.00,0.00,1,'2026-04-10'),(15,'ARIEL VARGAS VALLEJOS',1500.00,0.00,1,'2026-04-10'),(16,'JHONNY VARGAS HERBAS',1500.00,0.00,1,'2026-04-10'),(17,'HUGO GABRIEL RASGUIDO',1500.00,0.00,1,'2026-04-10'),(20,'GABRIEL RENE MORENO',NULL,NULL,2,NULL);
/*!40000 ALTER TABLE `empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado_reporte`
--

DROP TABLE IF EXISTS `empleado_reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empleado_reporte` (
  `id_er` int(11) NOT NULL AUTO_INCREMENT,
  `id_empleado` int(11) DEFAULT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL,
  `id_gasto` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_er`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado_reporte`
--

LOCK TABLES `empleado_reporte` WRITE;
/*!40000 ALTER TABLE `empleado_reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleado_reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flota`
--

DROP TABLE IF EXISTS `flota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flota` (
  `placa` varchar(10) NOT NULL,
  `propietario` varchar(150) DEFAULT NULL,
  `chofer1` int(11) DEFAULT NULL,
  `chofer2` int(11) DEFAULT NULL,
  `id_fe` int(11) DEFAULT NULL,
  `id_u` int(11) DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL,
  `viajes_aceite` int(11) NOT NULL,
  `capacidad_aceite` decimal(10,3) NOT NULL DEFAULT 0.000,
  `aceite_actual` decimal(10,3) NOT NULL DEFAULT 0.000,
  PRIMARY KEY (`placa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flota`
--

LOCK TABLES `flota` WRITE;
/*!40000 ALTER TABLE `flota` DISABLE KEYS */;
INSERT INTO `flota` VALUES ('1194-UKE','ERICK MENDOZA',1,0,1,1,0,0,30.000,0.000),('1234-ABC','David Chavez',15,0,1,2,0,0,30.000,2.688),('1461-KUX','VIVIAN CABALLERO',2,0,1,1,0,0,30.000,0.000),('1580-EYR','JUAN QUISPE LLAMPA',3,0,1,1,0,0,30.000,0.000),('1800-FIU','MIGUELINA PEREDO',4,0,1,1,0,0,30.000,0.000),('1803-BNE','CARMEN VELASCO',5,0,1,1,0,0,30.000,11.626),('2130-YXG','JHONNY VARGAS',6,0,1,1,0,0,30.000,0.000),('2218-PCT','-',7,0,1,1,0,0,30.000,0.000),('2264-KGD','VICTOR HUGO VELASCO',8,0,1,1,0,0,30.000,0.000),('2447-CPE','ELOY TERCEROS',9,0,1,1,0,0,30.000,0.000),('2447-DKT','RICHAR IRUSTA',10,0,1,1,0,0,30.000,0.000),('2494-RXU','JHONNY CABALLERO',11,0,1,1,0,0,30.000,0.000),('2537-DER','REINALDO ALBERTO',12,0,1,1,0,0,30.000,0.000),('2550-TFU','RUTH CABALLERO',13,0,1,1,0,0,30.000,0.000),('2701-YNF','JHONNY CABALLERO',14,0,1,1,0,0,30.000,0.000),('2830-UTA','JHONNY CABALLERO',15,0,1,1,0,0,30.000,0.000),('2996-UKF','JHONNY CABALLERO',16,0,1,1,0,0,30.000,0.000),('3056-EAY','JHONNY CABALLERO',17,0,1,1,0,0,30.000,0.000);
/*!40000 ALTER TABLE `flota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flota_estados`
--

DROP TABLE IF EXISTS `flota_estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flota_estados` (
  `id_fe` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_estado_flota` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id_fe`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flota_estados`
--

LOCK TABLES `flota_estados` WRITE;
/*!40000 ALTER TABLE `flota_estados` DISABLE KEYS */;
INSERT INTO `flota_estados` VALUES (1,'Parqueado'),(2,'Viajando'),(3,'Mecanico');
/*!40000 ALTER TABLE `flota_estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gasto`
--

DROP TABLE IF EXISTS `gasto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `id_rep` int(11) DEFAULT NULL,
  `id_detalle` int(11) DEFAULT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `gasto` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gasto`
--

LOCK TABLES `gasto` WRITE;
/*!40000 ALTER TABLE `gasto` DISABLE KEYS */;
/*!40000 ALTER TABLE `gasto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca_aceite`
--

DROP TABLE IF EXISTS `marca_aceite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marca_aceite` (
  `id_marca_aceite` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_marca_aceite` varchar(100) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL DEFAULT 0.000,
  `precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_marca_aceite`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca_aceite`
--

LOCK TABLES `marca_aceite` WRITE;
/*!40000 ALTER TABLE `marca_aceite` DISABLE KEYS */;
INSERT INTO `marca_aceite` VALUES (1,'marca',0.000,150.00),(2,'santos',30.000,300.00);
/*!40000 ALTER TABLE `marca_aceite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca_rueda`
--

DROP TABLE IF EXISTS `marca_rueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marca_rueda` (
  `id_marca_rueda` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_marca_rueda` varchar(100) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `medida` decimal(10,2) DEFAULT NULL,
  `serie` varchar(50) DEFAULT NULL,
  `trilla` varchar(50) DEFAULT NULL,
  `aro` varchar(50) DEFAULT NULL,
  `media_viajes` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_marca_rueda`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca_rueda`
--

LOCK TABLES `marca_rueda` WRITE;
/*!40000 ALTER TABLE `marca_rueda` DISABLE KEYS */;
INSERT INTO `marca_rueda` VALUES (1,'Santos',150.00,23.00,'23','23','23',23),(4,'Michelin',200.00,25.00,'548s','25','Completo',50);
/*!40000 ALTER TABLE `marca_rueda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posicion_rueda`
--

DROP TABLE IF EXISTS `posicion_rueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posicion_rueda` (
  `id_pr` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_posicion` varchar(50) NOT NULL DEFAULT '-',
  `placa` varchar(10) NOT NULL,
  `posicion_x` decimal(5,2) NOT NULL DEFAULT 0.00,
  `posicion_y` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tipo` enum('doble','simple') NOT NULL DEFAULT 'simple',
  PRIMARY KEY (`id_pr`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posicion_rueda`
--

LOCK TABLES `posicion_rueda` WRITE;
/*!40000 ALTER TABLE `posicion_rueda` DISABLE KEYS */;
INSERT INTO `posicion_rueda` VALUES (34,'TREE D.E','1234-ABC',93.53,70.97,'doble'),(35,'TREE D.I','1234-ABC',83.53,70.97,'doble'),(36,'ga','1234-ABC',90.14,20.13,'simple'),(37,'ga1','1234-ABC',6.97,20.44,'simple'),(38,'tr Ex','1234-ABC',11.17,70.50,'doble'),(39,'tr In','1234-ABC',1.17,70.50,'doble'),(40,'rtra2','1234-ABC',89.33,81.85,'simple'),(41,'rtra1','1234-ABC',4.16,81.38,'simple');
/*!40000 ALTER TABLE `posicion_rueda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reporte` (
  `id_rep` int(11) NOT NULL AUTO_INCREMENT,
  `placa` varchar(10) DEFAULT NULL,
  `fecha_partida` date DEFAULT NULL,
  `fecha_retorno` date DEFAULT NULL,
  `fecha_llegada` date DEFAULT NULL,
  `liq_pasajes` decimal(10,2) DEFAULT NULL,
  `liq_encomiendas` decimal(10,2) DEFAULT NULL,
  `diesel_partida` decimal(10,2) DEFAULT NULL,
  `diesel_llegada` decimal(10,2) DEFAULT NULL,
  `dpFactura` tinyint(1) DEFAULT NULL,
  `drFactura` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_rep`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rueda_detalle`
--

DROP TABLE IF EXISTS `rueda_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rueda_detalle` (
  `id_rd` int(11) NOT NULL AUTO_INCREMENT,
  `id_rl` int(11) NOT NULL,
  `id_marca_rueda` int(11) NOT NULL,
  `codigo` varchar(20) DEFAULT '-',
  `precio_rueda` decimal(10,2) NOT NULL,
  `viajes_hechos` int(11) NOT NULL,
  `estado` enum('Disponible','Operativa','Baja') NOT NULL DEFAULT 'Disponible',
  PRIMARY KEY (`id_rd`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rueda_detalle`
--

LOCK TABLES `rueda_detalle` WRITE;
/*!40000 ALTER TABLE `rueda_detalle` DISABLE KEYS */;
INSERT INTO `rueda_detalle` VALUES (1,1,1,'-',50.00,0,'Baja'),(2,1,1,'-',50.00,0,'Baja'),(5,2,1,'-',150.00,0,'Operativa'),(6,2,1,'-',150.00,2,'Operativa'),(7,3,4,'-',200.00,0,'Operativa'),(8,3,1,'-',150.00,0,'Disponible'),(9,3,4,'-',200.00,0,'Operativa'),(10,3,4,'-',200.00,0,'Disponible'),(11,3,1,'-',150.00,0,'Operativa'),(12,3,1,'-',150.00,0,'Disponible'),(13,3,4,'-',200.00,0,'Disponible'),(16,4,4,'-',200.00,0,'Operativa'),(17,4,4,'-',200.00,0,'Disponible'),(18,4,4,'-',200.00,0,'Disponible'),(19,4,1,'-',150.00,0,'Disponible'),(20,4,1,'-',150.00,0,'Disponible'),(21,4,4,'-',200.00,0,'Disponible'),(22,4,4,'-',200.00,0,'Disponible'),(23,4,1,'-',150.00,0,'Disponible'),(24,4,1,'-',150.00,0,'Disponible'),(25,4,4,'-',200.00,0,'Disponible'),(26,4,4,'-',200.00,0,'Disponible'),(27,4,1,'-',150.00,0,'Disponible'),(28,5,4,'-',200.00,0,'Operativa'),(29,6,1,'-',150.00,0,'Disponible'),(30,7,1,'-',150.00,0,'Operativa'),(31,7,4,'-',200.00,0,'Disponible'),(35,10,4,'-',250.00,0,'Operativa'),(36,10,1,'-',150.00,0,'Operativa'),(37,11,4,'-',250.00,0,'Disponible'),(38,11,1,'-',100.00,0,'Disponible');
/*!40000 ALTER TABLE `rueda_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rueda_flota`
--

DROP TABLE IF EXISTS `rueda_flota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rueda_flota` (
  `id_rf` int(11) NOT NULL AUTO_INCREMENT,
  `id_rd` int(11) DEFAULT NULL,
  `placa` varchar(10) NOT NULL DEFAULT '-',
  `id_pr` int(11) DEFAULT NULL,
  `viajes_hechos` int(11) DEFAULT 0,
  `estado` enum('Operativa','Baja') DEFAULT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `detalle` text NOT NULL,
  PRIMARY KEY (`id_rf`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rueda_flota`
--

LOCK TABLES `rueda_flota` WRITE;
/*!40000 ALTER TABLE `rueda_flota` DISABLE KEYS */;
INSERT INTO `rueda_flota` VALUES (1,7,'1803-BNE',NULL,0,'Baja','2026-09-02',''),(2,9,'1803-BNE',NULL,0,'Operativa','2026-09-02',''),(3,7,'2447-CPE',NULL,0,'Operativa','2026-09-02',''),(4,11,'1803-BNE',NULL,0,'Operativa','2026-09-02',''),(5,28,'1803-BNE',NULL,0,'Baja','2026-09-02',''),(6,28,'2447-CPE',NULL,0,'Operativa','2026-09-02',''),(7,16,'2550-TFU',NULL,0,'Operativa','2026-09-05',''),(8,30,'2447-CPE',NULL,0,'Operativa','2026-09-09',''),(12,35,'1234-ABC',7,0,'Operativa','2026-09-09',''),(13,1,'1234-ABC',32,0,'Baja','2026-09-10',''),(18,6,'1234-ABC',35,0,'Operativa','2026-09-11',''),(21,5,'1234-ABC',NULL,0,'Operativa','2026-09-11',''),(24,36,'1234-ABC',34,0,'Operativa','2026-09-12','');
/*!40000 ALTER TABLE `rueda_flota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rueda_lote`
--

DROP TABLE IF EXISTS `rueda_lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rueda_lote` (
  `id_rl` int(11) NOT NULL AUTO_INCREMENT,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `precio_estimado` decimal(10,2) DEFAULT NULL,
  `precio_real` decimal(10,2) DEFAULT NULL,
  `estado_precio` enum('Subio','Bajo','Mantuvo') DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `estado` enum('Operativo','Eliminado') NOT NULL,
  PRIMARY KEY (`id_rl`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rueda_lote`
--

LOCK TABLES `rueda_lote` WRITE;
/*!40000 ALTER TABLE `rueda_lote` DISABLE KEYS */;
INSERT INTO `rueda_lote` VALUES (1,100.00,300.00,100.00,'Bajo',2,2,'2026-08-26','Operativo'),(2,300.00,300.00,300.00,'Mantuvo',2,0,'2026-08-30','Operativo'),(3,1250.00,1250.00,1250.00,'Mantuvo',7,7,'2026-08-30','Operativo'),(4,2150.00,2150.00,2150.00,'Mantuvo',12,12,'2026-09-02','Operativo'),(5,200.00,200.00,200.00,'Mantuvo',1,1,'2026-09-02','Eliminado'),(6,150.00,150.00,150.00,'Mantuvo',1,1,'2026-09-02','Operativo'),(7,350.00,350.00,350.00,'Mantuvo',2,2,'2026-09-07','Operativo'),(10,400.00,350.00,400.00,'Subio',2,0,'2026-09-09','Operativo'),(11,350.00,350.00,350.00,'Mantuvo',2,2,'2026-09-09','Operativo');
/*!40000 ALTER TABLE `rueda_lote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_empleado`
--

DROP TABLE IF EXISTS `tipo_empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_empleado` (
  `id_te` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_empleado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_te`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_empleado`
--

LOCK TABLES `tipo_empleado` WRITE;
/*!40000 ALTER TABLE `tipo_empleado` DISABLE KEYS */;
INSERT INTO `tipo_empleado` VALUES (1,'Chofer Principal'),(2,'Chofer Auxiliar'),(3,'Ayudante'),(4,'Boletero'),(5,'Ayudante');
/*!40000 ALTER TABLE `tipo_empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ubicacion` (
  `id_u` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_ubicacion` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id_u`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES (1,'Cochabamba'),(2,'La Paz'),(3,'Santa Cruz'),(4,'Montero');
/*!40000 ALTER TABLE `ubicacion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-13 18:52:10
