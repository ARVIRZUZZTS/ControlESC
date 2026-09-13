<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    if (empty($data['id_marca_aceite'])) {
        throw new Exception("El id de la marca es obligatorio.");
    }

    if (!isset($data['cantidad']) || $data['cantidad'] === '') {
        throw new Exception("La cantidad es obligatoria.");
    }

    $sql = "UPDATE marca_aceite SET nombre_marca_aceite = ?, cantidad = ?, precio = ? WHERE id_marca_aceite = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $id_marca = (int)$data['id_marca_aceite'];
    $stmt->bind_param("sddi",
        $data['nombre_marca_aceite'],
        $data['cantidad'],
        $data['precio'],
        $id_marca
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Marca de aceite actualizada correctamente"
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