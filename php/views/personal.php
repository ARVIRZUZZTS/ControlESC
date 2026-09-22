<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT p.id_personal, p.nombre_apellido, IFNULL(tp.nombre_tipo_personal, 'Sin tipo') AS tipo_personal, IFNULL(p.mensual, 0) AS mensual, IFNULL(p.total, 0) AS total, p.fecha_contrato, p.estado
            FROM personal p
            LEFT JOIN tipo_personal tp ON tp.id_te = p.id_te
            ORDER BY p.nombre_apellido";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $personal = [];

    while ($row = $result->fetch_assoc()) {
        $personal[] = $row;
    }

    $stmt->close();
    echo json_encode($personal);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar personal: " . $e->getMessage()
    ]);
}
?>