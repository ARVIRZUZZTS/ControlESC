<?php
require_once("../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT *
            FROM marca_aceite ma
            INNER JOIN unidad_aceite ua ON ua.id_ua = ma.id_ua
            ORDER BY ma.nombre_marca_aceite DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $aceite = [];

    while ($row = $result->fetch_assoc()) {
        $aceite[] = $row;
    }

    $stmt->close();
    echo json_encode($aceite);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar marcas de aceite: " . $e->getMessage()
    ]);
}
?>
