<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa'])) {
        throw new Exception("Parámetro 'placa' no proporcionado");
    }
    
    $sql = "SELECT f.placa, f.propietario, f.chofer1, f.chofer2, f.id_fe, f.id_u, f.viajes,
                   COALESCE(e1.empleado, 'Sin Asignar') AS chofer1_nombre,
                   COALESCE(e2.empleado, 'Sin Asignar') AS chofer2_nombre,
                   COALESCE(fe.nombre_estado_flota, 'Sin estado') AS estado,
                   COALESCE(u.nombre_ubicacion, 'Sin ubicacion') AS ubicacion
            FROM flota f
            LEFT JOIN empleado e1 ON e1.id_empleado = f.chofer1
            LEFT JOIN empleado e2 ON e2.id_empleado = f.chofer2
            LEFT JOIN flota_estados fe ON fe.id_fe = f.id_fe
            LEFT JOIN ubicacion u ON u.id_u = f.id_u
            WHERE f.placa = ?";

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
