<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_lote'])) {
        throw new Exception("Parametro 'id_lote' no proporcionado");
    }
    $id_lote = $_GET['id_lote'];

    $sqlLote = "SELECT rl.id_rl, rl.precio_total, rl.precio_estimado, rl.precio_real, rl.estado_precio, rl.cantidad, rl.stock, rl.fecha_compra,
                       (SELECT GROUP_CONCAT(DISTINCT mr.nombre_marca_rueda ORDER BY mr.nombre_marca_rueda SEPARATOR ', ')
                        FROM rueda_detalle rd
                        INNER JOIN marca_rueda mr ON rd.id_marca_rueda = mr.id_marca_rueda
                        WHERE rd.id_rl = rl.id_rl) AS marcas
                FROM rueda_lote rl
                WHERE rl.id_rl = ?";

    $stmt = $conexion->prepare($sqlLote);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_lote);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Lote de ruedas no encontrado"
        ]);
        $stmt->close();
        $conexion->close();
        exit;
    }

    $lote = $result->fetch_assoc();
    $stmt->close();

    $sqlDetalle = "SELECT rd.id_rd, rd.precio_rueda, mr.id_marca_rueda, mr.nombre_marca_rueda, mr.precio_unitario
                   FROM rueda_detalle rd
                   INNER JOIN marca_rueda mr ON rd.id_marca_rueda = mr.id_marca_rueda
                   WHERE rd.id_rl = ?
                   ORDER BY rd.id_rd ASC";

    $stmtDetalle = $conexion->prepare($sqlDetalle);
    if (!$stmtDetalle) {
        throw new Exception("Error al preparar el detalle: " . $conexion->error);
    }
    $stmtDetalle->bind_param("i", $id_lote);
    $stmtDetalle->execute();
    $resultDetalle = $stmtDetalle->get_result();

    $detalles = [];
    while ($row = $resultDetalle->fetch_assoc()) {
        $detalles[] = $row;
    }
    $stmtDetalle->close();

    echo json_encode([
        "status" => "success",
        "message" => "Lote de ruedas obtenido correctamente",
        "data" => $lote,
        "detalles" => $detalles
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
