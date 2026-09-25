<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $nombre = isset($data['nombre_ubicaciones_llegada']) ? trim($data['nombre_ubicaciones_llegada']) : "";

    if ($nombre === "") {
        throw new Exception("El nombre de la ubicacion de llegada es obligatorio.");
    }

    $sql = "INSERT INTO ubicaciones_llegada (nombre_ubicaciones_llegada) VALUES (?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("s", $nombre);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar la ubicacion de llegada: " . $stmt->error);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Ubicacion de llegada guardada correctamente",
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