<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header("Content-Type: application/json");

$online = true;
try {
    supabaseSucursalListar();
} catch (Exception $e) {
    $online = false;
}

echo json_encode([
    "status" => "success",
    "online" => $online
]);
$conexion->close();
?>
