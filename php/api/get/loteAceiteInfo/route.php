<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    if (!isset($_GET['id_lote'])) {
        throw new Exception("Parametro 'id_lote' no proporcionado");
    }
    $id_lote = $_GET['id_lote'];

    $sqlLote = "SELECT al.id_al, al.precio_total, al.precio_estimado, al.precio_real, al.estado_precio, al.cantidad, al.stock_total, al.fecha_compra,
                       (SELECT GROUP_CONCAT(DISTINCT ma.nombre_marca_aceite ORDER BY ma.nombre_marca_aceite SEPARATOR ', ')
                        FROM aceite_detalle ad
                        INNER JOIN marca_aceite ma ON ad.id_marca_aceite = ma.id_marca_aceite
                        WHERE ad.id_al = al.id_al) AS marcas
                FROM aceite_lote al
                WHERE al.id_al = ?";

    $stmt = $conexion->prepare($sqlLote);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->bind_param("i", $id_lote);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Lote de aceite no encontrado"
        ]);
        $stmt->close();
        $conexion->close();
        exit;
    }

    $lote = $result->fetch_assoc();
    $stmt->close();

    $sqlDetalle = "SELECT ad.id_ad, ad.id_marca_aceite, ad.precio_ingresado, ad.stock, ad.estado,
                          ma.nombre_marca_aceite, ma.precio, ua.id_ua, ua.unidad_aceite, ua.conversion,
                          (SELECT COALESCE(SUM(af.cantidad),0) FROM aceite_flota af WHERE af.id_ad = ad.id_ad) AS asignado
                   FROM aceite_detalle ad
                   INNER JOIN marca_aceite ma ON ad.id_marca_aceite = ma.id_marca_aceite
                   INNER JOIN unidad_aceite ua ON ua.id_ua = ma.id_ua
                   WHERE ad.id_al = ?
                   ORDER BY ad.id_ad ASC";

    $stmtDetalle = $conexion->prepare($sqlDetalle);
    if (!$stmtDetalle) {
        throw new Exception("Error al preparar el detalle: " . $conexion->error);
    }
    $stmtDetalle->bind_param("i", $id_lote);
    $stmtDetalle->execute();
    $resultDetalle = $stmtDetalle->get_result();

    $detalles = [];
    while ($row = $resultDetalle->fetch_assoc()) {
        $row['asignado'] = floatval($row['asignado']);
        $row['disponible'] = floatval($row['stock']) - $row['asignado'];
        $detalles[] = $row;
    }
    $stmtDetalle->close();

    echo json_encode([
        "status" => "success",
        "message" => "Lote de aceite obtenido correctamente",
        "data" => $lote,
        "detalles" => $detalles
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>