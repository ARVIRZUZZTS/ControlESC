<?php
require_once("../conexion.php");

$sql = "SELECT rr.id_rr, rr.precio_unitario, rr.precio_total, rr.cantidad, rr.en_uso, rr.fecha_compra, mr.marca_rueda
        FROM rueda_reporte rr
        INNER JOIN marca_rueda mr ON rr.id_marca_rueda = mr.id_marca_rueda
        ORDER BY fecha_compra DESC";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$ruedas = [];

while ($row = $result->fetch_assoc()) {
    $ruedas[] = $row;
}

$stmt->close();

header('Content-Type: application/json');
echo json_encode($ruedas);
?>