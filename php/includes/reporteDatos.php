<?php
require_once(__DIR__ . "/../constantes.php");

function valDec($v) {
    return (isset($v) && is_numeric($v)) ? (float)$v : null;
}

function valFecha($v) {
    return (isset($v) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) ? $v : null;
}

function sanTxt($v, $len) {
    return isset($v) ? substr(trim($v), 0, $len) : null;
}

/* Columnas de reporte en orden fijo + sus valores ya saneados */
function reporteColumnas() {
    return ["placa", "fecha_partida", "fecha_retorno", "fecha_llegada",
        "liquidacion_pasajes", "liquidacion_encomiendas", "liquidacion_pasajes_auxiliar",
        "diesel_partida", "diesel_llegada", "factura_diesel_partida", "factura_diesel_retorno",
        "peaje_ida", "peaje_retorno", "otros", "ingresos", "gasto_otros", "gastos_totales",
        "ubicacion_retorno", "ubicacion_llegada", "asignacion_efectivo", "asignacion_qr"];
}

const REPORTE_TIPOS = "ssssdddddiiddssddssdd";

function reporteValores($data) {
    return [
        isset($data['placa']) ? trim($data['placa']) : "",
        valFecha($data['fecha_partida'] ?? null),
        valFecha($data['fecha_retorno'] ?? null),
        valFecha($data['fecha_llegada'] ?? null),
        valDec($data['liquidacion_pasajes'] ?? null),
        valDec($data['liquidacion_encomiendas'] ?? null),
        valDec($data['liquidacion_pasajes_auxiliar'] ?? null),
        valDec($data['diesel_partida'] ?? null),
        valDec($data['diesel_llegada'] ?? null),
        !empty($data['factura_diesel_partida']) ? 1 : 0,
        !empty($data['factura_diesel_retorno']) ? 1 : 0,
        valDec($data['peaje_ida'] ?? null),
        valDec($data['peaje_retorno'] ?? null),
        sanTxt($data['otros'] ?? null, 300),
        sanTxt($data['ingresos'] ?? null, 300),
        valDec($data['gasto_otros'] ?? null),
        valDec($data['gastos_totales'] ?? null),
        sanTxt($data['ubicacion_retorno'] ?? null, 25),
        sanTxt($data['ubicacion_llegada'] ?? null, 50),
        valDec($data['asignacion_efectivo'] ?? null),
        valDec($data['asignacion_qr'] ?? null)
    ];
}

function reporteInsertar($conexion, $data) {
    $cols = reporteColumnas();
    $vals = reporteValores($data);
    $ph = implode(", ", array_fill(0, count($cols), "?"));

    $stmt = $conexion->prepare("INSERT INTO reporte (" . implode(", ", $cols) . ") VALUES ($ph)");
    if (!$stmt) {
        throw new Exception("Error al preparar el reporte: " . $conexion->error);
    }
    $refs = [];
    foreach ($vals as $k => $v) $refs[] = &$vals[$k];
    $stmt->bind_param(REPORTE_TIPOS, ...$refs);
    if (!$stmt->execute()) {
        throw new Exception("Error al guardar el reporte: " . $stmt->error);
    }
    $id = $stmt->insert_id;
    $stmt->close();
    return $id;
}

function reporteActualizar($conexion, $id_reporte, $data) {
    $cols = reporteColumnas();
    $vals = reporteValores($data);
    /* ingresos ya no se edita en pantalla: si no llega, se conserva */
    $sets = [];
    foreach ($cols as $i => $c) {
        $sets[] = $c . " = " . ($c === "ingresos" ? "COALESCE(?, ingresos)" : "?");
    }

    $stmt = $conexion->prepare("UPDATE reporte SET " . implode(", ", $sets) . " WHERE id_reporte = ?");
    if (!$stmt) {
        throw new Exception("Error en la preparacion del reporte: " . $conexion->error);
    }
    $refs = [];
    foreach ($vals as $k => $v) $refs[] = &$vals[$k];
    $refs[] = &$id_reporte;
    $stmt->bind_param(REPORTE_TIPOS . "i", ...$refs);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el reporte: " . $stmt->error);
    }
    $stmt->close();
}

function reporteGastos($data) {
    return (isset($data['gastos']) && is_array($data['gastos'])) ? $data['gastos'] : [];
}

function reporteAnomalias($data) {
    return (isset($data['anomalias']) && is_array($data['anomalias'])) ? $data['anomalias'] : [];
}

function reporteBorrarDetalles($conexion, $id_reporte) {
    $sqlDelResp = "DELETE r FROM responsable r
                   INNER JOIN gasto g ON g.id_gasto = r.id_gasto
                   WHERE g.id_reporte = ?";
    $stmt = $conexion->prepare($sqlDelResp);
    if (!$stmt) throw new Exception("Error al preparar la eliminacion de responsables: " . $conexion->error);
    $stmt->bind_param("i", $id_reporte);
    if (!$stmt->execute()) throw new Exception("Error al eliminar responsables: " . $stmt->error);
    $stmt->close();

    $stmt = $conexion->prepare("DELETE FROM gasto WHERE id_reporte = ?");
    if (!$stmt) throw new Exception("Error al preparar la eliminacion de gastos: " . $conexion->error);
    $stmt->bind_param("i", $id_reporte);
    if (!$stmt->execute()) throw new Exception("Error al eliminar gastos: " . $stmt->error);
    $stmt->close();

    $stmt = $conexion->prepare("DELETE FROM anomalia WHERE id_reporte = ?");
    if (!$stmt) throw new Exception("Error al preparar la eliminacion de anomalias: " . $conexion->error);
    $stmt->bind_param("i", $id_reporte);
    if (!$stmt->execute()) throw new Exception("Error al eliminar anomalias: " . $stmt->error);
    $stmt->close();
}

function reporteGuardarDetalles($conexion, $id_reporte, $gastos, $anomalias) {
    $stmtG = $conexion->prepare("INSERT INTO gasto (id_reporte, titulo, gasto_generico) VALUES (?, ?, ?)");
    if (!$stmtG) throw new Exception("Error al preparar los gastos: " . $conexion->error);
    $stmtR = $conexion->prepare("INSERT INTO responsable (id_gasto, id_personal) VALUES (?, ?)");
    if (!$stmtR) throw new Exception("Error al preparar los responsables: " . $conexion->error);

    foreach ($gastos as $g) {
        $titulo = sanTxt($g['titulo'] ?? "", 100);
        $precio = valDec($g['gasto_generico'] ?? null);
        if (($titulo === null || $titulo === "") && $precio === null) continue;

        $stmtG->bind_param("isd", $id_reporte, $titulo, $precio);
        if (!$stmtG->execute()) throw new Exception("Error al guardar un gasto: " . $stmtG->error);
        $id_gasto = $stmtG->insert_id;

        $id_personal = isset($g['id_personal']) && is_numeric($g['id_personal']) && (int)$g['id_personal'] > 0 ? (int)$g['id_personal'] : 0;
        if ($id_personal > 0) {
            $stmtR->bind_param("ii", $id_gasto, $id_personal);
            if (!$stmtR->execute()) throw new Exception("Error al guardar un responsable: " . $stmtR->error);
        }
    }
    $stmtG->close();
    $stmtR->close();

    $stmtA = $conexion->prepare("INSERT INTO anomalia (id_reporte, detalle_anomalia, gasto_subanomalia) VALUES (?, ?, ?)");
    if (!$stmtA) throw new Exception("Error al preparar las anomalias: " . $conexion->error);

    foreach ($anomalias as $a) {
        $detalle = sanTxt($a['detalle_anomalia'] ?? "", 150);
        $monto = valDec($a['gasto_subanomalia'] ?? null);
        if (($detalle === null || $detalle === "") && $monto === null) continue;

        $stmtA->bind_param("isd", $id_reporte, $detalle, $monto);
        if (!$stmtA->execute()) throw new Exception("Error al guardar una anomalia: " . $stmtA->error);
    }
    $stmtA->close();
}

function reporteGuardarTodo($conexion, $id_reporte, $data) {
    reporteBorrarDetalles($conexion, $id_reporte);
    reporteGuardarDetalles($conexion, $id_reporte, reporteGastos($data), reporteAnomalias($data));
}

function registrarAnomalia($conexion, $placa, $tipo, $evento, $detalle, $viajes = null, $limite = null, $id_rd = null) {
    $stmt = $conexion->prepare("INSERT INTO anomalia_sistema
        (placa, tipo, evento, id_rd, viajes, limite, fecha, detalle)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)");
    if (!$stmt) throw new Exception("Error al preparar la anomalia del sistema: " . $conexion->error);

    $idRd = ($id_rd === null) ? null : (int)$id_rd;
    $stmt->bind_param("sssiiis", $placa, $tipo, $evento, $idRd, $viajes, $limite, $detalle);
    if (!$stmt->execute()) throw new Exception("Error al registrar la anomalia: " . $stmt->error);
    $stmt->close();
}
