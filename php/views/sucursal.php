<?php
require_once("../conexion.php");
require_once("../supabase.php");

header('Content-Type: application/json');

$sucursales = [];
$origen = "supabase";

try {
    $filas = supabaseSucursalListar();
    if ($conexion) {
        foreach ($filas as $s) {
            $id = (string)($s['id_sucursal'] ?? $s['id'] ?? '');
            $nombre = $s['nombre'] ?? '';
            if ($id === '') continue;
            $stmt = $conexion->prepare("INSERT INTO sucursal (id_sucursal, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)");
            if ($stmt) {
                $stmt->bind_param("ss", $id, $nombre);
                $stmt->execute();
                $stmt->close();
            }
        }
    }
    foreach ($filas as $s) {
        $sucursales[] = [
            "id_sucursal" => (int)$s['id_sucursal'],
            "nombre" => $s['nombre']
        ];
    }
} catch (Exception $e) {
    /* Sin red: se lee del espejo local */
    $origen = "local";
    if ($conexion) {
        try {
            $res = $conexion->query("SELECT id_sucursal, nombre FROM sucursal ORDER BY id_sucursal ASC");
            while ($row = $res->fetch_assoc()) {
                $sucursales[] = [
                    "id_sucursal" => (int)$row['id_sucursal'],
                    "nombre" => $row['nombre']
                ];
            }
        } catch (Exception $e2) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error al cargar sucursales: " . $e2->getMessage()
            ]);
            exit;
        }
    }
}

echo json_encode([
    "status" => "success",
    "origen" => $origen,
    "sucursales" => $sucursales
]);
