<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $precio_x_litro = isset($data['precio_x_litro']) && is_numeric($data['precio_x_litro']) ? (float)$data['precio_x_litro'] : null;
    $fecha_guardado = isset($data['fecha_guardado']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['fecha_guardado']) ? $data['fecha_guardado'] : null;

    if ($precio_x_litro === null || $precio_x_litro < 0) {
        throw new Exception("El precio por litro es obligatorio.");
    }

    $sql = "INSERT INTO diesel (precio_x_litro, fecha_guardado, estado) VALUES (?, ?, 'activo')";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("ds", $precio_x_litro, $fecha_guardado);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar diesel: " . $stmt->error);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Diesel guardado correctamente",
        "id" => $stmt->insert_id
    ]);

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>