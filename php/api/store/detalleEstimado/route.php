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

    if (!isset($data['detalles']) || !is_array($data['detalles']) || count($data['detalles']) === 0) {
        throw new Exception("No se recibieron detalles a guardar.");
    }

    $sqlCheck = "SELECT id_gasto_estimado FROM gasto_estimado WHERE id_gasto_estimado = ?";
    $stmtCheck = $conexion->prepare($sqlCheck);
    if (!$stmtCheck) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $stmtCheck->bind_param("i", $id_gasto_estimado);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    if ($resultCheck->num_rows === 0) {
        $stmtCheck->close();
        throw new Exception("El gasto no existe.");
    }
    $stmtCheck->close();

    $sql = "INSERT INTO detalle_estimado (id_gasto_estimado, detalle, gasto_particular) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $insertados = 0;
    foreach ($data['detalles'] as $det) {
        $texto = isset($det['detalle']) ? trim($det['detalle']) : "";
        $gasto_particular = isset($det['gasto_particular']) && is_numeric($det['gasto_particular']) ? (float)$det['gasto_particular'] : null;

        if ($texto === "") {
            $stmt->close();
            throw new Exception("El detalle no puede estar vacio.");
        }
        if ($gasto_particular !== null && $gasto_particular < 0) {
            $stmt->close();
            throw new Exception("El gasto particular no puede ser negativo.");
        }

        $stmt->bind_param("ssd", $id_gasto_estimado, $texto, $gasto_particular);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception("Error al guardar el detalle: " . $stmt->error);
        }
        $insertados++;
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Detalles guardados correctamente",
        "cantidad" => $insertados
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