<?php
header('Content-Type: application/json');
include '../conexion.php';

if (!$conexion) {
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

if (isset($_GET['nombre'])) {
    $nombre = $_GET['nombre'];
    $stmt = $conexion->prepare("SELECT * FROM chofer WHERE nombre_chofer = ?");
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $result = $stmt->get_result();
    $chofer = $result->fetch_assoc();
    echo json_encode($chofer ?: null);
    $stmt->close();
} else {
    $result = $conexion->query("SELECT * FROM chofer ORDER BY nombre_chofer");
    $choferes = [];
    while ($row = $result->fetch_assoc()) {
        $choferes[] = $row;
    }
    echo json_encode($choferes);
}

$conexion->close();
