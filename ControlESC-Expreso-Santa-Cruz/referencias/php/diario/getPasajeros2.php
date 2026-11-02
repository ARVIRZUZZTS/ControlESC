<?php
include "../conexion.php";

$codP = $_GET['codP'] ?? null;

if (!$codP) {
    echo json_encode(null);
    exit;
}

$sql = "SELECT * FROM persona WHERE codP = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $codP);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode($result->fetch_assoc());
?>