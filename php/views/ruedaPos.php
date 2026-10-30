<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT pr.id_pr AS id, pr.nombre_posicion AS nombrePosicion, pr.placa,
                   f.color1, f.color2, f.color_texto
            FROM posicion_rueda pr
            LEFT JOIN flota f ON f.placa = pr.placa";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $ruedasPosicion = [];

    while ($row = $result->fetch_assoc()) {
        $ruedasPosicion[] = $row;
    }

    $stmt->close();
    echo json_encode($ruedasPosicion);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar posiciones: " . $e->getMessage()
    ]);
}
?>
