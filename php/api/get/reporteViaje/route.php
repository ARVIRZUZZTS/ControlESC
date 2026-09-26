<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['placa']) || trim($_GET['placa']) === "") {
        throw new Exception("Parametro 'placa' no proporcionado.");
    }
    $placa = trim($_GET['placa']);

    $sqlFlota = "SELECT f.placa, f.id_fe, f.id_ubicacion AS id_u,
                        COALESCE(fe.nombre_estado_flota, 'Sin estado') AS estado,
                        COALESCE(u.nombre_ubicacion, 'Sin ubicacion') AS ubicacion
                 FROM flota f
                 LEFT JOIN flota_estados fe ON fe.id_fe = f.id_fe
                 LEFT JOIN ubicacion u ON u.id_ubicacion = f.id_ubicacion
                 WHERE f.placa = ?";

    $stmt = $conexion->prepare($sqlFlota);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Flota no encontrada"
        ]);
        $stmt->close();
        $conexion->close();
        exit;
    }
    $flota = $result->fetch_assoc();
    $stmt->close();

    $sqlRep = "SELECT * FROM reporte
               WHERE placa = ? AND fecha_llegada IS NULL
               ORDER BY id_reporte DESC LIMIT 1";

    $stmt = $conexion->prepare($sqlRep);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    $reporte = $result->num_rows > 0 ? $result->fetch_assoc() : null;
    $stmt->close();

    $gastos = [];
    $anomalias = [];

    if ($reporte) {
        $id_reporte = (int)$reporte['id_reporte'];

        $sqlGastos = "SELECT g.id_gasto, g.titulo, g.gasto_generico, r.id_responsable, r.id_personal
                      FROM gasto g
                      LEFT JOIN responsable r ON r.id_gasto = g.id_gasto
                      WHERE g.id_reporte = ?
                      ORDER BY g.id_gasto ASC";

        $stmt = $conexion->prepare($sqlGastos);
        if (!$stmt) {
            throw new Exception("Error al preparar los gastos: " . $conexion->error);
        }
        $stmt->bind_param("i", $id_reporte);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $gastos[] = $row;
        }
        $stmt->close();

        $sqlAnom = "SELECT id_anomalia, detalle_anomalia, gasto_subanomalia
                    FROM anomalia
                    WHERE id_reporte = ?
                    ORDER BY id_anomalia ASC";

        $stmt = $conexion->prepare($sqlAnom);
        if (!$stmt) {
            throw new Exception("Error al preparar las anomalias: " . $conexion->error);
        }
        $stmt->bind_param("i", $id_reporte);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $anomalias[] = $row;
        }
        $stmt->close();
    }

    echo json_encode([
        "status" => "success",
        "message" => "Reporte obtenido correctamente",
        "flota" => $flota,
        "reporte" => $reporte,
        "gastos" => $gastos,
        "anomalias" => $anomalias
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