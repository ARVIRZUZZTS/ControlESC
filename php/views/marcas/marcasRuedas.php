<?php
require_once("../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT *
            FROM marca_rueda
            ORDER BY nombre_marca_rueda ASC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $rueda = [];

    while ($row = $result->fetch_assoc()) {
        $rueda[] = $row;
    }

    $stmt->close();
    echo json_encode($rueda);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar marcas de ruedas: " . $e->getMessage()
    ]);
}
?>
