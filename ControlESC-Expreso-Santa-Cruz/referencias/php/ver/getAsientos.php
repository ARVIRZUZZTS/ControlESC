<?php
header('Content-Type: application/json');
include '../conexion.php';

$codR = isset($_GET['codR']) ? $_GET['codR'] : '';

$response = [];

if ($conexion) {
    $query = "SELECT asiento, estado FROM persona WHERE codR = ?";
    $stmt = $conexion->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("s", $codR);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $asientosOcupados = [];
        while ($row = $result->fetch_assoc()) {
            $asientosOcupados[$row['asiento']] = $row['estado']; // 1 para ocupado, 0 para libre
        }
        
        $response = $asientosOcupados;
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