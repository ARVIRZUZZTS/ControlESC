<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['empleados']) || !is_array($data['empleados']) || count($data['empleados']) === 0) {
        throw new Exception("No se recibieron empleados para registrar.");
    }

    $sql = "INSERT INTO empleado (empleado, id_te, mensual, total, fecha_contrato, estado) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $creados = [];
    foreach ($data['empleados'] as $emp) {
        $nombre = isset($emp['nombre']) ? trim($emp['nombre']) : "";
        $id_te = isset($emp['id_te']) ? intval($emp['id_te']) : 0;

        if ($nombre === "") {
            throw new Exception("El nombre del empleado es obligatorio.");
        }
        if (!$id_te) {
            throw new Exception("El tipo de empleado es obligatorio.");
        }

        $mensual = isset($emp['mensual']) && is_numeric($emp['mensual']) ? (float)$emp['mensual'] : 0.00;
        $total = isset($emp['total']) && is_numeric($emp['total']) ? (float)$emp['total'] : 0.00;
        $fecha_contrato = isset($emp['fecha_contrato']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $emp['fecha_contrato'])
            ? $emp['fecha_contrato']
            : null;
        $estado = isset($emp['estado']) && in_array($emp['estado'], ['Activo', 'Baja'], true)
            ? $emp['estado']
            : 'Activo';

        $stmt->bind_param("siddss", $nombre, $id_te, $mensual, $total, $fecha_contrato, $estado);
        if (!$stmt->execute()) {
            throw new Exception("Error al registrar el empleado: " . $stmt->error);
        }

        $creados[] = [
            "id_empleado" => $stmt->insert_id,
            "empleado" => $nombre,
            "id_te" => $id_te
        ];
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Empleados registrados correctamente",
        "empleados" => $creados
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