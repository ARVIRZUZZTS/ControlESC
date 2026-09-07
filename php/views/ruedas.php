<?php
require_once("../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT rl.id_rl, rl.precio_total, rl.cantidad, rl.stock, rl.fecha_compra,
                   (SELECT GROUP_CONCAT(DISTINCT mr.nombre_marca_rueda ORDER BY mr.nombre_marca_rueda SEPARATOR ', ')
                    FROM rueda_detalle rd
                    INNER JOIN marca_rueda mr ON rd.id_marca_rueda = mr.id_marca_rueda
                    WHERE rd.id_rl = rl.id_rl) AS marcas
            FROM rueda_lote rl
            WHERE rl.estado = 'Operativo'
            ORDER BY rl.fecha_compra DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $ruedas = [];

    while ($row = $result->fetch_assoc()) {
        $ruedas[] = $row;
    }

    $stmt->close();
    echo json_encode($ruedas);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar ruedas: " . $e->getMessage()
    ]);
}
?>
