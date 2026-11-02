<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['placa']) || trim($data['placa']) === "") {
        throw new Exception("La placa es obligatoria.");
    }

    $placa = strtoupper(trim($data['placa']));
    $nombre = isset($data['nombre_planilla']) ? trim($data['nombre_planilla']) : "";
    if ($nombre === "") $nombre = null;

    $stmt = $conexion->prepare("UPDATE flota SET nombre_planilla = ? WHERE placa = ?");
    if (!$stmt) throw new Exception("Error al preparar la actualizacion: " . $conexion->error);
    $stmt->bind_param("ss", $nombre, $placa);
    if (!$stmt->execute()) throw new Exception("Error al asignar la planilla: " . $stmt->error);
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Planilla asignada correctamente"
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
