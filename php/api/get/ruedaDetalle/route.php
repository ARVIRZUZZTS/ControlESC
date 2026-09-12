<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_rd'])) {
        throw new Exception("Parametro 'id_rd' no proporcionado");
    }

    $id_rd = intval($_GET['id_rd']);

    $sql = "SELECT rd.id_rd, rd.id_rl FROM rueda_detalle rd WHERE rd.id_rd = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_rd);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Rueda no encontrada.");
    }
    $rueda = $result->fetch_assoc();
    $stmt->close();

    $sql = "SELECT rf.placa, pr.nombre_posicion, rf.viajes_hechos, rf.estado,
                   rf.fecha_instalacion, rf.id_rf
            FROM rueda_flota rf
            LEFT JOIN posicion_rueda pr ON pr.id_pr = rf.id_pr AND pr.placa = rf.placa
            WHERE rf.id_rd = ?
            ORDER BY rf.fecha_instalacion DESC, rf.id_rf DESC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta de registros: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_rd);
    $stmt->execute();
    $result = $stmt->get_result();

    $records = [];
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Detalle de rueda obtenido correctamente",
        "data" => [
            "id_rd" => $rueda['id_rd'],
            "id_rl" => $rueda['id_rl'],
            "records" => $records
        ]
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