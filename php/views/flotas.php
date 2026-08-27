<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT f.placa, f.propietario, IFNULL(e1.empleado, 'Sin Asignar') AS chofer1, IFNULL(e2.empleado, 'Sin Asignar') AS chofer2, f.estado, f.ubicacion, f.viajes
            FROM flota f
            INNER JOIN empleado e1 ON e1.id_empleado = f.chofer1
            LEFT JOIN empleado e2 ON e2.id_empleado = f.chofer2
            ORDER BY SUBSTRING_INDEX(placa, '-', -1)";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $flotas = [];

    while ($row = $result->fetch_assoc()) {
        $flotas[] = $row;
    }

    $stmt->close();
    echo json_encode($flotas);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar flotas: " . $e->getMessage()
    ]);
}
?>
