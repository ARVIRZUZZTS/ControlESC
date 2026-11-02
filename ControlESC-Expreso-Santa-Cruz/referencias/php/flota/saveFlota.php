<?php
header('Content-Type: application/json');
include '../conexion.php';

if (!$conexion) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$placa = strtoupper(trim($input['placa'] ?? ''));
$propietario = trim($input['propietario'] ?? '');
$marca = trim($input['marca'] ?? '');
$conductor1 = trim($input['conductor1'] ?? '');
$licencia1 = trim($input['licencia1'] ?? '');
$conductor2 = trim($input['conductor2'] ?? '');
$licencia2 = trim($input['licencia2'] ?? '');
$nombre_planilla = trim($input['nombre_planilla'] ?? '');
$editOriginal = trim($input['editOriginal'] ?? '');

if (empty($placa)) {
    echo json_encode(['success' => false, 'message' => 'La placa es requerida']);
    exit;
}

if (!preg_match('/^\d{4}-[A-Z]{3}$/', $placa)) {
    echo json_encode(['success' => false, 'message' => 'Formato de placa inválido (ej: 1234-ABC)']);
    exit;
}

try {
    if (!empty($editOriginal)) {
        $stmt = $conexion->prepare("UPDATE flota SET placa=?, propietario=?, marca=?, conductor1=?, licencia1=?, conductor2=?, licencia2=?, nombre_planilla=? WHERE placa=?");
        $stmt->bind_param("sssssssss", $placa, $propietario, $marca, $conductor1, $licencia1, $conductor2, $licencia2, $nombre_planilla, $editOriginal);
    } else {
        $stmt = $conexion->prepare("INSERT INTO flota (placa, propietario, marca, conductor1, licencia1, conductor2, licencia2, nombre_planilla) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $placa, $propietario, $marca, $conductor1, $licencia1, $conductor2, $licencia2, $nombre_planilla);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Flota guardada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $stmt->error]);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conexion->close();
?>
