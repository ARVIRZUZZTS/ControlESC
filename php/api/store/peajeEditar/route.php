<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_peaje']) || !isset($data['nombre_peaje']) || !isset($data['peaje'])) {
        throw new Exception("Datos incompletos.");
    }

    $id = (int)$data['id_peaje'];
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

    $stmt = $conexion->prepare("UPDATE peajes SET nombre_peaje = ?, peaje = ? WHERE id_peaje = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("sdi", $nombre, $peaje, $id);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el peaje: " . $stmt->error);
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Peaje actualizado correctamente"
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
