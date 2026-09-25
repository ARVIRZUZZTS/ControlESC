<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_subpeaje']) || !is_numeric($data['id_subpeaje'])) {
        throw new Exception("No se recibio el id del peaje.");
    }

    $id_subpeaje = (int)$data['id_subpeaje'];

    $sql = "DELETE FROM peaje WHERE id_subpeaje = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_subpeaje);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar el peaje: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        $stmt->close();
        throw new Exception("No se encontro un peaje con ese id.");
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Peaje eliminado correctamente"
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