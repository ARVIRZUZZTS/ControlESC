<?php
header('Content-Type: application/json');

include '../conexion.php'; // Incluye el archivo de conexión

$fecha = isset($_GET['fecha']) ? $_GET['fecha'] : '';

$response = [];

if ($conexion) {
    // Consulta para obtener los buses del día específico
    $query = "SELECT r.codR, r.con1, r.lic1, r.con2, r.lic2, r.ayudante, 
                     r.destino, r.placa, r.hora, r.fecha, r.carril
              FROM reporte r
              WHERE r.fecha = ?
              ORDER BY r.hora ASC";
    
    $stmt = $conexion->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $buses = [];
        while ($row = $result->fetch_assoc()) {
            $buses[] = $row;
        }
        
        $response = $buses;
        $stmt->close();
    } else {
        $response = ['error' => 'Error al preparar la consulta'];
    }
    
    $conexion->close();
} else {
    $response = ['error' => 'Error de conexión a la base de datos'];
}

echo json_encode($response);
?>