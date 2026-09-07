<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_rl'])) {
        throw new Exception("No se recibio el id del lote.");
    }

    $id_rl = intval($data['id_rl']);

    $sql = "UPDATE rueda_lote SET estado = 'Eliminado' WHERE id_rl = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_rl);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar el lote: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro un lote con ese id.");
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Lote eliminado correctamente"
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