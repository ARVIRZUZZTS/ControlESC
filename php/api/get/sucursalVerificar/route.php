<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

/*
 * Verificacion de solo lectura: compara la copia local con Supabase.
 * NUNCA escribe: la direccion real es admin -> Supabase.
 * Sirve para confirmar que la copia quedo igual y avisar si
 * alguien toco la nube fuera de este sistema.
 */

header('Content-Type: application/json');

try {
    if (!$conexion) {
        throw new Exception("Base local no disponible.");
    }

    $locales = [];
    $res = $conexion->query("SELECT id_sucursal, nombre FROM sucursal ORDER BY id_sucursal ASC");
    while ($row = $res->fetch_assoc()) {
        $locales[(int)$row['id_sucursal']] = $row['nombre'];
    }

    $nube = [];
    $offline = false;
    try {
        $filas = supabaseSucursalListar();
        foreach ($filas as $s) {
            $nube[(int)$s['id_sucursal']] = $s['nombre'];
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

    /* Diff: ids/nombres distintos en cualquier direccion.
       Los pendientes offline (id >= 1000) son del local, no cuentan. */
    $dif = 0;
    foreach ($nube as $id => $nombre) {
        if (!array_key_exists($id, $locales) || $locales[$id] !== $nombre) $dif++;
    }
    foreach ($locales as $id => $nombre) {
        if ($id < 1000 && !array_key_exists($id, $nube)) $dif++;
    }

    $data = [];
    foreach ($nube as $id => $nombre) {
        $data[] = ["id_sucursal" => $id, "nombre" => $nombre];
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
