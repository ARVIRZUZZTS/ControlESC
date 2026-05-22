<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_lote'])) {
        throw new Exception("Parámetro 'id_lote' no proporcionado");
    }
    
    $sql = "SELECT *
            FROM rueda_individual
            WHERE id_rr = ?";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("s", $_GET['id_lote']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $ruedas = [];
    
    while ($row = $result->fetch_assoc()) {
        $ruedas[] = $row;
    }
    
    $stmt->close();
    
    if (count($ruedas) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontraron ruedas individuales"
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "message" => "Ruedas individuales obtenidas correctamente",
            "data" => $ruedas
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>