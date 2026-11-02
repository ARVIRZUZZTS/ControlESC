CREATE TABLE destino (
  nombreZona varchar(100) NOT NULL,
  PRIMARY KEY (nombreZona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO destino (nombreZona) VALUES ('Santa Cruz'), ('La Paz');
