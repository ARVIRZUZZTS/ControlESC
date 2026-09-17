<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT MIN(id_te) AS id_te, tipo_empleado
            FROM tipo_empleado
            GROUP BY tipo_empleado
            ORDER BY tipo_empleado";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $tipos = [];

    while ($row = $result->fetch_assoc()) {
        $tipos[] = $row;
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Tipos de empleado obtenidos correctamente",
        "data" => $tipos
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