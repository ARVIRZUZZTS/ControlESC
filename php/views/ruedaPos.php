<?php
require_once("../conexion.php");

$sql = "SELECT id_pr AS id, nombre_posicion AS nombrePosicion, placa
        FROM posicion_rueda";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();

$ruedasPosicion = [];

while ($row = $result->fetch_assoc()) {
    $ruedasPosicion[] = $row;
}

$stmt->close();

header('Content-Type: application/json');
echo json_encode($ruedasPosicion);
?>