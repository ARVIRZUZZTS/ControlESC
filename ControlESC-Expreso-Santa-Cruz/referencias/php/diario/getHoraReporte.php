<?php
include '../conexion.php';

header('Content-Type: application/json');

if (!isset($_GET['codP'])) {
    echo json_encode(['error' => 'Falta el parámetro codP']);
    exit;
}

$codP = $_GET['codP'];
$response = ['hora' => ''];

// Primero obtenemos el codR del pasajero
$query = "SELECT codR FROM persona WHERE codP = ?";
$stmt = $conexion->prepare($query);
$stmt->bind_param("i", $codP);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $codR = $row['codR'];
    
    if ($codR) {
        // Si tiene codR, obtenemos la hora del reporte
        $queryReporte = "SELECT hora FROM reporte WHERE codR = ?";
        $stmtReporte = $conexion->prepare($queryReporte);
        $stmtReporte->bind_param("i", $codR);
        $stmtReporte->execute();
        $resultReporte = $stmtReporte->get_result();
        
        if ($resultReporte->num_rows > 0) {
            $rowReporte = $resultReporte->fetch_assoc();
            $response['hora'] = $rowReporte['hora'];
        }
    }
}

echo json_encode($response);
$conexion->close();
?>