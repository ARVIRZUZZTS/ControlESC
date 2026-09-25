<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

function valDec($v) {
    return (isset($v) && is_numeric($v)) ? (float)$v : null;
}

function valFecha($v) {
    return (isset($v) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) ? $v : null;
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_reporte']) || !is_numeric($data['id_reporte'])) {
        throw new Exception("No se recibio el reporte a editar.");
    }

    $id_reporte = (int)$data['id_reporte'];
    $placa = isset($data['placa']) ? trim($data['placa']) : "";
    $fecha_partida = valFecha($data['fecha_partida'] ?? null);
    $fecha_retorno = valFecha($data['fecha_retorno'] ?? null);
    $fecha_llegada = valFecha($data['fecha_llegada'] ?? null);
    $liquidacion_pasajes = valDec($data['liquidacion_pasajes'] ?? null);
    $liquidacion_encomiendas = valDec($data['liquidacion_encomiendas'] ?? null);
    $liquidacion_pasajes_auxiliar = valDec($data['liquidacion_pasajes_auxiliar'] ?? null);
    $diesel_partida = valDec($data['diesel_partida'] ?? null);
    $diesel_llegada = valDec($data['diesel_llegada'] ?? null);
    $factura_diesel_partida = !empty($data['factura_diesel_partida']) ? 1 : 0;
    $factura_diesel_retorno = !empty($data['factura_diesel_retorno']) ? 1 : 0;
    $peaje_ida = valDec($data['peaje_ida'] ?? null);
    $peaje_retorno = valDec($data['peaje_retorno'] ?? null);
    $otros = isset($data['otros']) ? substr(trim($data['otros']), 0, 300) : null;
    $gasto_otros = valDec($data['gasto_otros'] ?? null);
    $ubicacion_retorno = isset($data['ubicacion_retorno']) ? substr(trim($data['ubicacion_retorno']), 0, 25) : null;
    $ubicacion_llegada = isset($data['ubicacion_llegada']) ? substr(trim($data['ubicacion_llegada']), 0, 50) : null;
    $asignacion_efectivo = valDec($data['asignacion_efectivo'] ?? null);
    $asignacion_qr = valDec($data['asignacion_qr'] ?? null);

    $gastos = isset($data['gastos']) && is_array($data['gastos']) ? $data['gastos'] : [];
    $anomalias = isset($data['anomalias']) && is_array($data['anomalias']) ? $data['anomalias'] : [];

    $tx = false;
    try {
        $conexion->begin_transaction();
        $tx = true;
    } catch (Exception $e) {
        throw new Exception("Error al iniciar transaccion: " . $e->getMessage());
    }

    $sql = "UPDATE reporte SET
            placa = ?, fecha_partida = ?, fecha_retorno = ?, fecha_llegada = ?,
            liquidacion_pasajes = ?, liquidacion_encomiendas = ?, liquidacion_pasajes_auxiliar = ?,
            diesel_partida = ?, diesel_llegada = ?, factura_diesel_partida = ?, factura_diesel_retorno = ?,
            peaje_ida = ?, peaje_retorno = ?, otros = ?, gasto_otros = ?,
            ubicacion_retorno = ?, ubicacion_llegada = ?,
            asignacion_efectivo = ?, asignacion_qr = ?
            WHERE id_reporte = ?";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion del reporte: " . $conexion->error);
    }

    $stmt->bind_param("ssssdddddiiddsdssddi",
        $placa, $fecha_partida, $fecha_retorno, $fecha_llegada,
        $liquidacion_pasajes, $liquidacion_encomiendas, $liquidacion_pasajes_auxiliar,
        $diesel_partida, $diesel_llegada, $factura_diesel_partida, $factura_diesel_retorno,
        $peaje_ida, $peaje_retorno, $otros, $gasto_otros, $ubicacion_retorno, $ubicacion_llegada,
        $asignacion_efectivo, $asignacion_qr, $id_reporte);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el reporte: " . $stmt->error);
    }
    $stmt->close();

    $sqlDelResp = "DELETE r FROM responsable r
                   INNER JOIN gasto g ON g.id_gasto = r.id_gasto
                   WHERE g.id_reporte = ?";
    $stmt = $conexion->prepare($sqlDelResp);
    if (!$stmt) {
        throw new Exception("Error al preparar la eliminacion de responsables: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_reporte);
    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar responsables: " . $stmt->error);
    }
    $stmt->close();

    $sqlDelGasto = "DELETE FROM gasto WHERE id_reporte = ?";
    $stmt = $conexion->prepare($sqlDelGasto);
    if (!$stmt) {
        throw new Exception("Error al preparar la eliminacion de gastos: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_reporte);
    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar gastos: " . $stmt->error);
    }
    $stmt->close();

    $sqlDelAnom = "DELETE FROM anomalia WHERE id_reporte = ?";
    $stmt = $conexion->prepare($sqlDelAnom);
    if (!$stmt) {
        throw new Exception("Error al preparar la eliminacion de anomalias: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_reporte);
    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar anomalias: " . $stmt->error);
    }
    $stmt->close();

    $sqlGasto = "INSERT INTO gasto (id_reporte, titulo, gasto_generico) VALUES (?, ?, ?)";
    $stmtG = $conexion->prepare($sqlGasto);
    if (!$stmtG) {
        throw new Exception("Error al preparar los gastos: " . $conexion->error);
    }

    $sqlResp = "INSERT INTO responsable (id_gasto, id_personal) VALUES (?, ?)";
    $stmtR = $conexion->prepare($sqlResp);
    if (!$stmtR) {
        throw new Exception("Error al preparar los responsables: " . $conexion->error);
    }

    foreach ($gastos as $g) {
        $titulo = isset($g['titulo']) ? substr(trim($g['titulo']), 0, 100) : "";
        $precio = valDec($g['gasto_generico'] ?? null);
        if ($titulo === "" && $precio === null) continue;

        $stmtG->bind_param("isd", $id_reporte, $titulo, $precio);
        if (!$stmtG->execute()) {
            throw new Exception("Error al guardar un gasto: " . $stmtG->error);
        }
        $id_gasto = $stmtG->insert_id;

        $id_personal = isset($g['id_personal']) && is_numeric($g['id_personal']) && (int)$g['id_personal'] > 0 ? (int)$g['id_personal'] : 0;
        if ($id_personal > 0) {
            $stmtR->bind_param("ii", $id_gasto, $id_personal);
            if (!$stmtR->execute()) {
                throw new Exception("Error al guardar un responsable: " . $stmtR->error);
            }
        }
    }
    $stmtG->close();
    $stmtR->close();

    $sqlAnom = "INSERT INTO anomalia (id_reporte, detalle_anomalia, detalle_subanomalia, gasto_subanomalia)
                VALUES (?, ?, ?, ?)";
    $stmtA = $conexion->prepare($sqlAnom);
    if (!$stmtA) {
        throw new Exception("Error al preparar las anomalias: " . $conexion->error);
    }

    foreach ($anomalias as $a) {
        $detalle = isset($a['detalle_anomalia']) ? substr(trim($a['detalle_anomalia']), 0, 150) : "";
        $sub = isset($a['detalle_subanomalia']) ? substr(trim($a['detalle_subanomalia']), 0, 255) : "";
        $monto = valDec($a['gasto_subanomalia'] ?? null);
        if ($detalle === "" && $sub === "" && $monto === null) continue;

        $stmtA->bind_param("issd", $id_reporte, $detalle, $sub, $monto);
        if (!$stmtA->execute()) {
            throw new Exception("Error al guardar una anomalia: " . $stmtA->error);
        }
    }
    $stmtA->close();

    $conexion->commit();
    $tx = false;

    echo json_encode([
        "status" => "success",
        "message" => "Reporte actualizado correctamente",
        "id" => $id_reporte
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