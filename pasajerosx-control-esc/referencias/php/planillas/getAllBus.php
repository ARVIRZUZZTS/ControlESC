<?php
header('Content-Type: application/json');
include '../conexion.php';

$response = [];

if ($conexion) {
    // Obtenemos todos los nombres únicos de buses
    $query = "SELECT DISTINCT nombre FROM planilla ORDER BY nombre";
    $result = $conexion->query($query);
    
    if ($result) {
        $nombres = [];
        while ($row = $result->fetch_assoc()) {
            $nombres[] = $row['nombre'];
        }
        $response = $nombres;
    } else {
        $response = ['error' => 'Error al obtener los buses'];
    }
    
    $conexion->close();
} else {
    $response = ['error' => 'Error de conexión a la base de datos'];
}

echo json_encode($response);
?>