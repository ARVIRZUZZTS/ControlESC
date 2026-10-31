<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $placa = isset($data['placa']) ? strtoupper(trim($data['placa'])) : "";
    if ($placa === "") {
        throw new Exception("La placa es obligatoria.");
    }

    $id_fe = isset($data['id_fe']) ? intval($data['id_fe']) : 0;
    if ($id_fe <= 0) {
        throw new Exception("El estado es obligatorio.");
    }

    $stmt = $conexion->prepare("SELECT id_fe FROM flota_estados WHERE id_fe = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta de estado: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_fe);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) {
        $stmt->close();
        throw new Exception("Estado no encontrado.");
    }
    $stmt->close();

    $stmt = $conexion->prepare("UPDATE flota SET id_fe = ? WHERE placa = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la actualizacion: " . $conexion->error);
    }
    $stmt->bind_param("is", $id_fe, $placa);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el estado de la flota: " . $stmt->error);
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Flota marcada como accidentada correctamente"
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
