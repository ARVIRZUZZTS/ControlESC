<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_personal']) || !ctype_digit((string)$_GET['id_personal'])) {
        throw new Exception("Parámetro 'id_personal' no válido");
    }

    $id_personal = (int)$_GET['id_personal'];

    $sql = "SELECT p.id_personal, p.nombre_apellido, IFNULL(tp.nombre_tipo_personal, 'Sin tipo') AS tipo_personal, IFNULL(p.mensual, 0) AS mensual, IFNULL(p.total, 0) AS total, p.fecha_contrato, p.estado
            FROM personal p
            LEFT JOIN tipo_personal tp ON tp.id_te = p.id_te
            WHERE p.id_personal = ?";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_personal);
    $stmt->execute();
    $result = $stmt->get_result();
    $personal = $result->fetch_assoc();

    if (!$personal) {
        throw new Exception("Personal no encontrado.");
    }

    $stmt->close();
    echo json_encode([
        "status" => "success",
        "message" => "Personal obtenido correctamente",
        "data" => $personal
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