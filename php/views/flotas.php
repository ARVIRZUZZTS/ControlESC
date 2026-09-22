<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT f.placa, f.propietario, IFNULL(p1.nombre_apellido, 'Sin Asignar') AS chofer1, IFNULL(p2.nombre_apellido, 'Sin Asignar') AS chofer2, IFNULL(fe.nombre_estado_flota, 'Sin estado') AS estado, IFNULL(u.nombre_ubicacion, 'Sin ubicacion') AS ubicacion, f.viajes
            FROM flota f
            LEFT JOIN personal p1 ON p1.id_personal = f.chofer1
            LEFT JOIN personal p2 ON p2.id_personal = f.chofer2
            LEFT JOIN flota_estados fe ON fe.id_fe = f.id_fe
            LEFT JOIN ubicacion u ON u.id_ubicacion = f.id_ubicacion
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
