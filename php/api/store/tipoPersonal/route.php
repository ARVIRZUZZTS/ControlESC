<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $nombre = isset($data['nombre_tipo_personal']) ? trim($data['nombre_tipo_personal']) : "";

    if ($nombre === "") {
        throw new Exception("El nombre del tipo de personal es obligatorio.");
    }

    $sql = "INSERT INTO tipo_personal (nombre_tipo_personal) VALUES (?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("s", $nombre);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar el tipo de personal: " . $stmt->error);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Tipo de personal guardado correctamente",
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