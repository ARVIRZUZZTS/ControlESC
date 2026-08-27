<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ua, unidad_aceite, conversion
            FROM unidad_aceite";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $unidad_aceite = [];

    while ($row = $result->fetch_assoc()) {
        $unidad_aceite[] = $row;
    }

    $stmt->close();
    
    echo json_encode([
        "status" => "success",
        "message" => "Unidades de aceite obtenidas correctamente",
        "data" => $unidad_aceite
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>