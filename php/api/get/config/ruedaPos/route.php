<?php
require_once("../conexion.php");

header('Content-Type: application/json');

$sql = "SELECT id_rp AS id, nombre_planilla AS nombrePlanilla, descripcion
            FROM ruedas_posicion";

$response = [
    'success' => false,
    'message' => 'No se pudo acceder a los datos',
    'data' => [],
];

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    $response['message'] = 'Error al preparar la consulta';
    $response['error'] = $conexion->error;
    echo json_encode($response);
    exit;
}

if (!$stmt->execute()) {
    $response['message'] = 'Error al ejecutar la consulta';
    $response['error'] = $stmt->error;
    $stmt->close();
    echo json_encode($response);
    exit;
}

$result = $stmt->get_result();
if (!$result) {
    $response['message'] = 'Error al obtener los resultados';
    $response['error'] = $stmt->error;
    $stmt->close();
    echo json_encode($response);
    exit;
}

$ruedasPosicion = [];
while ($row = $result->fetch_assoc()) {
    $ruedasPosicion[] = $row;
}

$stmt->close();

$response['success'] = true;
$response['message'] = count($ruedasPosicion) ? 'Datos obtenidos correctamente' : 'No se encontraron registros';
$response['data'] = $ruedasPosicion;

echo json_encode($response);
?>