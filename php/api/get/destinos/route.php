<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header('Content-Type: application/json');

$destinos = [];

try {
    $sql = "SELECT id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono, precio_peaje FROM destinos ORDER BY id";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
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

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Destinos obtenidos correctamente",
        "data" => $destinos
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