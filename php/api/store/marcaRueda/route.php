<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $sql = "INSERT INTO marca_rueda (marca_rueda, modelo, diametro, ancho, perfil, precio, media_viajes) 
    VALUES (?,?,?,?,?,?,?)";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $diametro = ($data['diametro'] === "") ? 0 : $data['diametro'];
    $ancho = ($data['ancho'] === "") ? 0 : $data['ancho'];
    $perfil = ($data['perfil'] === "") ? 0 : $data['perfil'];
    $stmt->bind_param("ssddddi",
        $data['marca_rueda'],
        $data['modelo'],
        $diametro,
        $ancho,
        $perfil,
        $data['precio'],
        $data['media_viajes']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Marca de rueda guardada correctamente",
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