<?php
header('Content-Type: application/json');
include '../conexion.php';

if (!$conexion) {
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

if (isset($_GET['placa'])) {
    $placa = $_GET['placa'];
    $stmt = $conexion->prepare("SELECT * FROM flota WHERE placa = ?");
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();
    $flota = $result->fetch_assoc();
    echo json_encode($flota ?: null);
    $stmt->close();
} else {
    $result = $conexion->query("SELECT * FROM flota ORDER BY placa");
    $flotas = [];
    while ($row = $result->fetch_assoc()) {
        $flotas[] = $row;
    }
    echo json_encode($flotas);
}

$conexion->close();
?>
