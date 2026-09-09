<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_lote'])) {
        throw new Exception("Parametro 'id_lote' no proporcionado");
    }

    $sql = "SELECT rd.id_rd, rd.codigo, rd.precio_rueda, rd.viajes_hechos, rd.estado,
                   mr.nombre_marca_rueda, mr.precio_unitario,
                   (SELECT rf.id_rf FROM rueda_flota rf WHERE rf.id_rd = rd.id_rd ORDER BY rf.id_rf DESC LIMIT 1) AS id_rf,
                   (SELECT rf.placa FROM rueda_flota rf WHERE rf.id_rd = rd.id_rd ORDER BY rf.id_rf DESC LIMIT 1) AS placa,
                   (SELECT rf.estado FROM rueda_flota rf WHERE rf.id_rd = rd.id_rd ORDER BY rf.id_rf DESC LIMIT 1) AS estado_flota
            FROM rueda_detalle rd
            INNER JOIN marca_rueda mr ON rd.id_marca_rueda = mr.id_marca_rueda
            WHERE rd.id_rl = ?
            ORDER BY rd.id_rd ASC";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $_GET['id_lote']);
    $stmt->execute();
    $result = $stmt->get_result();

    $ruedas = [];

    while ($row = $result->fetch_assoc()) {
        $ruedas[] = $row;
    }

    $stmt->close();

    if (count($ruedas) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontraron ruedas individuales"
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "message" => "Ruedas individuales obtenidas correctamente",
            "data" => $ruedas
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
