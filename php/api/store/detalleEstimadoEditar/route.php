<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_detalle_estimado']) || !is_numeric($data['id_detalle_estimado'])) {
        throw new Exception("No se recibio el detalle a editar.");
    }

    $id_detalle_estimado = (int)$data['id_detalle_estimado'];
    $texto = isset($data['detalle']) ? trim($data['detalle']) : "";
    $gasto_particular = isset($data['gasto_particular']) && is_numeric($data['gasto_particular']) ? (float)$data['gasto_particular'] : null;

    if ($texto === "") {
        throw new Exception("El detalle no puede estar vacio.");
    }
    if ($gasto_particular !== null && $gasto_particular < 0) {
        throw new Exception("El gasto particular no puede ser negativo.");
    }

    $sql = "UPDATE detalle_estimado SET detalle = ?, gasto_particular = ? WHERE id_detalle_estimado = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("sdi", $texto, $gasto_particular, $id_detalle_estimado);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el detalle: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Detalle actualizado correctamente"
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