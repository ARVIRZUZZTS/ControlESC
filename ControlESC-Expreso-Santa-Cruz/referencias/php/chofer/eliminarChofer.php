<?php
header('Content-Type: application/json');
include '../conexion.php';

if (!$conexion) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión']);
    exit;
}

$nombre = $_POST['nombre'] ?? '';

if (empty($nombre)) {
    echo json_encode(['success' => false, 'message' => 'Nombre no proporcionado']);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM chofer WHERE nombre_chofer = ?");
$stmt->bind_param("s", $nombre);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Chofer eliminado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
