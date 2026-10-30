<?php
require_once("../../../conexion.php");
require_once("../../../constantes.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $placa = isset($data['placa']) ? strtoupper(trim($data['placa'])) : "";
    if ($placa === "") {
        throw new Exception("La placa es obligatoria.");
    }

    $capacidad = isset($data['capacidad_aceite']) ? floatval($data['capacidad_aceite']) : 0;
    $viajes = isset($data['viajes_aceite']) ? intval($data['viajes_aceite']) : 0;

    if ($capacidad < 0) {
        throw new Exception("La capacidad maxima no puede ser negativa.");
    }
    if ($viajes < 0) {
        throw new Exception("Los viajes no pueden ser negativos.");
    }

    $litros_por_viaje = $capacidad > 0 ? round($capacidad / VIAJES_POR_CAMBIO_ACEITE, 3) : 0.0;
    $aceite_actual = round($capacidad - ($litros_por_viaje * $viajes), 3);
    if ($aceite_actual < 0) $aceite_actual = 0.0;
    if ($aceite_actual > $capacidad) $aceite_actual = $capacidad;

    $sql = "UPDATE flota SET capacidad_aceite = ?, viajes_aceite = ?, aceite_actual = ? WHERE placa = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("dids", $capacidad, $viajes, $aceite_actual, $placa);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el aceite de la flota: " . $stmt->error);
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Aceite de flota actualizado correctamente",
        "capacidad_aceite" => $capacidad,
        "viajes_aceite" => $viajes,
        "aceite_actual" => $aceite_actual
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
