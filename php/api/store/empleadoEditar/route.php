<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_empleado']) || !is_numeric($data['id_empleado'])) {
        throw new Exception("No se recibio el empleado a editar.");
    }

    $id_empleado = (int)$data['id_empleado'];
    $nombre = isset($data['nombre']) ? trim($data['nombre']) : "";
    $id_te = isset($data['id_te']) ? intval($data['id_te']) : 0;

    if ($nombre === "") {
        throw new Exception("El nombre del empleado es obligatorio.");
    }
    if (!$id_te) {
        throw new Exception("El tipo de empleado es obligatorio.");
    }

    $mensual = isset($data['mensual']) && is_numeric($data['mensual']) ? (float)$data['mensual'] : 0.00;
    $fecha_contrato = isset($data['fecha_contrato']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['fecha_contrato'])
        ? $data['fecha_contrato']
        : null;
    $estado = isset($data['estado']) && in_array($data['estado'], ['Activo', 'Baja'], true)
        ? $data['estado']
        : 'Activo';

    $sql = "UPDATE empleado SET empleado = ?, id_te = ?, mensual = ?, fecha_contrato = ?, estado = ? WHERE id_empleado = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("sisssi", $nombre, $id_te, $mensual, $fecha_contrato, $estado, $id_empleado);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el empleado: " . $stmt->error);
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Empleado actualizado correctamente"
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