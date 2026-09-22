<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_diesel, precio_x_litro, fecha_guardado, estado, litros_comprados_totales, precio_total_pagado
            FROM diesel
            WHERE estado = 'activo'
            ORDER BY fecha_guardado DESC, id_diesel DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $diesel = [];

    while ($row = $result->fetch_assoc()) {
        $diesel[] = $row;
    }

    $stmt->close();
    echo json_encode($diesel);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar diesel: " . $e->getMessage()
    ]);
}
?>