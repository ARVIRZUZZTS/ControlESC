<?php
require_once(__DIR__ . "/reporteDatos.php");

/* Datos de la flota que afectan el calculo de aceite */
function leerFlotaAceite($conexion, $placa, $bloquear = true) {
    $sql = "SELECT placa, capacidad_aceite, aceite_actual, viajes, viajes_aceite
            FROM flota WHERE placa = ?" . ($bloquear ? " FOR UPDATE" : "");
    $stmt = $conexion->prepare($sql);
    if (!$stmt) throw new Exception("Error al preparar la consulta de flota: " . $conexion->error);
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $res = $stmt->get_result();
    $flota = $res->num_rows > 0 ? $res->fetch_assoc() : null;
    $stmt->close();
    if (!$flota) throw new Exception("Flota (placa) no encontrada.");
    return $flota;
}

function aplicarViajesFlota($conexion, $flota, $viajes, $aceite_consumido) {
    $stmt = $conexion->prepare("UPDATE flota
        SET viajes = viajes + ?,
            viajes_aceite = viajes_aceite + ?,
            aceite_actual = GREATEST(aceite_actual - ?, 0)
        WHERE placa = ?");
    if (!$stmt) throw new Exception("Error al preparar el update de viajes: " . $conexion->error);
    $stmt->bind_param("iids", $viajes, $viajes, $aceite_consumido, $flota['placa']);
    if (!$stmt->execute()) throw new Exception("Error al actualizar los viajes de la flota: " . $stmt->error);
    $stmt->close();
}

function aplicarViajesRuedas($conexion, $placa, $viajes) {
    $sql = "UPDATE rueda_detalle rd
            INNER JOIN rueda_flota rf ON rf.id_rd = rd.id_rd
            SET rd.viajes_hechos = rd.viajes_hechos + ?
            WHERE rf.placa = ? AND rf.estado = 'Operativa'";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) throw new Exception("Error al preparar el update de ruedas: " . $conexion->error);
    $stmt->bind_param("is", $viajes, $placa);
    if (!$stmt->execute()) throw new Exception("Error al actualizar los viajes de las ruedas: " . $stmt->error);
    $afectadas = $stmt->affected_rows;
    $stmt->close();

    $stmt = $conexion->prepare("UPDATE rueda_flota SET viajes_hechos = viajes_hechos + ?
                                WHERE placa = ? AND estado = 'Operativa'");
    if (!$stmt) throw new Exception("Error al preparar el update de rueda_flota: " . $conexion->error);
    $stmt->bind_param("is", $viajes, $placa);
    if (!$stmt->execute()) throw new Exception("Error al actualizar los viajes de rueda_flota: " . $stmt->error);
    $stmt->close();

    return $afectadas;
}

/* Vida util de una rueda concreta (viajes acumulados de toda su vida) */
function vidaUtilRueda($conexion, $id_rd) {
    $sql = "SELECT rd.id_rd, rd.codigo, rd.viajes_hechos, rd.estado,
                   mr.nombre_marca_rueda, mr.media_viajes
            FROM rueda_detalle rd
            LEFT JOIN marca_rueda mr ON mr.id_marca_rueda = rd.id_marca_rueda
            WHERE rd.id_rd = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) throw new Exception("Error al consultar la rueda: " . $conexion->error);
    $stmt->bind_param("i", $id_rd);
    $stmt->execute();
    $res = $stmt->get_result();
    $rueda = $res->num_rows > 0 ? $res->fetch_assoc() : null;
    $stmt->close();
    return $rueda;
}

function anomaliasDePlaca($conexion, $placa, $evento) {
    $stmt = $conexion->prepare("SELECT id_as FROM anomalia_sistema
                                WHERE placa = ? AND evento = ? AND fecha = CURDATE()
                                LIMIT 1");
    if (!$stmt) return false;
    $stmt->bind_param("ss", $placa, $evento);
    $stmt->execute();
    $existe = $stmt->get_result()->num_rows > 0;
    $stmt->close();
    return $existe;
}
