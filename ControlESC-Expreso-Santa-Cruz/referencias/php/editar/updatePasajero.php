<?php
require '../conexion.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

try {
    $successCount = 0;
    $errors = [];

    foreach ($data as $pasajero) {
        if (!isset($pasajero['codR']) || !isset($pasajero['codP'])) {
            $errors[] = 'Falta codR o codP en uno de los pasajeros';
            continue;
        }

        $sql = "UPDATE persona SET 
                asiento = ?, 
                nombre = ?, 
                ci = ?, 
                precio = ? 
                WHERE codR = ? AND codP = ?";

        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            $errors[] = 'Error al preparar consulta: ' . $conexion->error;
            continue;
        }

        $stmt->bind_param("ssssii", 
            $pasajero['asiento'],
            $pasajero['nombre'],
            $pasajero['ci'],
            $pasajero['precio'],
            $pasajero['codR'],
            $pasajero['codP']
        );

        if ($stmt->execute()) {
            $successCount++;
        } else {
            $errors[] = 'Error al actualizar pasajero ' . $pasajero['codP'] . ': ' . $stmt->error;
        }

        $stmt->close();
    }

    if (empty($errors)) {
        echo json_encode(['success' => true, 'message' => "Se actualizaron $successCount pasajeros"]);
    } else {
        echo json_encode(['success' => false, 'errors' => $errors]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>