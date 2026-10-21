<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header('Content-Type: application/json');

try {
    if (!$conexion) {
        throw new Exception("Base local no disponible.");
    }

    $locales = [];
    $res = $conexion->query("SELECT id, nombre_destino FROM destinos ORDER BY id");
    while ($row = $res->fetch_assoc()) {
        $locales[$row['nombre_destino']] = (int)$row['id'];
    }

    $offline = false;
    $remotos = [];
    try {
        $filas = supabaseDestinoListar();
        foreach ($filas as $d) {
            $remotos[$d['nombre_destino']] = $d;
        }
    } catch (SupabaseOfflineException $e) {
        $offline = true;
    }

    if ($offline) {
        echo json_encode([
            "status" => "success",
            "offline" => true,
            "diferencias" => 0,
            "data" => []
        ]);
        exit;
    }

    /* Diff por nombre: solo cuenta destinos remotos que faltan en local.
       Los destinos locales que no existen en Supabase (ej. La Paz) no generan novedad permanente. */
    $dif = 0;
    foreach ($remotos as $nombre => $d) {
        if (!isset($locales[$nombre])) $dif++;
    }

    $data = [];
    foreach ($remotos as $d) {
        $data[] = $d;
    }

    echo json_encode([
        "status" => "success",
        "offline" => false,
        "diferencias" => $dif,
        "data" => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>