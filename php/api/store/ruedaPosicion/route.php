<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $placa = isset($data['placa']) ? strtoupper(trim($data['placa'])) : "";
    if ($placa === "" || !preg_match('/^\d{3,5}-[A-Z]{3}$/', $placa)) {
        throw new Exception("Placa invalida.");
    }

    $posiciones = isset($data['posiciones']) && is_array($data['posiciones']) ? $data['posiciones'] : [];
    foreach ($posiciones as $p) {
        $nombre = isset($p['nombre_posicion']) ? trim($p['nombre_posicion']) : "";
        if ($nombre === "") {
            throw new Exception("Todas las posiciones deben tener un nombre.");
        }
        if (!isset($p['posicion_x']) || !isset($p['posicion_y']) || !is_numeric($p['posicion_x']) || !is_numeric($p['posicion_y'])) {
            throw new Exception("Posicion con coordenadas invalidas.");
        }
        $x = floatval($p['posicion_x']);
        $y = floatval($p['posicion_y']);
        if ($x < 0 || $x > 100 || $y < 0 || $y > 100) {
            throw new Exception("Coordenadas fuera de rango (0-100).");
        }
        $tipo = isset($p['tipo']) ? $p['tipo'] : "simple";
        if (!in_array($tipo, ["simple", "doble"])) {
            throw new Exception("Tipo de posicion invalido.");
        }
    }

    $sql = "SELECT placa FROM flota WHERE placa = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) {
        throw new Exception("Placa no valida.");
    }
    $stmt->close();

    $conexion->autocommit(false);

    $sqlSel = "SELECT id_pr, nombre_posicion FROM posicion_rueda WHERE placa = ?";
    $stmt = $conexion->prepare($sqlSel);
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $resSel = $stmt->get_result();
    $existentes = [];
    while ($fila = $resSel->fetch_assoc()) {
        $existentes[$fila['nombre_posicion']] = intval($fila['id_pr']);
    }
    $stmt->close();

    $idsConservados = [];

    $sqlUpd = "UPDATE posicion_rueda SET posicion_x = ?, posicion_y = ?, tipo = ? WHERE id_pr = ?";
    $stmtUpd = $conexion->prepare($sqlUpd);
    if (!$stmtUpd) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $stmtUpd->bind_param("ddsi", $xUpd, $yUpd, $tipoUpd, $idPrUpd);

    $sqlIns = "INSERT INTO posicion_rueda (nombre_posicion, placa, posicion_x, posicion_y, tipo) VALUES (?,?,?,?,?)";
    $stmtIns = $conexion->prepare($sqlIns);
    if (!$stmtIns) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $tipoIns = "simple";
    $stmtIns->bind_param("ssdds", $nombre, $placa, $x, $y, $tipoIns);

    foreach ($posiciones as $p) {
        $nombre = trim($p['nombre_posicion']);
        $x = floatval($p['posicion_x']);
        $y = floatval($p['posicion_y']);
        $tipo = $p['tipo'] === "doble" ? "doble" : "simple";

        if (isset($existentes[$nombre])) {
            $idPrUpd = $existentes[$nombre];
            $xUpd = $x;
            $yUpd = $y;
            $tipoUpd = $tipo;
            if (!$stmtUpd->execute()) {
                throw new Exception("Error al actualizar una posicion: " . $stmtUpd->error);
            }
            $idsConservados[] = $idPrUpd;
        } else {
            $tipoIns = $tipo;
            if (!$stmtIns->execute()) {
                throw new Exception("Error al guardar una posicion: " . $stmtIns->error);
            }
            $idsConservados[] = $conexion->insert_id;
        }
    }
    $stmtUpd->close();
    $stmtIns->close();

    if (count($idsConservados) > 0) {
        $placeholders = implode(",", array_fill(0, count($idsConservados), "?"));
        $sqlDel = "DELETE FROM posicion_rueda WHERE placa = ? AND id_pr NOT IN ($placeholders)";
        $stmt = $conexion->prepare($sqlDel);
        if (!$stmt) {
            throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
        }
        $types = "s" . str_repeat("i", count($idsConservados));
        $params = array_merge([$placa], $idsConservados);
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            throw new Exception("Error al limpiar posiciones anteriores: " . $stmt->error);
        }
        $stmt->close();
    } else {
        $sqlDel = "DELETE FROM posicion_rueda WHERE placa = ?";
        $stmt = $conexion->prepare($sqlDel);
        if (!$stmt) {
            throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
        }
        $stmt->bind_param("s", $placa);
        if (!$stmt->execute()) {
            throw new Exception("Error al limpiar posiciones anteriores: " . $stmt->error);
        }
        $stmt->close();
    }

    $conexion->commit();
    $conexion->autocommit(true);

    echo json_encode([
        "status" => "success",
        "message" => "Posiciones guardadas correctamente"
    ]);

} catch (Exception $e) {
    if (isset($conexion) && !$conexion->connect_errno) {
        $conexion->rollback();
        $conexion->autocommit(true);
    }
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>