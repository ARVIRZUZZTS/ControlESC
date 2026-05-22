<?php
require_once("../../conexion.php");

$sql = "SELECT *
        FROM marca_aceite ma
        INNER JOIN unidad_aceite ua ON ua.id_ua = ma.unidad_aceite
        ORDER BY marca_aceite DESC";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$aceite = [];

while ($row = $result->fetch_assoc()) {
    $aceite[] = $row;
}

$stmt->close();

header('Content-Type: application/json');
echo json_encode($aceite);
?>