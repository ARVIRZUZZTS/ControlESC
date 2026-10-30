<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_peaje'])) {
        throw new Exception("Datos incompletos.");
    }

    $id = (int)$data['id_peaje'];

    $stmt = $conexion->prepare("DELETE FROM peajes WHERE id_peaje = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("i", $id);
    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar el peaje: " . $stmt->error);
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Peaje eliminado correctamente"
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>
