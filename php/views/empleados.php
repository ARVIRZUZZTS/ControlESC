<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT e.id_empleado, e.empleado, IFNULL(te.tipo_empleado, 'Sin tipo') AS tipo_empleado, IFNULL(e.mensual, 0) AS mensual, IFNULL(e.total, 0) AS total, e.fecha_contrato, e.estado
            FROM empleado e
            LEFT JOIN tipo_empleado te ON te.id_te = e.id_te
            ORDER BY e.empleado";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $empleados = [];

    while ($row = $result->fetch_assoc()) {
        $empleados[] = $row;
    }

    $stmt->close();
    echo json_encode($empleados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar empleados: " . $e->getMessage()
    ]);
}
?>