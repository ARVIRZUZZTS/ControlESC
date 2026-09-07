<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    $id_ad = isset($data['id_ad']) ? intval($data['id_ad']) : 0;
    $placa = isset($data['placa']) ? strtoupper(trim($data['placa'])) : "";
    $cantidad = isset($data['cantidad']) ? floatval($data['cantidad']) : 0;

    if (!$id_ad) {
        throw new Exception("Falta el detalle de aceite.");
    }
    if ($placa === "") {
        throw new Exception("Debe elegir una flota (placa).");
    }
    if ($cantidad <= 0) {
        throw new Exception("La cantidad a asignar debe ser mayor a cero.");
    }

    $conexion->autocommit(false);

    $sqlDet = "SELECT ad.id_ad, ad.stock, ma.id_marca_aceite, ua.unidad_aceite, ua.conversion
               FROM aceite_detalle ad
               INNER JOIN marca_aceite ma ON ad.id_marca_aceite = ma.id_marca_aceite
               INNER JOIN unidad_aceite ua ON ua.id_ua = ma.id_ua
               WHERE ad.id_ad = ?
               FOR UPDATE";
    $stmtDet = $conexion->prepare($sqlDet);
    if (!$stmtDet) {
        throw new Exception("Error en la preparacion del detalle: " . $conexion->error);
    }
    $stmtDet->bind_param("i", $id_ad);
    $stmtDet->execute();
    $resDet = $stmtDet->get_result();
    $det = $resDet->fetch_assoc();
    $stmtDet->close();

    if (!$det) {
        throw new Exception("Detalle de aceite no encontrado.");
    }

    $unidad = $det['unidad_aceite'];
    $conversion = floatval($det['conversion']);
    $litros = $cantidad * $conversion;

    $sqlAsig = "SELECT COALESCE(SUM(af.cantidad),0) AS asignado FROM aceite_flota af WHERE af.id_ad = ?";
    $stmtAsig = $conexion->prepare($sqlAsig);
    $stmtAsig->bind_param("i", $id_ad);
    $stmtAsig->execute();
    $resAsig = $stmtAsig->get_result();
    $asig = $resAsig->fetch_assoc();
    $stmtAsig->close();
    $asignado = floatval($asig['asignado']);

    $disponible_tabla = floatval($det['stock']) - $asignado;
    if ($cantidad > $disponible_tabla + 0.0001) {
        throw new Exception("Cantidad supera el stock disponible de esta marca (disponible: " . $disponible_tabla . ").");
    }

    $sqlFlota = "SELECT placa, capacidad_aceite, aceite_actual FROM flota WHERE placa = ? FOR UPDATE";
    $stmtFlota = $conexion->prepare($sqlFlota);
    if (!$stmtFlota) {
        throw new Exception("Error en la preparacion de la flota: " . $conexion->error);
    }
    $stmtFlota->bind_param("s", $placa);
    $stmtFlota->execute();
    $resFlota = $stmtFlota->get_result();
    $flota = $resFlota->fetch_assoc();
    $stmtFlota->close();

    if (!$flota) {
        throw new Exception("Flota (placa) no encontrada.");
    }

    $capacidad = floatval($flota['capacidad_aceite']);
    $actual = floatval($flota['aceite_actual']);

    $sqlOcupado = "SELECT COALESCE(SUM(af.litros),0) AS ocupado FROM aceite_flota af WHERE af.placa = ?";
    $stmtOcupado = $conexion->prepare($sqlOcupado);
    if (!$stmtOcupado) {
        throw new Exception("Error en la preparacion del calculo de ocupado: " . $conexion->error);
    }
    $stmtOcupado->bind_param("s", $placa);
    $stmtOcupado->execute();
    $resOcupado = $stmtOcupado->get_result();
    $ocup = $resOcupado->fetch_assoc();
    $stmtOcupado->close();
    $ocupado = floatval($ocup['ocupado']);

    $nuevo_total = $actual + $ocupado + $litros;

    if ($nuevo_total > $capacidad + 0.0001) {
        $disponible = $capacidad - $actual - $ocupado;
        throw new Exception("La flota " . $placa . " no tiene suficiente capacidad. Le caben " . $disponible . " litros y quieres asignar " . $litros . " litros.");
    }

    $fecha_uso = date('Y-m-d');

    $sqlInsert = "INSERT INTO aceite_flota (id_ad, placa, cantidad, unidad_aceite, litros, estado, fecha_uso) VALUES (?,?,?,?,?, 'En Uso', ?)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    if (!$stmtInsert) {
        throw new Exception("Error en la preparacion del insert: " . $conexion->error);
    }
    $stmtInsert->bind_param("issdss", $id_ad, $placa, $cantidad, $unidad, $litros, $fecha_uso);
    if (!$stmtInsert->execute()) {
        throw new Exception("Error al asignar el aceite: " . $stmtInsert->error);
    }
    $stmtInsert->close();

    $conexion->commit();
    $conexion->autocommit(true);

    echo json_encode([
        "status" => "success",
        "message" => "Aceite asignado correctamente a la flota " . $placa,
        "asignado" => $cantidad,
        "unidad" => $unidad,
        "litros" => $litros
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