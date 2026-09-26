<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ubicacion, nombre_ubicacion, precio_peaje FROM ubicacion ORDER BY nombre_ubicacion";

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
        "message" => "Error al cargar ubicaciones: " . $e->getMessage()
    ]);
}
?>