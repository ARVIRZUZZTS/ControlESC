<?php
require_once("../../../conexion.php");
require_once("../../../includes/mantenimiento.php");

header('Content-Type: application/json');

$tx = false;

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!$data || !isset($data['id_reporte']) || !is_numeric($data['id_reporte'])) {
        throw new Exception("No se recibio el reporte a finalizar.");
    }
    $id_reporte = (int)$data['id_reporte'];

    $sqlRep = "SELECT id_reporte, placa, estado, ubicacion_llegada FROM reporte WHERE id_reporte = ?";
    $stmtRep = $conexion->prepare($sqlRep);
    if (!$stmtRep) {
        throw new Exception("Error al verificar el reporte: " . $conexion->error);
    }
    $stmtRep->bind_param("i", $id_reporte);
    $stmtRep->execute();
    $resRep = $stmtRep->get_result();
    if ($resRep->num_rows === 0) {
        throw new Exception("El reporte no existe.");
    }
    $reporte = $resRep->fetch_assoc();
    $stmtRep->close();

    if ($reporte['estado'] === 'Finalizado') {
        throw new Exception("Este reporte ya fue finalizado anteriormente.");
    }

    $placa = $reporte['placa'];
    if ($placa === null || trim($placa) === "") {
        throw new Exception("El reporte no tiene placa asignada.");
    }

    $fecha_llegada = valFecha($data['fecha_llegada'] ?? null);
    if ($fecha_llegada === null) {
        throw new Exception("Para finalizar el reporte debes indicar la fecha de llegada.");
    }

    $ubicacion_llegada = isset($data['ubicacion_llegada']) && trim($data['ubicacion_llegada']) !== ""
        ? substr(trim($data['ubicacion_llegada']), 0, 50)
        : $reporte['ubicacion_llegada'];
    $data['ubicacion_llegada'] = $ubicacion_llegada;

    $viajes = (isset($data['viajes']) && is_numeric($data['viajes']) && (int)$data['viajes'] > 0)
        ? (int)$data['viajes']
        : countTramos($ubicacion_llegada);
    if ($viajes > MAX_VIAJES_REPORTE) {
        throw new Exception("El reporte indica $viajes viajes y el maximo permitido es " . MAX_VIAJES_REPORTE . ".");
    }

    $tx = false;
    try {
        $conexion->begin_transaction();
        $tx = true;
    } catch (Exception $e) {
        throw new Exception("Error al iniciar transaccion: " . $e->getMessage());
    }

    $flota = leerFlotaAceite($conexion, $placa, true);
    $litros_por_viaje = litrosPorViaje($flota['capacidad_aceite']);
    $aceite_consumido = round($litros_por_viaje * $viajes, 3);
    $aceite_restante = round(floatval($flota['aceite_actual']) - $aceite_consumido, 3);

    reporteActualizar($conexion, $id_reporte, $data);
    reporteGuardarTodo($conexion, $id_reporte, $data);

    $sqlFin = "UPDATE reporte SET estado = 'Finalizado', viajes = ?, aceite_consumido = ?
               WHERE id_reporte = ? AND estado = 'Abierto'";
    $stmtFin = $conexion->prepare($sqlFin);
    if (!$stmtFin) {
        throw new Exception("Error al preparar el cierre del reporte: " . $conexion->error);
    }
    $stmtFin->bind_param("idi", $viajes, $aceite_consumido, $id_reporte);
    if (!$stmtFin->execute()) {
        throw new Exception("Error al finalizar el reporte: " . $stmtFin->error);
    }
    if ($stmtFin->affected_rows === 0) {
        throw new Exception("El reporte ya fue finalizado por otra operacion.");
    }
    $stmtFin->close();

    aplicarViajesFlota($conexion, $flota, $viajes, $aceite_consumido);
    $ruedas = aplicarViajesRuedas($conexion, $placa, $viajes);

    if ($aceite_restante < $litros_por_viaje && !anomaliasDePlaca($conexion, $placa, 'Aceite insuficiente')) {
        registrarAnomalia($conexion, $placa, 'Aceite', 'Aceite insuficiente',
            "Quedan " . number_format(max($aceite_restante, 0), 2, '.', '') . " L y se requieren "
            . number_format($litros_por_viaje, 2, '.', '') . " L por viaje. Programar recarga de aceite.",
            (int)$flota['viajes_aceite'] + $viajes, VIAJES_POR_CAMBIO_ACEITE);
    }

    $conexion->commit();
    $tx = false;

    echo json_encode([
        "status" => "success",
        "message" => "Reporte finalizado correctamente",
        "id" => $id_reporte,
        "viajes" => $viajes,
        "aceite_consumido" => $aceite_consumido,
        "aceite_restante" => max($aceite_restante, 0),
        "ruedas_afectadas" => $ruedas
    ]);

} catch (Exception $e) {
    if (isset($conexion) && $tx) {
        $conexion->rollback();
    }
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>
