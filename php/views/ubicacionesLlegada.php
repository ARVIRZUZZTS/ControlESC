<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ubicaciones_llegada, nombre_ubicaciones_llegada
            FROM ubicaciones_llegada
            ORDER BY id_ubicaciones_llegada";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $ubicaciones = [];

    while ($row = $result->fetch_assoc()) {
        $ubicaciones[] = $row;
    }

    $stmt->close();
    echo json_encode($ubicaciones);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar ubicaciones de llegada: " . $e->getMessage()
    ]);
}
?>