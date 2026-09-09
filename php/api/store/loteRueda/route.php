<?php
require_once "../../../conexion.php";

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos validos.");
    }

    if (!isset($data['ruedas']) || !is_array($data['ruedas']) || count($data['ruedas']) === 0) {
        throw new Exception("No se recibieron ruedas.");
    }

    $fecha_compra = isset($data['fecha_compra']) ? $data['fecha_compra'] : null;
    $cantidad = count($data['ruedas']);

    $precio_real = isset($data['precio_total']) ? floatval($data['precio_total']) : 0;

    $precio_estimado = 0;
    $sqlPrecioMarca = "SELECT precio_unitario FROM marca_rueda WHERE id_marca_rueda = ?";
    $stmtPrecioMarca = $conexion->prepare($sqlPrecioMarca);
    if (!$stmtPrecioMarca) {
        throw new Exception("Error en la preparacion del precio de marca: " . $conexion->error);
    }
    foreach ($data['ruedas'] as $r) {
        $id_marca = intval($r['id_marca_rueda']);
        $stmtPrecioMarca->bind_param("i", $id_marca);
        $stmtPrecioMarca->execute();
        $resPrecio = $stmtPrecioMarca->get_result();
        $filaPrecio = $resPrecio->fetch_assoc();
        $precio_estimado += $filaPrecio ? floatval($filaPrecio['precio_unitario']) : 0;
    }
    $stmtPrecioMarca->close();

    if ($precio_real <= 0) {
        $precio_real = $precio_estimado;
    }
    $estado_precio = $precio_real > $precio_estimado ? "Subio" : ($precio_real < $precio_estimado ? "Bajo" : "Mantuvo");

    $conexion->autocommit(false);

    $sqlLote = "INSERT INTO rueda_lote (precio_total, precio_estimado, precio_real, estado_precio, cantidad, stock, fecha_compra, estado) VALUES (?,?,?,?,?,?,?, 'Operativo')";
    $stmtLote = $conexion->prepare($sqlLote);
    if (!$stmtLote) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }
    $stock = $cantidad;
    $stmtLote->bind_param("dddsiis", $precio_real, $precio_estimado, $precio_real, $estado_precio, $cantidad, $stock, $fecha_compra);
    if (!$stmtLote->execute()) {
        throw new Exception("Error al ejecutar el lote: " . $stmtLote->error);
    }
    $id_rl = $stmtLote->insert_id;
    $stmtLote->close();

    $sqlDetalle = "INSERT INTO rueda_detalle (id_rl, id_marca_rueda, codigo, precio_rueda, viajes_hechos, estado) VALUES (?,?,?,?,?,?)";
    $stmtDetalle = $conexion->prepare($sqlDetalle);
    if (!$stmtDetalle) {
        throw new Exception("Error en la preparacion del detalle: " . $conexion->error);
    }

    foreach ($data['ruedas'] as $r) {
        $id_marca = intval($r['id_marca_rueda']);
        $precio_rueda = floatval($r['precio_rueda']);
        $codigo = "-";
        $viajes = 0;
        $estado = "Inactivo";
        $stmtDetalle->bind_param("iisdis", $id_rl, $id_marca, $codigo, $precio_rueda, $viajes, $estado);
        if (!$stmtDetalle->execute()) {
            throw new Exception("Error al guardar una rueda del lote: " . $stmtDetalle->error);
        }
    }
    $stmtDetalle->close();

    $conexion->commit();
    $conexion->autocommit(true);

    echo json_encode([
        "status" => "success",
        "message" => "Lote de ruedas guardado correctamente",
        "id" => $id_rl,
        "precio_estimado" => $precio_estimado,
        "precio_real" => $precio_real
    ]);

} catch (Exception $e) {
    if (isset($conexion) && !$conexion->errno && $conexion->connect_errno === 0) {
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
