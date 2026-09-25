<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ubicaciones_llegada, nombre_ubicaciones_llegada
            FROM ubicaciones_llegada
            ORDER BY id_ubicaciones_llegada";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $ubicaciones = [];
    while ($row = $result->fetch_assoc()) {
        $ubicaciones[] = $row;
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Ubicaciones de llegada obtenidas correctamente",
        "data" => $ubicaciones
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