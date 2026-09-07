<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT ma.id_marca_aceite, ma.nombre_marca_aceite, ma.precio, ma.id_ua, ua.unidad_aceite, ua.conversion
            FROM marca_aceite ma
            INNER JOIN unidad_aceite ua ON ua.id_ua = ma.id_ua
            ORDER BY ma.nombre_marca_aceite ASC";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $marcas = [];

    while ($row = $result->fetch_assoc()) {
        $marcas[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Marcas de aceite obtenidas correctamente",
        "data" => $marcas
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