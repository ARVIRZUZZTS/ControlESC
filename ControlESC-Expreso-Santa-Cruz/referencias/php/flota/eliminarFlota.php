<?php
header('Content-Type: application/json');
include '../conexion.php';

if (!$conexion) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión']);
    exit;
}

$placa = $_POST['placa'] ?? '';

if (empty($placa)) {
    echo json_encode(['success' => false, 'message' => 'Placa no proporcionada']);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM flota WHERE placa = ?");
$stmt->bind_param("s", $placa);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Flota eliminada correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
