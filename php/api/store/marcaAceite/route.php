<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    if (!isset($data['cantidad']) || $data['cantidad'] === '') {
        throw new Exception("La cantidad es obligatoria.");
    }

    $sql = "INSERT INTO marca_aceite (nombre_marca_aceite, cantidad, precio) 
    VALUES (?,?,?)";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $stmt->bind_param("sdd",
        $data['nombre_marca_aceite'],
        $data['cantidad'],
        $data['precio']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Marca de aceite guardada correctamente",
            "id" => $stmt->insert_id
        ]);
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