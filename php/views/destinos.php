<?php
require_once("../conexion.php");
require_once("../supabase.php");

header('Content-Type: application/json');

$destinos = [];

try {
    $filas = supabaseDestinoListar();
    // Obtener precio_peaje local para cada destino (campo local-only)
    $precioMap = [];
    if ($conexion) {
        try {
            $res = $conexion->query("SELECT id, precio_peaje FROM destinos");
            while ($row = $res->fetch_assoc()) {
                $precioMap[$row['id']] = $row['precio_peaje'];
            }
        } catch (Exception $e) { /* sin precios locales */ }
    }
    foreach ($filas as $d) {
        $destinos[] = [
            "id" => $d['id'],
            "nombre_destino" => $d['nombre_destino'],
            "tiene_tramos" => (bool)$d['tiene_tramos'],
            "sucursal" => $d['sucursal'],
            "abrev" => $d['abrev'],
            "informacion" => $d['informacion'],
            "telefono" => $d['telefono'],
            "precio_peaje" => isset($precioMap[$d['id']]) ? $precioMap[$d['id']] : null
        ];
    }
} catch (Exception $e) {
    /* Sin red: se lee del espejo local */
    if ($conexion) {
        try {
            $res = $conexion->query("SELECT id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono, precio_peaje FROM destinos ORDER BY nombre_destino");
            while ($row = $res->fetch_assoc()) {
                $destinos[] = [
                    "id" => $row['id'],
                    "nombre_destino" => $row['nombre_destino'],
                    "tiene_tramos" => (bool)$row['tiene_tramos'],
                    "sucursal" => $row['sucursal'],
                    "abrev" => $row['abrev'],
                    "informacion" => $row['informacion'],
                    "telefono" => $row['telefono'],
                    "precio_peaje" => $row['precio_peaje']
                ];
            }
        } catch (Exception $e2) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error al cargar destinos: " . $e2->getMessage()
            ]);
            exit;
        }
    }
}

echo json_encode($destinos);
