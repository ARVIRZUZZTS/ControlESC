<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    if (!isset($data['detalles']) || !is_array($data['detalles']) || count($data['detalles']) === 0) {
        throw new Exception("No se recibieron detalles (marcas) del lote.");
    }

    $fecha_compra = isset($data['fecha_compra']) ? $data['fecha_compra'] : null;

    $precio_total = 0;
    $stock_total = 0;
    foreach ($data['detalles'] as $d) {
        $precio_total += floatval($d['precio_ingresado']);
        $stock_total += floatval($d['stock']);
    }

    $conexion->autocommit(false);

    $sqlLote = "INSERT INTO aceite_lote (precio_total, cantidad, stock_total, estado, fecha_compra) VALUES (?,?,?, 'Operativo', ?)";
    $stmtLote = $conexion->prepare($sqlLote);
    if (!$stmtLote) {
        throw new Exception("Error en la preparacion del lote: " . $conexion->error);
    }
    $stmtLote->bind_param("ddis", $precio_total, $stock_total, $stock_total, $fecha_compra);
    if (!$stmtLote->execute()) {
        throw new Exception("Error al ejecutar el lote: " . $stmtLote->error);
    }
    $id_al = $stmtLote->insert_id;
    $stmtLote->close();

    $sqlDetalle = "INSERT INTO aceite_detalle (id_al, id_marca_aceite, precio_ingresado, stock, estado) VALUES (?,?,?,?, 'Almacen')";
    $stmtDetalle = $conexion->prepare($sqlDetalle);
    if (!$stmtDetalle) {
        throw new Exception("Error en la preparacion del detalle: " . $conexion->error);
    }

    foreach ($data['detalles'] as $d) {
        $id_marca = intval($d['id_marca_aceite']);
        $precio = floatval($d['precio_ingresado']);
        $stock = floatval($d['stock']);
        $stmtDetalle->bind_param("iidd", $id_al, $id_marca, $precio, $stock);
        if (!$stmtDetalle->execute()) {
            throw new Exception("Error al guardar un detalle del lote: " . $stmtDetalle->error);
        }
    }
    $stmtDetalle->close();

    $conexion->commit();
    $conexion->autocommit(true);

    echo json_encode([
        "status" => "success",
        "message" => "Lote de aceite guardado correctamente",
        "id" => $id_al
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