<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_diesel']) || !is_numeric($data['id_diesel'])) {
        throw new Exception("No se recibio el diesel a editar.");
    }

    $id_diesel = (int)$data['id_diesel'];
    $precio_x_litro = isset($data['precio_x_litro']) && is_numeric($data['precio_x_litro']) ? (float)$data['precio_x_litro'] : null;
    $fecha_guardado = isset($data['fecha_guardado']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['fecha_guardado']) ? $data['fecha_guardado'] : null;
    $estado = isset($data['estado']) && in_array($data['estado'], ['activo', 'baja'], true) ? $data['estado'] : 'activo';

    if ($precio_x_litro === null || $precio_x_litro < 0) {
        throw new Exception("El precio por litro es obligatorio.");
    }

    $sql = "UPDATE diesel SET precio_x_litro = ?, fecha_guardado = ?, estado = ? WHERE id_diesel = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("dssi", $precio_x_litro, $fecha_guardado, $estado, $id_diesel);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar diesel: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Diesel actualizado correctamente"
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