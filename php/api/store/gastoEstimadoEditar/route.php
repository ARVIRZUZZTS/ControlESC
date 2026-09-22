<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_gasto_estimado']) || !is_numeric($data['id_gasto_estimado'])) {
        throw new Exception("No se recibio el gasto a editar.");
    }

    $id_gasto_estimado = (int)$data['id_gasto_estimado'];
    $titulo = isset($data['titulo']) ? trim($data['titulo']) : "";
    $gasto_generico = isset($data['gasto_generico']) && is_numeric($data['gasto_generico']) ? (float)$data['gasto_generico'] : null;

    if ($titulo === "") {
        throw new Exception("El titulo del gasto es obligatorio.");
    }
    if ($gasto_generico !== null && $gasto_generico < 0) {
        throw new Exception("El gasto generico no puede ser negativo.");
    }

    $sql = "UPDATE gasto_estimado SET titulo = ?, gasto_generico = ? WHERE id_gasto_estimado = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("sdi", $titulo, $gasto_generico, $id_gasto_estimado);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el gasto: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Gasto actualizado correctamente"
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