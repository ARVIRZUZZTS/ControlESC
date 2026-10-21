<?php
require_once("../../../conexion.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

$conteo = syncContar();

echo json_encode([
    "status" => "success",
    "pendientes" => $conteo['pendientes'],
    "errores" => $conteo['errores'],
    "detalle_errores" => syncListarErrores()
]);
