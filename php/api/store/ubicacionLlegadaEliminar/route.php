<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_ubicaciones_llegada']) || !is_numeric($data['id_ubicaciones_llegada'])) {
        throw new Exception("No se recibio el id de la ubicacion de llegada.");
    }

    $id = (int)$data['id_ubicaciones_llegada'];

    $sql = "DELETE FROM ubicaciones_llegada WHERE id_ubicaciones_llegada = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar la ubicacion de llegada: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro una ubicacion de llegada con ese id.");
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Ubicacion de llegada eliminada correctamente"
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