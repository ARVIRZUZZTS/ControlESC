<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['personal']) || !is_array($data['personal']) || count($data['personal']) === 0) {
        throw new Exception("No se recibió personal para registrar.");
    }

    $sql = "INSERT INTO personal (nombre_apellido, id_te, mensual, total, fecha_contrato, estado) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $creados = [];
    foreach ($data['personal'] as $emp) {
        $nombre = isset($emp['nombre']) ? trim($emp['nombre']) : "";
        $id_te = isset($emp['id_te']) ? intval($emp['id_te']) : 0;

        if ($nombre === "") {
            throw new Exception("El nombre del personal es obligatorio.");
        }
        if (!$id_te) {
            throw new Exception("El tipo de personal es obligatorio.");
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
            throw new Exception("Error al registrar el personal: " . $stmt->error);
        }

        $creados[] = [
            "id_personal" => $stmt->insert_id,
            "nombre_apellido" => $nombre,
            "id_te" => $id_te
        ];
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Personal registrado correctamente",
        "personal" => $creados
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