<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_subpeaje, precio_subpeaje, fecha_registro
            FROM peaje
            ORDER BY fecha_registro DESC, id_subpeaje DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $peajes = [];

    while ($row = $result->fetch_assoc()) {
        $peajes[] = $row;
    }

    $stmt->close();
    echo json_encode($peajes);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar peajes: " . $e->getMessage()
    ]);
}
?>