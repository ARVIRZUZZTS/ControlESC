<?php
require_once("../conexion.php");

$sql = "SELECT r.id_rueda, r.codigo, r.viajes, r.fecha_compra, r.precio, mr.marca_rueda, mr.diametro, mr.grosor, mr.espesor, mr.media_viajes, r.placa, r.estado
        FROM rueda r
        INNER JOIN marca_rueda mr ON r.id_marca_rueda = mr.id_marca_rueda
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