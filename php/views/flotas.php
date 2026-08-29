<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT f.placa, f.propietario, IFNULL(e1.empleado, 'Sin Asignar') AS chofer1, IFNULL(e2.empleado, 'Sin Asignar') AS chofer2, IFNULL(fe.nombre_estado_flota, 'Sin estado') AS estado, IFNULL(u.nombre_ubicacion, 'Sin ubicacion') AS ubicacion, f.viajes
            FROM flota f
            LEFT JOIN empleado e1 ON e1.id_empleado = f.chofer1
            LEFT JOIN empleado e2 ON e2.id_empleado = f.chofer2
            LEFT JOIN flota_estados fe ON fe.id_fe = f.id_fe
            LEFT JOIN ubicacion u ON u.id_u = f.id_u
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
