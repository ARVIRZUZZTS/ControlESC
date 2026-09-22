<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_te']) || !is_numeric($data['id_te'])) {
        throw new Exception("No se recibio el id del tipo de personal.");
    }

    $id_te = (int)$data['id_te'];

    $sql = "DELETE FROM tipo_personal WHERE id_te = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_te);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar el tipo de personal: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro un tipo de personal con ese id.");
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Tipo de personal eliminado correctamente"
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