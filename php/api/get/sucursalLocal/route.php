<?php
require_once("../../../conexion.php");

/* Carga instantanea: lee SOLO el espejo local. La verificacion
   contra Supabase corre aparte (sucursalVerificar) sin bloquear. */

header('Content-Type: application/json');

$sucursales = [];

try {
    if (!$conexion) {
        throw new Exception("Base local no disponible.");
    }
    $res = $conexion->query("SELECT id_sucursal, nombre FROM sucursal ORDER BY id_sucursal ASC");
    while ($row = $res->fetch_assoc()) {
        $sucursales[] = [
            "id_sucursal" => (int)$row['id_sucursal'],
            "nombre" => $row['nombre']
        ];
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar sucursales locales: " . $e->getMessage()
    ]);
    exit;
}

echo json_encode([
    "status" => "success",
    "data" => $sucursales
]);
