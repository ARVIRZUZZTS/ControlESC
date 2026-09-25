<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $precio_subpeaje = isset($data['precio_subpeaje']) && is_numeric($data['precio_subpeaje']) ? (float)$data['precio_subpeaje'] : null;
    $fecha_registro = isset($data['fecha_registro']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['fecha_registro']) ? $data['fecha_registro'] : null;

    if ($precio_subpeaje === null || $precio_subpeaje < 0) {
        throw new Exception("El precio del peaje es obligatorio.");
    }

    $sql = "INSERT INTO peaje (precio_subpeaje, fecha_registro) VALUES (?, ?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("ds", $precio_subpeaje, $fecha_registro);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar el peaje: " . $stmt->error);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Peaje guardado correctamente",
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