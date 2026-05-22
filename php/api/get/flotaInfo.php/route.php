<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa'])) {
        throw new Exception("Parámetro 'placa' no proporcionado");
    }
    
    $sql = "SELECT *
            FROM flota
            WHERE placa = ?";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("s", $_GET['placa']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Flota no encontrada"
        ]);
    } else {
        $flota = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "message" => "Flota obtenida correctamente",
            "data" => $flota
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>