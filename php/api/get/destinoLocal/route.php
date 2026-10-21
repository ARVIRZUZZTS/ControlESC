<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

$destinos = [];

try {
    if (!$conexion) {
        throw new Exception("Base local no disponible.");
    }
    $res = $conexion->query("SELECT id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono, precio_peaje FROM destinos ORDER BY nombre_destino");
    while ($row = $res->fetch_assoc()) {
        $destinos[] = [
            "id" => (int)$row['id'],
            "nombre_destino" => $row['nombre_destino'],
            "tiene_tramos" => (bool)$row['tiene_tramos'],
            "sucursal" => $row['sucursal'],
            "abrev" => $row['abrev'],
            "informacion" => $row['informacion'],
            "telefono" => $row['telefono'],
            "precio_peaje" => $row['precio_peaje']
        ];
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar destinos locales: " . $e->getMessage()
    ]);
    exit;
}

echo json_encode([
    "status" => "success",
    "data" => $destinos
]);
$conexion->close();
?>