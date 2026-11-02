<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['nombre']) || trim($data['nombre']) === "") {
        throw new Exception("El nombre de la planilla es obligatorio.");
    }

    $nombre = trim($data['nombre']);

    $stmt = $conexion->prepare("DELETE FROM planilla WHERE nombre = ?");
    if (!$stmt) throw new Exception("Error al preparar la eliminacion: " . $conexion->error);
    $stmt->bind_param("s", $nombre);
    if (!$stmt->execute()) throw new Exception("Error al eliminar la planilla: " . $stmt->error);
    $stmt->close();

    // desasignar de flota
    $stmt = $conexion->prepare("UPDATE flota SET nombre_planilla = NULL WHERE nombre_planilla = ?");
    if ($stmt) {
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode([
        "status" => "success",
        "message" => "Planilla eliminada correctamente"
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
