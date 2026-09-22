<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_te, nombre_tipo_personal FROM tipo_personal ORDER BY nombre_tipo_personal";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $tipos = [];

    while ($row = $result->fetch_assoc()) {
        $tipos[] = $row;
    }

    $stmt->close();
    echo json_encode($tipos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar tipos de personal: " . $e->getMessage()
    ]);
}
?>