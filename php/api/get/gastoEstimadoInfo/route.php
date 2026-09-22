<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_gasto_estimado']) || !is_numeric($_GET['id_gasto_estimado'])) {
        throw new Exception("Parametro 'id_gasto_estimado' no proporcionado o invalido.");
    }

    $id_gasto_estimado = (int)$_GET['id_gasto_estimado'];

    $sqlGasto = "SELECT id_gasto_estimado, titulo, gasto_generico
                 FROM gasto_estimado
                 WHERE id_gasto_estimado = ?";

    $stmt = $conexion->prepare($sqlGasto);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_gasto_estimado);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Gasto no encontrado"
        ]);
        $stmt->close();
        $conexion->close();
        exit;
    }

    $gasto = $result->fetch_assoc();
    $stmt->close();

    $sqlDetalle = "SELECT id_detalle_estimado, detalle, gasto_particular
                   FROM detalle_estimado
                   WHERE id_gasto_estimado = ?
                   ORDER BY id_detalle_estimado ASC";

    $stmtDetalle = $conexion->prepare($sqlDetalle);
    if (!$stmtDetalle) {
        throw new Exception("Error al preparar el detalle: " . $conexion->error);
    }

    $stmtDetalle->bind_param("i", $id_gasto_estimado);
    $stmtDetalle->execute();
    $resultDetalle = $stmtDetalle->get_result();

    $detalles = [];
    while ($row = $resultDetalle->fetch_assoc()) {
        $detalles[] = $row;
    }
    $stmtDetalle->close();

    echo json_encode([
        "status" => "success",
        "message" => "Gasto obtenido correctamente",
        "data" => $gasto,
        "detalles" => $detalles
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