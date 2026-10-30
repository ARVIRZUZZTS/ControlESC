<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['nombre_peaje']) || !isset($data['peaje'])) {
        throw new Exception("Datos incompletos.");
    }

    $nombre = trim($data['nombre_peaje']);
    $peaje = (float)$data['peaje'];

    if ($nombre === "") {
        throw new Exception("El nombre del peaje es obligatorio.");
    }
    if (mb_strlen($nombre) > 20) {
        throw new Exception("El nombre del peaje debe tener maximo 20 caracteres.");
    }
    if ($peaje < 0) {
        throw new Exception("El peaje debe ser mayor o igual a 0.");
    }

    $stmt = $conexion->prepare("INSERT INTO peajes (nombre_peaje, peaje) VALUES (?, ?)");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("sd", $nombre, $peaje);
    if (!$stmt->execute()) {
        throw new Exception("Error al crear el peaje: " . $stmt->error);
    }
    $id = $stmt->insert_id;
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Peaje creado correctamente",
        "id" => $id
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>
