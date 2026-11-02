<?php
include "../conexion.php"; // tu archivo de conexión

$c1 = $_POST['c1'];
$l1 = $_POST['l1'];
$c2 = $_POST['c2'];
$l2 = $_POST['l2'];
$ay = $_POST['ay'];
$pl = $_POST['pl'];
$dt = $_POST['dt'];
$fe = $_POST['fe'];
$hr = $_POST['hr'];
$ca = $_POST['ca'];

$sql = "INSERT INTO reporte (con1, lic1, con2, lic2, ayudante, destino, placa, fecha, hora, carril)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssssssssss", $c1, $l1, $c2, $l2, $ay, $dt, $pl, $fe, $hr, $ca);

if ($stmt->execute()) {
    echo json_encode(["codR" => $conexion->insert_id]);
} else {
    echo json_encode(["error" => "No se pudo guardar"]);
}
?>
