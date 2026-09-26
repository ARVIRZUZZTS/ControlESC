<?php
require_once("../../../conexion.php");
require_once("../../../includes/reporteDatos.php");

header('Content-Type: application/json');

$tx = false;

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['placa']) || trim($data['placa']) === "") {
        throw new Exception("La placa es obligatoria.");
    }

    $tx = false;
    try {
        $conexion->begin_transaction();
        $tx = true;
    } catch (Exception $e) {
        throw new Exception("Error al iniciar transaccion: " . $e->getMessage());
    }

    $id_reporte = reporteInsertar($conexion, $data);
    reporteGuardarDetalles($conexion, $id_reporte, reporteGastos($data), reporteAnomalias($data));

    $conexion->commit();
    $tx = false;

    echo json_encode([
        "status" => "success",
        "message" => "Reporte guardado correctamente",
        "id" => $id_reporte
    ]);

} catch (Exception $e) {
    if (isset($conexion) && $tx) {
        $conexion->rollback();
    }
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>
