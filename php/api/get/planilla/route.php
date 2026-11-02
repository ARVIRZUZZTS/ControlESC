<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['nombre']) || trim($_GET['nombre']) === "") {
        throw new Exception("Parametro 'nombre' no proporcionado.");
    }
    $nombre = trim($_GET['nombre']);

    $sql = "SELECT id, nombre, tipo, numAs, posX, posY, estado FROM planilla WHERE nombre = ? ORDER BY id ASC";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Planilla obtenida correctamente",
        "data" => $rows
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
