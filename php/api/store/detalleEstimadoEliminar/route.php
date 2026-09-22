<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_detalle_estimado']) || !is_numeric($data['id_detalle_estimado'])) {
        throw new Exception("No se recibio el id del detalle.");
    }

    $id_detalle_estimado = (int)$data['id_detalle_estimado'];

    $sql = "DELETE FROM detalle_estimado WHERE id_detalle_estimado = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_detalle_estimado);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar el detalle: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro un detalle con ese id.");
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Detalle eliminado correctamente"
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