<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT ge.id_gasto_estimado, ge.titulo, ge.gasto_generico,
                   (SELECT COUNT(*) FROM detalle_estimado de WHERE de.id_gasto_estimado = ge.id_gasto_estimado) AS cant_detalles
            FROM gasto_estimado ge
            ORDER BY ge.id_gasto_estimado DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $gastos = [];

    while ($row = $result->fetch_assoc()) {
        $gastos[] = $row;
    }

    $stmt->close();
    echo json_encode($gastos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar gastos: " . $e->getMessage()
    ]);
}
?>