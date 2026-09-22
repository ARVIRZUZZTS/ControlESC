<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_diesel']) || !is_numeric($data['id_diesel'])) {
        throw new Exception("No se recibio el id del diesel.");
    }

    $id_diesel = (int)$data['id_diesel'];

    $sql = "UPDATE diesel SET estado = 'baja' WHERE id_diesel = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_diesel);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar diesel: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro un registro de diesel con ese id.");
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Diesel dado de baja correctamente"
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