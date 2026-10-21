<?php
require_once("../../../conexion.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

$res = syncDestinosPull();

echo json_encode([
    "status" => "success",
    "message" => "Destinos actualizados desde Supabase",
    "resumen" => $res
]);
$conexion->close();
?>