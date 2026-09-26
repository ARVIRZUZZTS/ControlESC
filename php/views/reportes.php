<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT f.placa,
                   IFNULL(fe.nombre_estado_flota, 'Sin estado') AS estado,
                   IFNULL(u.nombre_ubicacion, 'Sin ubicacion') AS ubicacion,
                   f.id_fe, f.id_ubicacion AS id_u,
                   r.id_reporte, r.estado AS estado_reporte, r.fecha_partida,
                   (SELECT COUNT(*) FROM reporte rt WHERE rt.placa = f.placa AND rt.estado = 'Finalizado') AS finalizados
            FROM flota f
            LEFT JOIN flota_estados fe ON fe.id_fe = f.id_fe
            LEFT JOIN ubicacion u ON u.id_ubicacion = f.id_ubicacion
            LEFT JOIN reporte r ON r.id_reporte = (
                SELECT rr.id_reporte FROM reporte rr
                WHERE rr.placa = f.placa AND rr.estado = 'Abierto'
                ORDER BY rr.id_reporte DESC LIMIT 1
            )
            ORDER BY SUBSTRING_INDEX(f.placa, '-', -1)";

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
        "message" => "Error al cargar reportes: " . $e->getMessage()
    ]);
}
?>