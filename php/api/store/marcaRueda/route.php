<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $sql = "INSERT INTO marca_rueda (nombre_marca_rueda, precio_unitario, medida, serie, trilla, aro, media_viajes) 
    VALUES (?,?,?,?,?,?,?)";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $medida = ($data['medida'] === "") ? 0 : $data['medida'];
    $precio = ($data['precio_unitario'] === "" || !isset($data['precio_unitario']) || $data['precio_unitario'] === null) ? 0 : $data['precio_unitario'];
    $stmt->bind_param("sdssssi",
        $data['nombre_marca_rueda'],
        $precio,
        $medida,
        $data['serie'],
        $data['trilla'],
        $data['aro'],
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