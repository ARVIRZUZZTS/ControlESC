<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ubicacion, nombre_ubicacion, precio_peaje
            FROM ubicacion
            WHERE precio_peaje IS NOT NULL
            ORDER BY id_ubicacion";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $peajes = [];
    while ($row = $result->fetch_assoc()) {
        $peajes[] = $row;
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Peajes obtenidos correctamente",
        "data" => $peajes
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