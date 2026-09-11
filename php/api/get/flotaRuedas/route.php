<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa'])) {
        throw new Exception("Parametro 'placa' no proporcionado");
    }

    $placa = trim($_GET['placa']);

    $sqlPos = "SELECT p.id_pr, p.nombre_posicion, p.posicion_x, p.posicion_y, p.tipo,
                      rf.id_rf, rf.viajes_hechos AS viajes_flota, rf.fecha_instalacion,
                      rd.id_rd, rd.codigo, rd.viajes_hechos AS viajes_total, rd.estado AS estado_rd,
                      rl.id_rl, rl.fecha_compra
               FROM posicion_rueda p
               LEFT JOIN rueda_flota rf ON rf.id_pr = p.id_pr AND rf.placa = p.placa AND rf.estado = 'Operativa'
               LEFT JOIN rueda_detalle rd ON rd.id_rd = rf.id_rd
               LEFT JOIN rueda_lote rl ON rl.id_rl = rd.id_rl
               WHERE p.placa = ?
               ORDER BY p.id_pr ASC";

    $stmt = $conexion->prepare($sqlPos);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    $posiciones = [];
    while ($row = $result->fetch_assoc()) {
        $posiciones[] = $row;
    }
    $stmt->close();

    $sqlRuedas = "SELECT rd.id_rd, rd.codigo, rd.estado AS estado_rd, rd.viajes_hechos,
                         rl.id_rl, rl.fecha_compra,
                         rf.placa AS placa_op, rf.id_pr AS id_pr_op
                  FROM rueda_detalle rd
                  INNER JOIN rueda_lote rl ON rl.id_rl = rd.id_rl
                  LEFT JOIN rueda_flota rf ON rf.id_rd = rd.id_rd AND rf.estado = 'Operativa'
                  WHERE rd.estado <> 'Baja'
                  ORDER BY (rd.estado = 'Disponible') DESC, rl.fecha_compra DESC, rd.id_rd ASC";

    $stmt = $conexion->prepare($sqlRuedas);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta de ruedas: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $ruedas = [];
    while ($row = $result->fetch_assoc()) {
        $ruedas[] = $row;
    }
    $stmt->close();

    $sqlNombres = "SELECT nombre_posicion, COUNT(*) AS cantidad
                   FROM posicion_rueda
                   GROUP BY nombre_posicion
                   ORDER BY nombre_posicion ASC";

    $stmt = $conexion->prepare($sqlNombres);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta de nombres: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $nombres = [];
    while ($row = $result->fetch_assoc()) {
        $nombres[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Ruedas de flota obtenidas correctamente",
        "data" => [
            "placa" => $placa,
            "posiciones" => $posiciones,
            "ruedas" => $ruedas,
            "nombres" => $nombres
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>