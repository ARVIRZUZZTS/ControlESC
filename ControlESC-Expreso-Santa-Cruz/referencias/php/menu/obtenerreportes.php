<?php
include '../conexion.php'; 

// Consulta SQL
$sql = "SELECT * FROM reporte ORDER BY STR_TO_DATE(fecha, '%d/%m/%Y') DESC";

$stmt = $conexion->prepare($sql);

if ($stmt && $stmt->execute()) {
    $result = $stmt->get_result(); // Obtener los resultados
    $reportes = [];

    while ($fila = $result->fetch_assoc()) {
        $reportes[] = $fila;
    }

    // Devolver los datos en formato JSON
    header('Content-Type: application/json');
    echo json_encode($reportes);
} else {
    // Error al ejecutar o preparar
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener los reportes.']);
}
?>
