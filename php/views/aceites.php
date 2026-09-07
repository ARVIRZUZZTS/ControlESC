<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT al.id_al, al.precio_total, al.cantidad, al.stock_total, al.fecha_compra,
                   (SELECT GROUP_CONCAT(DISTINCT ma.nombre_marca_aceite ORDER BY ma.nombre_marca_aceite SEPARATOR ', ')
                    FROM aceite_detalle ad
                    INNER JOIN marca_aceite ma ON ad.id_marca_aceite = ma.id_marca_aceite
                    WHERE ad.id_al = al.id_al) AS marcas
            FROM aceite_lote al
            WHERE al.estado = 'Operativo'
            ORDER BY al.fecha_compra DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $aceites = [];

    while ($row = $result->fetch_assoc()) {
        $aceites[] = $row;
    }

    $stmt->close();
    echo json_encode($aceites);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar lotes de aceite: " . $e->getMessage()
    ]);
}
$conexion->close();
?>