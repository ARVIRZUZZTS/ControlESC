<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['tipo']) || !ctype_digit((string)$_GET['tipo'])) {
        throw new Exception("Parámetro 'tipo' no válido");
    }

    $tipo = (int)$_GET['tipo'];

    $sql = "SELECT id_personal, nombre_apellido FROM personal WHERE id_te = ? ORDER BY nombre_apellido";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $tipo);
    $stmt->execute();
    $result = $stmt->get_result();

    $personal = [];
    while ($row = $result->fetch_assoc()) {
        $personal[] = $row;
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Personal obtenido correctamente",
        "data" => $personal
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