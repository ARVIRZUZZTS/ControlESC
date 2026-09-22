<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT MIN(id_te) AS id_te, nombre_tipo_personal
            FROM tipo_personal
            GROUP BY nombre_tipo_personal
            ORDER BY nombre_tipo_personal";

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
        "message" => "Tipos de personal obtenidos correctamente",
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