<?php
require '../conexion.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['codR']) || !isset($data['pasajeros'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

try {
    $codR = $data['codR'];
    $pasajeros = $data['pasajeros'];
    
    if (empty($pasajeros)) {
        echo json_encode(['success' => true, 'message' => 'No hay pasajeros para eliminar']);
        exit;
    }

    // Crear una lista de placeholders para la consulta preparada
    $placeholders = implode(',', array_fill(0, count($pasajeros), '?'));
    
    $sql = "DELETE FROM persona WHERE codR = ? AND codP IN ($placeholders)";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conexion->error);
    }

    // Construir el array de parámetros: primero codR, luego los codP
    $params = array_merge([$codR], $pasajeros);

    // Usamos call_user_func_array para bindear los parámetros dinámicos
    $types = str_repeat('i', count($params)); // todos son enteros
    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar consulta: ' . $stmt->error);
    }

    $affected = $stmt->affected_rows;
    echo json_encode(['success' => true, 'message' => "Se eliminaron $affected pasajeros"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$stmt->close();
?>