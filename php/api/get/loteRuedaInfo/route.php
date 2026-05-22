<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_lote'])) {
        throw new Exception("Parámetro 'id_lote' no proporcionado");
    }
    
    $sql = "SELECT rueda_reporte.*, marca_rueda.marca_rueda, marca_rueda.modelo, marca_rueda.precio, marca_rueda.media_viajes
            FROM rueda_reporte
            INNER JOIN marca_rueda ON rueda_reporte.id_marca_rueda = marca_rueda.id_marca_rueda
            WHERE id_rr = ?";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("s", $_GET['id_lote']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Lote de ruedas no encontrado"
        ]);
    } else {
        $lote = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "message" => "Lote de ruedas obtenido correctamente",
            "data" => $lote
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