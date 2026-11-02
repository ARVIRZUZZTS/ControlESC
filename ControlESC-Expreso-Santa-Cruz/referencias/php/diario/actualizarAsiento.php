<?php
include "../conexion.php";

$data = json_decode(file_get_contents('php://input'), true);
$codP = $data['codP'] ?? null;
$asiento = $data['asiento'] ?? null;
$codR = $data['codR'] ?? null; // Nuevo parámetro

if (!$codP || !$asiento || !$codR) {
    echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    exit;
}

// Verificar que el asiento no esté ocupado en el NUEVO reporte
$sql = "SELECT codP FROM persona WHERE codR = ? AND asiento = ? AND codP != ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("iii", $codR, $asiento, $codP);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "error" => "El asiento ya está ocupado en este reporte"]);
    exit;
}

// Actualizar el asiento
$sql = "UPDATE persona SET asiento = ? WHERE codP = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ii", $asiento, $codP);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
?>