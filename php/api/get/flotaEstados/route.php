<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_fe, nombre_estado_flota FROM flota_estados ORDER BY id_fe";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $estados = [];
    while ($row = $result->fetch_assoc()) {
        $estados[] = $row;
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Estados obtenidos correctamente",
        "data" => $estados
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
