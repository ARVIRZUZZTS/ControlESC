<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_ubicacion']) || !is_numeric($data['id_ubicacion'])) {
        throw new Exception("No se recibio la ubicacion a editar.");
    }

    $id_ubicacion = (int)$data['id_ubicacion'];
    $nombre = isset($data['nombre_ubicacion']) ? trim($data['nombre_ubicacion']) : "";

    if ($nombre === "") {
        throw new Exception("El nombre de la ubicacion es obligatorio.");
    }

    $sql = "UPDATE ubicacion SET nombre_ubicacion = ? WHERE id_ubicacion = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("si", $nombre, $id_ubicacion);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar la ubicacion: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Ubicacion actualizada correctamente"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>