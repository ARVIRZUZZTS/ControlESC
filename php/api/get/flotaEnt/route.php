<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa'])) {
        throw new Exception("Parámetro 'placa' no proporcionado");
    }
    
    $sql = "SELECT f.placa, f.propietario, IFNULL(e1.empleado, 'Sin Asignar') AS chofer1, IFNULL(e2.empleado, 'Sin Asignar') AS chofer2, f.estado, f.ubicacion, f.viajes
            FROM flota f
            INNER JOIN empleado e1 ON e1.id_empleado = f.chofer1
            LEFT JOIN empleado e2 ON e2.id_empleado = f.chofer2
            WHERE placa = ?";

    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("s", $_GET['placa']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Flota no encontrada"
        ]);
    } else {
        $flota = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "message" => "Flota obtenida correctamente",
            "data" => $flota
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>