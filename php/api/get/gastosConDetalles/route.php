<?php
require_once("../../../conexion.php");

header('Content-Type: application/json');

try {
    $sql = "SELECT id_gasto_estimado, titulo, gasto_generico
            FROM gasto_estimado
            ORDER BY id_gasto_estimado ASC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $gastos = [];
    $ids = [];
    while ($row = $result->fetch_assoc()) {
        $row['detalles'] = [];
        $gastos[] = $row;
        $ids[] = (int)$row['id_gasto_estimado'];
    }
    $stmt->close();

    if (count($ids) > 0) {
        $in = implode(",", array_fill(0, count($ids), "?"));
        $sqlDet = "SELECT id_detalle_estimado, id_gasto_estimado, detalle, gasto_particular
                   FROM detalle_estimado
                   WHERE id_gasto_estimado IN ($in)
                   ORDER BY id_detalle_estimado ASC";

        $stmt = $conexion->prepare($sqlDet);
        if ($stmt) {
            $types = str_repeat("i", count($ids));
            $params = [];
            foreach ($ids as $k => $id) {
                $params[] = $id;
            }
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();

            $detalles = [];
            while ($row = $result->fetch_assoc()) {
                $detalles[$row['id_gasto_estimado']][] = $row;
            }
            $stmt->close();

            foreach ($gastos as $k => $g) {
                if (isset($detalles[$g['id_gasto_estimado']])) {
                    $gastos[$k]['detalles'] = $detalles[$g['id_gasto_estimado']];
                }
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Gastos obtenidos correctamente",
        "data" => $gastos
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