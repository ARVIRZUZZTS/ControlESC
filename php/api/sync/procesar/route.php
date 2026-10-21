<?php
require_once("../../../conexion.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

$res = syncProcesar();

echo json_encode([
    "status" => "success",
    "message" => "Sincronizacion ejecutada",
    "resumen" => $res
]);
