<?php
require_once("../../../conexion.php");
require_once("../../../includes/reporteDatos.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa']) || trim($_GET['placa']) === "") {
        throw new Exception("Parametro 'placa' no proporcionado.");
    }
    $placa = trim($_GET['placa']);

    $sql = "SELECT r.id_reporte, r.placa, r.estado, r.fecha_partida, r.fecha_retorno, r.fecha_llegada,
                   r.ubicacion_retorno, r.ubicacion_llegada, r.viajes, r.aceite_consumido, r.gastos_totales,
                   (COALESCE(r.liquidacion_pasajes, 0)
                    + COALESCE(r.liquidacion_encomiendas, 0)
                    + COALESCE(r.liquidacion_pasajes_auxiliar, 0)
                    + COALESCE(r.asignacion_efectivo, 0)
                    + COALESCE(r.asignacion_qr, 0)) AS ingresos
            FROM reporte r
            WHERE r.placa = ?
            ORDER BY r.id_reporte DESC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $row["balance"] = round(floatval($row["ingresos"]) - floatval($row["gastos_totales"]), 2);
        $reportes[] = $row;
    }
    $stmt->close();

    $sqlF = "SELECT f.placa, f.viajes, f.viajes_aceite, f.aceite_actual, f.capacidad_aceite, f.color1, f.color2, f.color_texto, f.id_fe, IFNULL(fe.nombre_estado_flota, 'Sin estado') AS estado
             FROM flota f LEFT JOIN flota_estados fe ON fe.id_fe = f.id_fe
             WHERE f.placa = ?";
    $stmtF = $conexion->prepare($sqlF);
    if ($stmtF) {
        $stmtF->bind_param("s", $placa);
        $stmtF->execute();
        $resF = $stmtF->get_result();
        $flota = $resF->num_rows > 0 ? $resF->fetch_assoc() : null;
        $stmtF->close();
    } else {
        $flota = null;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Historico obtenido correctamente",
        "placa" => $placa,
        "reportes" => $reportes,
        "flota" => $flota,
        "config" => configSistema()
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
