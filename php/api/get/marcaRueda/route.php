<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_marca_rueda, nombre_marca_rueda, media_viajes
            FROM marca_rueda
            ORDER BY nombre_marca_rueda ASC";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $marcas_ruedas = [];

    while ($row = $result->fetch_assoc()) {
        $marcas_ruedas[] = $row;
    }

    $stmt->close();
    
    echo json_encode([
        "status" => "success",
        "message" => "Marcas de ruedas obtenidas correctamente",
        "data" => $marcas_ruedas
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>