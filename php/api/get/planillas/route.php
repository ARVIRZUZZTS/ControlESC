<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT DISTINCT nombre FROM planilla ORDER BY nombre ASC";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $nombres = [];
    while ($row = $result->fetch_assoc()) {
        $nombres[] = $row['nombre'];
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Planillas obtenidas correctamente",
        "data" => $nombres
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
