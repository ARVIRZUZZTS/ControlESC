<?php
include "../conexion.php";

$codR = $_GET['codR'] ?? null;

if (!$codR) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT * FROM persona WHERE codR = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $codR);
$stmt->execute();
$result = $stmt->get_result();

$pasajeros = [];
while ($row = $result->fetch_assoc()) {
    $pasajeros[] = $row;
}

echo json_encode($pasajeros);
?>