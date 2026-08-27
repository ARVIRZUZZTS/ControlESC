<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_pr AS id, nombre_posicion AS nombrePosicion, placa
            FROM posicion_rueda";

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
