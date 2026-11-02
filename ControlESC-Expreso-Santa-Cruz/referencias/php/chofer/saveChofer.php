<?php
header('Content-Type: application/json');
include '../conexion.php';

if (!$conexion) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$nombre = trim($input['nombre_chofer'] ?? '');
$licencia = trim($input['licencia'] ?? '');
$editOriginal = trim($input['editOriginal'] ?? '');

if (empty($nombre)) {
    echo json_encode(['success' => false, 'message' => 'El nombre es requerido']);
    exit;
}

try {
    if (!empty($editOriginal)) {
        $stmt = $conexion->prepare("UPDATE chofer SET nombre_chofer=?, licencia=? WHERE nombre_chofer=?");
        $stmt->bind_param("sss", $nombre, $licencia, $editOriginal);
    } else {
        $stmt = $conexion->prepare("INSERT INTO chofer (nombre_chofer, licencia) VALUES (?, ?)");
        $stmt->bind_param("ss", $nombre, $licencia);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Chofer guardado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $stmt->error]);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conexion->close();
