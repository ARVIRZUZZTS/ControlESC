<?php
require_once("../conexion.php");

$sql = "SELECT f.placa, f.propietario, e1.empleado AS chofer1, e2.empleado AS chofer2, f.estado, f.ubicacion, f.viajes
        FROM flota f
        INNER JOIN empleado e1 ON e1.id_empleado = f.chofer1
        INNER JOIN empleado e2 ON e2.id_empleado = f.chofer2
        ORDER BY SUBSTRING_INDEX(placa, '-', -1)";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$flotas = [];

while ($row = $result->fetch_assoc()) {
    $flotas[] = $row;
}

$stmt->close();

header('Content-Type: application/json');
echo json_encode($flotas);
?>