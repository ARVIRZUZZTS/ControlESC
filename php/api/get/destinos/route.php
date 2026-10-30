<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header('Content-Type: application/json');

$destinos = [];

// Si hay red, sincronizar espejo local desde Supabase (preservando precio_peaje local)
$remotos = null;
try {
    $remotos = supabaseDestinoListar();
} catch (Exception $e) {
    $remotos = null;
}

if (is_array($remotos) && $conexion) {
    foreach ($remotos as $d) {
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

if ($conexion) {
    try {
        $sql = "SELECT id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono FROM destinos ORDER BY id";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conexion->error);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $destinos[] = [
                "id" => $row['id'],
                "nombre_destino" => $row['nombre_destino'],
                "tiene_tramos" => (bool)$row['tiene_tramos'],
                "sucursal" => $row['sucursal'],
                "abrev" => $row['abrev'],
                "informacion" => $row['informacion'],
                "telefono" => $row['telefono']
            ];
        }
        $stmt->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        $conexion->close();
        exit;
    }
}

echo json_encode([
    "status" => "success",
    "message" => "Destinos obtenidos correctamente",
    "data" => $destinos
]);
if ($conexion) $conexion->close();
?>
