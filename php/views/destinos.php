<?php
require_once("../conexion.php");
require_once("../supabase.php");

header('Content-Type: application/json');

$destinos = [];

try {
    $filas = supabaseDestinoListar();
    // Upsert local (preservando precio_peaje)
    if ($conexion) {
        foreach ($filas as $d) {
            $id = (string)($d['id'] ?? '');
            if ($id === '') continue;
            $nombre = $d['nombre_destino'] ?? '';
            $tiene = !empty($d['tiene_tramos']) ? 1 : 0;
            $suc = isset($d['sucursal']) && $d['sucursal'] !== null ? (string)$d['sucursal'] : null;
            $abrev = $d['abrev'] ?? null;
            $info = $d['informacion'] ?? null;
            $tel = $d['telefono'] ?? null;
            $stmt = $conexion->prepare("INSERT INTO destinos (id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre_destino = VALUES(nombre_destino), tiene_tramos = VALUES(tiene_tramos), sucursal = VALUES(sucursal), abrev = VALUES(abrev), informacion = VALUES(informacion), telefono = VALUES(telefono)");
            if ($stmt) {
                $stmt->bind_param("ssissss", $id, $nombre, $tiene, $suc, $abrev, $info, $tel);
                $stmt->execute();
                $stmt->close();
            }
        }
    }
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
