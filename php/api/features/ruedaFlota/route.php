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

    if (!$accion || !$id_rd) {
        throw new Exception("Faltan parametros (accion, id_rd).");
    }

    if (!in_array($accion, ["instalar", "mover", "quitar"])) {
        throw new Exception("Accion no valida.");
    }

    $sql = "SELECT id_rd, estado FROM rueda_detalle WHERE id_rd = ?";
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

    if ($accion === "instalar" || $accion === "mover") {
        $placa = isset($data['placa']) ? trim($data['placa']) : "";
        if ($placa === "") {
            throw new Exception("Falta la placa.");
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
    }

    $conexion->autocommit(false);

    if ($accion === "instalar" || $accion === "mover") {
        if ($rueda['estado'] !== 'Operativo') {
            $sql = "UPDATE rueda_detalle SET estado = 'Operativo' WHERE id_rd = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $id_rd);
            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar el estado de la rueda: " . $stmt->error);
            }
            $stmt->close();
        }
    } elseif ($accion === "quitar") {
        $sql = "UPDATE rueda_detalle SET estado = 'Inactivo' WHERE id_rd = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_rd);
        if (!$stmt->execute()) {
            throw new Exception("Error al actualizar el estado de la rueda: " . $stmt->error);
        }
        $stmt->close();
    }

    $sql = "UPDATE rueda_flota SET estado = 'Baja' WHERE id_rd = ? AND estado = 'Operativo'";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_rd);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar rueda_flota: " . $stmt->error);
    }
    $stmt->close();

    if ($accion === "instalar" || $accion === "mover") {
        $sql = "INSERT INTO rueda_flota (id_rd, placa, viajes_hechos, estado, fecha_instalacion) VALUES (?,?,0,'Operativo',NOW())";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("is", $id_rd, $placa);
        if (!$stmt->execute()) {
            throw new Exception("Error al instalar la rueda: " . $stmt->error);
        }
        $stmt->close();
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