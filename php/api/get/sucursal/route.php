<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header('Content-Type: application/json');

$sucursales = [];
$origen = "local";

// Si hay red, sincronizar espejo local desde Supabase
$remotas = null;
try {
    $remotas = supabaseSucursalListar();
} catch (Exception $e) {
    $remotas = null;
}

if (is_array($remotas)) {
    $origen = "supabase";
    foreach ($remotas as $s) {
        $id = (string)($s['id_sucursal'] ?? $s['id'] ?? '');
        $nombre = $s['nombre'] ?? '';
        if ($id === '') continue;
        if ($conexion) {
            $stmt = $conexion->prepare("INSERT INTO sucursal (id_sucursal, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)");
            if ($stmt) {
                $stmt->bind_param("ss", $id, $nombre);
                $stmt->execute();
                $stmt->close();
            }
        }
    }
}

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
        echo json_encode([
            "status" => "error",
            "message" => "Error al cargar sucursales: " . $e2->getMessage()
        ]);
        exit;
    }
}

echo json_encode([
    "status" => "success",
    "message" => "Sucursales obtenidas correctamente",
    "origen" => $origen,
    "data" => $sucursales
]);
if ($conexion) $conexion->close();
?>
