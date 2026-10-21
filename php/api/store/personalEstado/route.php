<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_personal']) || !isset($data['estado'])) {
        throw new Exception("Datos incompletos.");
    }

    $id_personal = intval($data['id_personal']);
    $estado = $data['estado'] === 'activo' ? 'activo' : 'inactivo';

    $sql = "UPDATE personal SET estado = ? WHERE id_personal = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion: " . $conexion->error);
    }

    $stmt->bind_param("si", $estado, $id_personal);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar estado: " . $stmt->error);
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Estado actualizado correctamente"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
