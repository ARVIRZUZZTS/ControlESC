<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $placa = isset($data['placa']) ? strtoupper(trim($data['placa'])) : "";
    $propietario = isset($data['propietario']) ? trim($data['propietario']) : "";
    $chofer1 = isset($data['chofer1']) ? intval($data['chofer1']) : 0;
    $chofer2 = isset($data['chofer2']) ? intval($data['chofer2']) : 0;
    $id_fe = isset($data['id_fe']) ? intval($data['id_fe']) : 0;
    $id_u = isset($data['id_u']) ? intval($data['id_u']) : 0;

    if (!preg_match('/^\d{3,5}-[A-Z]{3}$/', $placa)) {
        throw new Exception("Placa invalida. Formato: 3-5 numeros, guion y 3 letras (ej: 3056-EAY)");
    }

    $sql = "SELECT placa FROM flota WHERE placa = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows > 0) {
        throw new Exception("Esa placa ya esta registrada.");
    }
    $stmt->close();

    $sql = "INSERT INTO flota (placa, propietario, chofer1, chofer2, id_fe, id_u, viajes) VALUES (?,?,?,?,?,?,0)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("ssiiii", $placa, $propietario, $chofer1, $chofer2, $id_fe, $id_u);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar la flota: " . $stmt->error);
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Flota creada correctamente"
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