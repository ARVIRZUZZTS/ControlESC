<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_reporte']) || !is_numeric($_GET['id_reporte'])) {
        throw new Exception("Parametro 'id_reporte' no proporcionado.");
    }
    $id_reporte = (int)$_GET['id_reporte'];

    $stmt = $conexion->prepare("SELECT * FROM reporte WHERE id_reporte = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_reporte);
    $stmt->execute();
    $result = $stmt->get_result();
    $reporte = $result->num_rows > 0 ? $result->fetch_assoc() : null;
    $stmt->close();

    if ($reporte === null) {
        throw new Exception("Reporte no encontrado");
    }

    $sqlGastos = "SELECT g.titulo, g.gasto_generico, pe.nombre_apellido AS responsable
                  FROM gasto g
                  LEFT JOIN responsable r ON r.id_gasto = g.id_gasto
                  LEFT JOIN personal pe ON pe.id_personal = r.id_personal
                  WHERE g.id_reporte = ?
                  ORDER BY g.id_gasto ASC";

    $stmt = $conexion->prepare($sqlGastos);
    if (!$stmt) {
        throw new Exception("Error al preparar los gastos: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_reporte);
    $stmt->execute();
    $result = $stmt->get_result();
    $gastos = [];
    while ($row = $result->fetch_assoc()) {
        $gastos[] = $row;
    }
    $stmt->close();

    $sqlAnom = "SELECT detalle_anomalia, gasto_subanomalia
                FROM anomalia
                WHERE id_reporte = ?
                ORDER BY id_anomalia ASC";

    $stmt = $conexion->prepare($sqlAnom);
    if (!$stmt) {
        throw new Exception("Error al preparar las anomalias: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_reporte);
    $stmt->execute();
    $result = $stmt->get_result();
    $anomalias = [];
    while ($row = $result->fetch_assoc()) {
        $anomalias[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Reporte obtenido correctamente",
        "reporte" => $reporte,
        "gastos" => $gastos,
        "anomalias" => $anomalias
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
