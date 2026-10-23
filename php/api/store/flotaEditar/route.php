<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    if (empty($data['placa'])) {
        throw new Exception("La placa es obligatoria.");
    }

    $propietario = $data['propietario'] ?? '';
    $chofer1 = (int)($data['chofer1'] ?? 0);
    $chofer2 = (int)($data['chofer2'] ?? 0);
    $id_fe = (int)($data['id_fe'] ?? 0);
    $id_u = (int)($data['id_u'] ?? 0);
    $color1 = isset($data['color1']) ? trim($data['color1']) : '';
    $color2 = isset($data['color2']) ? trim($data['color2']) : '';
    if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color1)) { $color1 = '#6366f1'; }
    if ($color2 !== '' && !preg_match('/^#[0-9a-fA-F]{6}$/', $color2)) { $color2 = ''; }
    if ($color2 === '') { $color2 = null; }

    $sql = "UPDATE flota SET propietario = ?, chofer1 = ?, chofer2 = ?, id_fe = ?, id_destino = ?, color1 = ?, color2 = ? WHERE placa = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("siiiisss",
        $propietario,
        $chofer1,
        $chofer2,
        $id_fe,
        $id_u,
        $color1,
        $color2,
        $data['placa']
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows >= 0) {
            echo json_encode([
                "status" => "success",
                "message" => "Flota actualizada correctamente"
            ]);
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    } else {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }

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

