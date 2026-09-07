<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa'])) {
        throw new Exception("Parametro 'placa' no proporcionado");
    }
    $placa = $_GET['placa'];

    $sql = "SELECT placa, capacidad_aceite, aceite_actual FROM flota WHERE placa = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Flota no encontrada"
        ]);
        $stmt->close();
        $conexion->close();
        exit;
    }

    $flota = $result->fetch_assoc();
    $stmt->close();

    $flota['disponible_aceite'] = floatval($flota['capacidad_aceite']) - floatval($flota['aceite_actual']);

    echo json_encode([
        "status" => "success",
        "message" => "Capacidad de flota obtenida correctamente",
        "data" => $flota
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