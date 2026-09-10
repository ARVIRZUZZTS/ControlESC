<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $accion = isset($data['accion']) ? $data['accion'] : null;
    $id_rd = isset($data['id_rd']) ? intval($data['id_rd']) : 0;
    $id_pr = isset($data['id_pr']) ? intval($data['id_pr']) : 0;

    if (!$accion || !$id_rd) {
        throw new Exception("Faltan parametros (accion, id_rd).");
    }

    if (!in_array($accion, ["instalar", "mover", "quitar"])) {
        throw new Exception("Accion no valida.");
    }

    $sql = "SELECT rd.id_rd, rd.estado, rd.id_rl FROM rueda_detalle rd WHERE rd.id_rd = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_rd);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Rueda no encontrada.");
    }
    $rueda = $result->fetch_assoc();
    $stmt->close();

    $placa = isset($data['placa']) ? strtoupper(trim($data['placa'])) : "";

    if ($accion === "instalar" || $accion === "mover") {
        if ($placa === "") {
            throw new Exception("Falta la placa.");
        }
        if ($rueda['estado'] === 'Baja') {
            throw new Exception("No se puede instalar una rueda dada de baja.");
        }

        $sql = "SELECT placa FROM flota WHERE placa = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $placa);
        $stmt->execute();
        $resPlaca = $stmt->get_result();
        if ($resPlaca->num_rows === 0) {
            throw new Exception("Placa no valida.");
        }
        $stmt->close();

        $reemplazada = null;

        if ($id_pr) {
            $sql = "SELECT id_pr, placa FROM posicion_rueda WHERE id_pr = ? AND placa = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("is", $id_pr, $placa);
            $stmt->execute();
            $resPos = $stmt->get_result();
            if ($resPos->num_rows === 0) {
                throw new Exception("Posicion de rueda no valida para la placa.");
            }
            $stmt->close();

            $sql = "SELECT rf.id_rd FROM rueda_flota rf WHERE rf.id_pr = ? AND rf.placa = ? AND rf.estado = 'Operativo'";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("is", $id_pr, $placa);
            $stmt->execute();
            $resAct = $stmt->get_result();
            $actual = $resAct->fetch_assoc();
            $stmt->close();

            if ($actual && intval($actual['id_rd']) === $id_rd) {
                echo json_encode([
                    "status" => "success",
                    "message" => "La rueda ya esta en esa posicion."
                ]);
                return;
            }

            if ($actual) {
                $reemplazada = intval($actual['id_rd']);
            }
        }
    }

    $wasOperativo = $rueda['estado'] === 'Operativo';

    $conexion->autocommit(false);

    if ($accion === "instalar" || $accion === "mover") {
        if (!$wasOperativo) {
            $sql = "UPDATE rueda_detalle SET estado = 'Operativo' WHERE id_rd = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $id_rd);
            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar el estado de la rueda: " . $stmt->error);
            }
            $stmt->close();

            $sql = "UPDATE rueda_lote SET stock = GREATEST(stock - 1, 0) WHERE id_rl = ? AND stock > 0";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $rueda['id_rl']);
            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar el stock del lote: " . $stmt->error);
            }
            $stmt->close();
        } else {
            $sql = "UPDATE rueda_flota SET estado = 'Baja' WHERE id_rd = ? AND estado = 'Operativo'";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $id_rd);
            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar rueda_flota: " . $stmt->error);
            }
            $stmt->close();
        }

        if ($id_pr && $reemplazada !== null) {
            $sql = "SELECT rd.id_rl FROM rueda_detalle rd WHERE rd.id_rd = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $reemplazada);
            $stmt->execute();
            $resRep = $stmt->get_result();
            $detRep = $resRep->fetch_assoc();
            $stmt->close();

            $sql = "UPDATE rueda_flota SET estado = 'Baja' WHERE id_pr = ? AND placa = ? AND estado = 'Operativo'";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("is", $id_pr, $placa);
            if (!$stmt->execute()) {
                throw new Exception("Error al reemplazar la rueda de la posicion: " . $stmt->error);
            }
            $stmt->close();

            $sql = "UPDATE rueda_detalle SET estado = 'Disponible' WHERE id_rd = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $reemplazada);
            if (!$stmt->execute()) {
                throw new Exception("Error al cambiar la rueda reemplazada a Disponible: " . $stmt->error);
            }
            $stmt->close();

            if ($detRep && $detRep['id_rl']) {
                $sql = "UPDATE rueda_lote SET stock = stock + 1 WHERE id_rl = ?";
                $stmt = $conexion->prepare($sql);
                $stmt->bind_param("i", $detRep['id_rl']);
                if (!$stmt->execute()) {
                    throw new Exception("Error al actualizar el stock del lote: " . $stmt->error);
                }
                $stmt->close();
            }
        }

        $sql = "INSERT INTO rueda_flota (id_rd, placa, id_pr, viajes_hechos, estado, fecha_instalacion) VALUES (?,?,?,0,'Operativo',NOW())";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la insercion: " . $conexion->error);
        }
        $idPrBind = $id_pr ? $id_pr : null;
        $stmt->bind_param("isi", $id_rd, $placa, $idPrBind);
        if (!$stmt->execute()) {
            throw new Exception("Error al instalar la rueda: " . $stmt->error);
        }
        $stmt->close();
    } elseif ($accion === "quitar") {
        $idAfectado = $id_rd;
        $loteAfectado = $rueda['id_rl'];

        if ($id_pr) {
            $sql = "SELECT rf.id_rd, rd.id_rl FROM rueda_flota rf
                    INNER JOIN rueda_detalle rd ON rd.id_rd = rf.id_rd
                    WHERE rf.id_pr = ? AND rf.placa = ? AND rf.estado = 'Operativo'";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("is", $id_pr, $placa);
            $stmt->execute();
            $res = $stmt->get_result();
            $fila = $res->fetch_assoc();
            $stmt->close();

            if (!$fila) {
                throw new Exception("No hay rueda operativa en esa posicion.");
            }
            $idAfectado = intval($fila['id_rd']);
            $loteAfectado = $fila['id_rl'];

            $sql = "UPDATE rueda_flota SET estado = 'Baja' WHERE id_pr = ? AND placa = ? AND estado = 'Operativo'";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("is", $id_pr, $placa);
        } else {
            $sql = "UPDATE rueda_flota SET estado = 'Baja' WHERE id_rd = ? AND estado = 'Operativo'";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $id_rd);
        }

        if (!$stmt->execute()) {
            throw new Exception("Error al dar de baja la rueda en rueda_flota: " . $stmt->error);
        }
        $stmt->close();

        $sql = "SELECT rd.estado FROM rueda_detalle rd WHERE rd.id_rd = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idAfectado);
        $stmt->execute();
        $res = $stmt->get_result();
        $detAfectado = $res->fetch_assoc();
        $stmt->close();

        if ($detAfectado && $detAfectado['estado'] === 'Operativo') {
            $sql = "UPDATE rueda_detalle SET estado = 'Disponible' WHERE id_rd = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $idAfectado);
            if (!$stmt->execute()) {
                throw new Exception("Error al cambiar la rueda a Disponible: " . $stmt->error);
            }
            $stmt->close();

            if ($loteAfectado) {
                $sql = "UPDATE rueda_lote SET stock = stock + 1 WHERE id_rl = ?";
                $stmt = $conexion->prepare($sql);
                $stmt->bind_param("i", $loteAfectado);
                if (!$stmt->execute()) {
                    throw new Exception("Error al actualizar el stock del lote: " . $stmt->error);
                }
                $stmt->close();
            }
        }
    }

    $conexion->commit();
    $conexion->autocommit(true);

    echo json_encode([
        "status" => "success",
        "message" => "Operacion realizada correctamente"
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