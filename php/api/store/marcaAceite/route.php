<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $sql = "INSERT INTO marca_aceite (marca_aceite, cantidad, precio, unidad_aceite, media_viajes) 
    VALUES (?,?,?,?,?)";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $diametro = ($data['diametro'] === "") ? 0 : $data['diametro'];
    $ancho = ($data['ancho'] === "") ? 0 : $data['ancho'];
    $perfil = ($data['perfil'] === "") ? 0 : $data['perfil'];
    $stmt->bind_param("sddii",
        $data['marca_aceite'],
        $data['cantidad'],
        $data['precio'],
        $data['unidad_aceite'],
        $data['media_viajes']
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