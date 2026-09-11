<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT rd.id_rd, rd.codigo, rd.viajes_hechos, rd.estado,
                   mr.nombre_marca_rueda, rd.precio_rueda, rl.id_rl, rl.fecha_compra,
                   (SELECT rf.placa FROM rueda_flota rf WHERE rf.id_rd = rd.id_rd AND rf.estado = 'Operativa' ORDER BY rf.id_rf DESC LIMIT 1) AS placa_op,
                   (SELECT rf.id_pr FROM rueda_flota rf WHERE rf.id_rd = rd.id_rd AND rf.estado = 'Operativa' ORDER BY rf.id_rf DESC LIMIT 1) AS id_pr_op,
                   (SELECT pr.nombre_posicion FROM rueda_flota rf INNER JOIN posicion_rueda pr ON pr.id_pr = rf.id_pr WHERE rf.id_rd = rd.id_rd AND rf.estado = 'Operativa' ORDER BY rf.id_rf DESC LIMIT 1) AS posicion_op
            FROM rueda_detalle rd
            INNER JOIN rueda_lote rl ON rl.id_rl = rd.id_rl
            INNER JOIN marca_rueda mr ON rd.id_marca_rueda = mr.id_marca_rueda
            ORDER BY (rd.estado = 'Disponible') DESC, rl.fecha_compra DESC, rd.id_rd ASC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $ruedas = [];
    while ($row = $result->fetch_assoc()) {
        $ruedas[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Ruedas obtenidas correctamente",
        "data" => $ruedas
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