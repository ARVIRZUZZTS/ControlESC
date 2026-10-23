<?php
require_once("../../../conexion.php");

header("Content-Type: application/json");

try {
    if (!isset($_GET["inicio"]) || !isset($_GET["fin"])) {
        throw new Exception("Parametros inicio y fin requeridos (YYYY-MM-DD).");
    }

    $inicio = trim($_GET["inicio"]);
    $fin = trim($_GET["fin"]);

    if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $inicio) || !preg_match("/^\d{4}-\d{2}-\d{2}$/", $fin)) {
        throw new Exception("Formato de fecha invalido. Use YYYY-MM-DD.");
    }

    $sql = "SELECT r.id_reporte, r.placa, r.estado, r.fecha_partida, r.fecha_retorno, r.fecha_llegada,
                    r.ubicacion_retorno, r.ubicacion_llegada, r.viajes,
                    f.color1, f.color2
             FROM reporte r
             LEFT JOIN flota f ON f.placa = r.placa
             WHERE (r.fecha_partida BETWEEN ? AND ?)
               OR (r.fecha_retorno BETWEEN ? AND ?)
               OR (r.fecha_llegada BETWEEN ? AND ?)
            ORDER BY r.fecha_partida ASC, r.id_reporte ASC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("ssssss", $inicio, $fin, $inicio, $fin, $inicio, $fin);
    $stmt->execute();
    $result = $stmt->get_result();

    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }
    $stmt->close();

    $anio = (int)substr($inicio, 0, 4);
    $mes = (int)substr($inicio, 5, 2);

    echo json_encode([
        "status" => "success",
        "message" => "Historial obtenido correctamente",
        "inicio" => $inicio,
        "fin" => $fin,
        "anio" => $anio,
        "mes" => $mes,
        "reportes" => $reportes
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
