<?php
require_once("../conexion.php");
require_once("../supabase.php");

header('Content-Type: application/json');

$destinos = [];

try {
    $filas = supabaseDestinoListar();
    foreach ($filas as $d) {
        $destinos[] = [
            "id" => (int)$d['id'],
            "nombre_destino" => $d['nombre_destino'],
            "tiene_tramos" => (bool)$d['tiene_tramos'],
            "sucursal" => $d['sucursal'],
            "abrev" => $d['abrev'],
            "informacion" => $d['informacion'],
            "telefono" => $d['telefono'],
            "sincronizado" => isset($d['sincronizado']) ? (int)$d['sincronizado'] : 1
        ];
    }
} catch (Exception $e) {
    /* Sin red: se lee del espejo local */
    if ($conexion) {
        try {
            $res = $conexion->query("SELECT id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono FROM destinos ORDER BY nombre_destino");
            while ($row = $res->fetch_assoc()) {
                $destinos[] = [
                    "id" => (int)$row['id'],
                    "nombre_destino" => $row['nombre_destino'],
                    "tiene_tramos" => (bool)$row['tiene_tramos'],
                    "sucursal" => $row['sucursal'],
                    "abrev" => $row['abrev'],
                    "informacion" => $row['informacion'],
                    "telefono" => $row['telefono']
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
