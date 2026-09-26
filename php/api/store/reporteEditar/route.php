<?php
require_once("../../../conexion.php");
require_once("../../../includes/reporteDatos.php");

header('Content-Type: application/json');

$tx = false;

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_reporte']) || !is_numeric($data['id_reporte'])) {
        throw new Exception("No se recibio el reporte a editar.");
    }

    $id_reporte = (int)$data['id_reporte'];

    $sqlChk = "SELECT estado FROM reporte WHERE id_reporte = ?";
    $stmtChk = $conexion->prepare($sqlChk);
    if (!$stmtChk) {
        throw new Exception("Error al verificar el reporte: " . $conexion->error);
    }
    $stmtChk->bind_param("i", $id_reporte);
    $stmtChk->execute();
    $resChk = $stmtChk->get_result();
    if ($resChk->num_rows === 0) {
        throw new Exception("El reporte no existe.");
    }
    $chk = $resChk->fetch_assoc();
    $stmtChk->close();

    if ($chk['estado'] === 'Finalizado') {
        throw new Exception("Este reporte ya fue finalizado y no se puede editar.");
    }

    $tx = false;
    try {
        $conexion->begin_transaction();
        $tx = true;
    } catch (Exception $e) {
        throw new Exception("Error al iniciar transaccion: " . $e->getMessage());
    }

    reporteActualizar($conexion, $id_reporte, $data);    reporteGuardarTodo($conexion, $id_reporte, $data);

    $conexion->commit();
    $tx = false;

    echo json_encode([
        "status" => "success",
        "message" => "Reporte actualizado correctamente",
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
