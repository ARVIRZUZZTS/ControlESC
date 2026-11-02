<?php
header('Content-Type: application/json');

require '../conexion.php'; // Asume que $conexion es tu variable de conexión MySQLi

$codP = isset($_GET['codP']) ? (int)$_GET['codP'] : 0;

if ($codP <= 0) {
    echo json_encode(['error' => 'Código de pasajero inválido']);
    exit;
}

try {
    // Primero obtener el codR asociado al pasajero
    $query = "SELECT codR FROM persona WHERE codP = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $codP);
    $stmt->execute();
    $result = $stmt->get_result();
    $persona = $result->fetch_assoc();
    
    if (!$persona || !isset($persona['codR'])) {
        echo json_encode(['error' => 'Pasajero no encontrado o sin reporte asignado']);
        exit;
    }
    
    $codR = $persona['codR'];
    
    // Ahora obtener el carril del reporte
    $query = "SELECT carril, placa FROM reporte WHERE codR = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $codR);
    $stmt->execute();
    $result = $stmt->get_result();
    $reporte = $result->fetch_assoc();
    
    if (!$reporte) {
        echo json_encode(['error' => 'Reporte no encontrado']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'carril' => $reporte['carril'] ?? '',
        'placa' => $reporte['placa'] ?? ''
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
}
?>