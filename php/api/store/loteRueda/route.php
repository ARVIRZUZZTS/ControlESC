<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $sql = "INSERT INTO rueda_reporte (id_marca_rueda, precio_unitario, precio_total, cantidad, fecha_compra) 
    VALUES (?,?,?,?,?)";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $precio_unitario = ($data['precio_unitario'] === "") ?  $data['precio_total'] / $data['cantidad'] : $data['precio_unitario'];
    $stmt->bind_param("iddis",
        $data['marca_rueda'],
        $precio_unitario,
        $data['precio_total'],
        $data['cantidad'],
        $data['fecha_compra']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Lote de ruedas guardado correctamente",
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