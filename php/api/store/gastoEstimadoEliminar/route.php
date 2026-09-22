<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_gasto_estimado']) || !is_numeric($data['id_gasto_estimado'])) {
        throw new Exception("No se recibio el id del gasto.");
    }

    $id_gasto_estimado = (int)$data['id_gasto_estimado'];

    mysqli_begin_transaction($conexion);

    $sqlDetalles = "DELETE FROM detalle_estimado WHERE id_gasto_estimado = ?";
    $stmtDetalles = $conexion->prepare($sqlDetalles);
    if (!$stmtDetalles) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $stmtDetalles->bind_param("i", $id_gasto_estimado);
    if (!$stmtDetalles->execute()) {
        throw new Exception("Error al eliminar los detalles del gasto: " . $stmtDetalles->error);
    }
    $stmtDetalles->close();

    $sql = "DELETE FROM gasto_estimado WHERE id_gasto_estimado = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_gasto_estimado);

    if (!$stmt->execute()) {
        mysqli_rollback($conexion);
        throw new Exception("Error al eliminar el gasto: " . $stmt->error);
    }

    if ($conexion->affected_rows === 0) {
        mysqli_rollback($conexion);
        $stmt->close();
        throw new Exception("No se encontro un gasto con ese id.");
    }

    $stmt->close();

    mysqli_commit($conexion);

    echo json_encode([
        "status" => "success",
        "message" => "Gasto eliminado correctamente"
    ]);

} catch (Exception $e) {
    if (isset($conexion) && $conexion) {
        mysqli_rollback($conexion);
    }
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>