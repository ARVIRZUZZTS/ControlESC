<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_te']) || !is_numeric($data['id_te'])) {
        throw new Exception("No se recibio el tipo de personal a editar.");
    }

    $id_te = (int)$data['id_te'];
    $nombre = isset($data['nombre_tipo_personal']) ? trim($data['nombre_tipo_personal']) : "";

    if ($nombre === "") {
        throw new Exception("El nombre del tipo de personal es obligatorio.");
    }

    $sql = "UPDATE tipo_personal SET nombre_tipo_personal = ? WHERE id_te = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("si", $nombre, $id_te);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el tipo de personal: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Tipo de personal actualizado correctamente"
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