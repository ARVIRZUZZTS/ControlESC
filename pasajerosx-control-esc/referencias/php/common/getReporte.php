<?php
include "../conexion.php";

$codR = $_GET['codR'] ?? null;

if (!$codR) {
    echo json_encode(null);
    exit;
}

$sql = "SELECT * FROM reporte WHERE codR = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $codR);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode($result->fetch_assoc());
?>