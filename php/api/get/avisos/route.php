<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {

    $sqlRuedas = "SELECT rf.placa, rf.id_rf,
                         COALESCE(p.nombre_posicion, '-') AS posicion,
                         rd.id_rd, rd.codigo,
                         mr.nombre_marca_rueda, mr.media_viajes,
                         rd.viajes_hechos, rl.fecha_compra
                  FROM rueda_flota rf
                  INNER JOIN rueda_detalle rd ON rd.id_rd = rf.id_rd
                  INNER JOIN rueda_lote rl ON rl.id_rl = rd.id_rl
                  INNER JOIN marca_rueda mr ON mr.id_marca_rueda = rd.id_marca_rueda
                  LEFT JOIN posicion_rueda p ON p.id_pr = rf.id_pr
                  WHERE rf.estado = 'Operativa'
                    AND mr.media_viajes IS NOT NULL
                    AND mr.media_viajes > 0
                    AND rd.estado <> 'Baja'
                  ORDER BY (rd.viajes_hechos / mr.media_viajes) DESC, rf.placa ASC";

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

    $sqlAceite = "SELECT f.placa, f.viajes_aceite, f.aceite_actual, f.capacidad_aceite,
                         (SELECT MAX(af.fecha_uso) FROM aceite_flota af
                          WHERE af.placa = f.placa AND af.fecha_uso > '0000-00-00') AS ultimo_cambio
                  FROM flota f
                  WHERE f.viajes_aceite > 0
                  ORDER BY f.viajes_aceite DESC, f.placa ASC";

    $stmt = $conexion->prepare($sqlAceite);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta de aceites: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $aceites = [];
    while ($row = $result->fetch_assoc()) {
        $aceites[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Avisos obtenidos correctamente",
        "ruedas" => $ruedas,
        "aceites" => $aceites
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
