<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_empleado']) || !ctype_digit((string)$_GET['id_empleado'])) {
        throw new Exception("Parámetro 'id_empleado' no válido");
    }

    $id_empleado = (int)$_GET['id_empleado'];

    $sql = "SELECT e.id_empleado, e.empleado, IFNULL(te.tipo_empleado, 'Sin tipo') AS tipo_empleado, IFNULL(e.mensual, 0) AS mensual, IFNULL(e.total, 0) AS total, e.fecha_contrato, e.estado
            FROM empleado e
            LEFT JOIN tipo_empleado te ON te.id_te = e.id_te
            WHERE e.id_empleado = ?";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_empleado);
    $stmt->execute();
    $result = $stmt->get_result();
    $empleado = $result->fetch_assoc();

    if (!$empleado) {
        throw new Exception("Empleado no encontrado.");
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Empleado obtenido correctamente",
        "data" => $empleado
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