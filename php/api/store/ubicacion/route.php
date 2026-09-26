<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $nombre = isset($data['nombre_ubicacion']) ? trim($data['nombre_ubicacion']) : "";

    if ($nombre === "") {
        throw new Exception("El nombre de la ubicacion es obligatorio.");
    }

    $precio_peaje = isset($data['precio_peaje']) && $data['precio_peaje'] !== '' && $data['precio_peaje'] !== null
        ? (float)$data['precio_peaje']
        : null;

    if ($precio_peaje !== null && $precio_peaje < 0) {
        throw new Exception("El precio del peaje no puede ser negativo.");
    }

    if ($precio_peaje !== null) {
        $sql = "INSERT INTO ubicacion (nombre_ubicacion, precio_peaje) VALUES (?, ?)";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
        }
        $stmt->bind_param("sd", $nombre, $precio_peaje);
    } else {
        $sql = "INSERT INTO ubicacion (nombre_ubicacion) VALUES (?)";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
        }
        $stmt->bind_param("s", $nombre);
    }

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar la ubicacion: " . $stmt->error);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Ubicacion guardada correctamente",
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