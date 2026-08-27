<?php
require_once("../conexion.php");

$sql = "SELECT rl.id_rl, rl.precio_unitario, rl.precio_total, rl.cantidad, rl.stock, rl.fecha_compra, mr.nombre_marca_rueda
        FROM rueda_lote rl
        INNER JOIN marca_rueda mr ON rl.id_marca_rueda = mr.id_marca_rueda
        ORDER BY rl.fecha_compra DESC";

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