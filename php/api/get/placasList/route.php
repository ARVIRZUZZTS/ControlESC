<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT placa
            FROM flota
            ORDER BY SUBSTRING_INDEX(placa, '-', -1)";
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $placas = [];

    while ($row = $result->fetch_assoc()) {
        $placas[] = $row;
    }

    $stmt->close();
    
    echo json_encode([
        "status" => "success",
        "message" => "Placas obtenidas correctamente",
        "data" => $placas
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>