<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['tipo']) || !ctype_digit((string)$_GET['tipo'])) {
        throw new Exception("Parámetro 'tipo' no válido");
    }

    $tipo = (int)$_GET['tipo'];

    $sql = "SELECT id_empleado, empleado FROM empleado WHERE id_te = ? ORDER BY empleado";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $tipo);
    $stmt->execute();
    $result = $stmt->get_result();

    $empleados = [];
    while ($row = $result->fetch_assoc()) {
        $empleados[] = $row;
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Empleados obtenidos correctamente",
        "data" => $empleados
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
