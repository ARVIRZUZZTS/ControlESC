<?php
require '../conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['codR'])) {
    http_response_code(400);
    echo "Datos incompletos";
    exit;
}

$codR = $data['codR'];

$campos = [];
$tipos = "";
$valores = [];

function agregarCampo(&$campos, &$tipos, &$valores, $campo, $valor, $tipo = 's') {
    if (isset($valor)) {
        $campos[] = "$campo = ?";
        $tipos .= $tipo;
        $valores[] = $valor;
    }
}

// Agregar cada campo si está definido
agregarCampo($campos, $tipos, $valores, 'con1', $data['con1']);
agregarCampo($campos, $tipos, $valores, 'lic1', $data['lic1']);
agregarCampo($campos, $tipos, $valores, 'con2', $data['con2']);
agregarCampo($campos, $tipos, $valores, 'lic2', $data['lic2']);
agregarCampo($campos, $tipos, $valores, 'ayudante', $data['ayudante']);
agregarCampo($campos, $tipos, $valores, 'destino', $data['destino']);
agregarCampo($campos, $tipos, $valores, 'placa', $data['placa']);

agregarCampo($campos, $tipos, $valores, 'fecha', $data['fecha']);
agregarCampo($campos, $tipos, $valores, 'hora', $data['hora']);

if (empty($campos)) {
    echo "Nada que actualizar";
    exit;
}

$valores[] = $codR;
$tipos .= 's'; // tipo para codR

$sql = "UPDATE reporte SET " . implode(", ", $campos) . " WHERE codR = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo "Error al preparar la consulta";
    exit;
}

$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo "Reporte actualizado correctamente";
} else {
    echo "Error al actualizar el reporte";
}
$stmt->close();
?>
