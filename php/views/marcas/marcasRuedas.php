<?php
require_once("../../conexion.php");

$sql = "SELECT *
        FROM marca_rueda
        ORDER BY marca_rueda ASC";

$stmt = $conexion->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$rueda = [];

while ($row = $result->fetch_assoc()) {
    $rueda[] = $row;
}

$stmt->close();

header('Content-Type: application/json');
echo json_encode($rueda);
?>