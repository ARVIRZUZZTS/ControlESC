<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_ubicacion']) || !is_numeric($data['id_ubicacion'])) {
        throw new Exception("No se recibio el id de la ubicacion.");
    }

    $id_ubicacion = (int)$data['id_ubicacion'];

    $sql = "DELETE FROM ubicacion WHERE id_ubicacion = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_ubicacion);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar la ubicacion: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro una ubicacion con ese id.");
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Ubicacion eliminada correctamente"
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