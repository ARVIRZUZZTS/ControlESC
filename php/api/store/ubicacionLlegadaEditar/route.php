<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_ubicaciones_llegada']) || !is_numeric($data['id_ubicaciones_llegada'])) {
        throw new Exception("No se recibio la ubicacion de llegada a editar.");
    }

    $id = (int)$data['id_ubicaciones_llegada'];
    $nombre = isset($data['nombre_ubicaciones_llegada']) ? trim($data['nombre_ubicaciones_llegada']) : "";

    if ($nombre === "") {
        throw new Exception("El nombre de la ubicacion de llegada es obligatorio.");
    }

    $sql = "UPDATE ubicaciones_llegada SET nombre_ubicaciones_llegada = ? WHERE id_ubicaciones_llegada = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("si", $nombre, $id);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar la ubicacion de llegada: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Ubicacion de llegada actualizada correctamente"
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