<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $titulo = isset($data['titulo']) ? trim($data['titulo']) : "";
    $gasto_generico = isset($data['gasto_generico']) && is_numeric($data['gasto_generico']) ? (float)$data['gasto_generico'] : null;

    if ($titulo === "") {
        throw new Exception("El titulo del gasto es obligatorio.");
    }
    if ($gasto_generico !== null && $gasto_generico < 0) {
        throw new Exception("El gasto generico no puede ser negativo.");
    }

    $sql = "INSERT INTO gasto_estimado (titulo, gasto_generico) VALUES (?, ?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("sd", $titulo, $gasto_generico);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar el gasto: " . $stmt->error);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Gasto guardado correctamente",
        "id" => $stmt->insert_id
    ]);

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>