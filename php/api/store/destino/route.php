<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['nombre_destino'])) {
        throw new Exception("No se recibieron datos validos.");
    }

    $nombre = trim($data['nombre_destino']);
    if ($nombre === "") {
        throw new Exception("El nombre del destino es obligatorio.");
    }
    if (mb_strlen($nombre) > 50) {
        throw new Exception("El nombre del destino debe tener maximo 50 caracteres.");
    }

    $tiene_tramos = isset($data['tiene_tramos']) && $data['tiene_tramos'] ? 1 : 0;
    $sucursal = isset($data['sucursal']) && $data['sucursal'] !== '' && $data['sucursal'] !== null
        ? intval($data['sucursal']) : null;
    $abrev = isset($data['abrev']) ? trim($data['abrev']) : '';
    if (mb_strlen($abrev) > 4) {
        throw new Exception("La abreviacion debe tener maximo 4 caracteres.");
    }
    $informacion = isset($data['informacion']) ? trim($data['informacion']) : '';
    $telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
    $precio_peaje = isset($data['precio_peaje']) && $data['precio_peaje'] !== '' && $data['precio_peaje'] !== null
        ? (float)$data['precio_peaje'] : null;

    /* Fuente de verdad: Supabase */
    if (supabaseDestinoNombreExiste($nombre)) {
        throw new Exception("Ya existe un destino con ese nombre.");
    }

    $datosSupabase = [
        'nombre_destino' => $nombre,
        'tiene_tramos' => (bool)$tiene_tramos,
        'sucursal' => $sucursal,
        'abrev' => $abrev,
        'informacion' => $informacion,
        'telefono' => $telefono
    ];

    $creado = supabaseDestinoCrear($datosSupabase);
    if (!$creado) {
        throw new Exception("Supabase no devolvio el destino creado.");
    }

    $idSupabase = $creado['id'];

    /* Replica local (best effort) */
    try {
        if ($conexion) {
            $stmt = $conexion->prepare("INSERT INTO destinos (id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono, precio_peaje) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isissssd", $idSupabase, $nombre, $tiene_tramos, $sucursal, $abrev, $informacion, $telefono, $precio_peaje);
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        error_log("Replica MySQL destino (crear) fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Destino creado correctamente",
        "id" => $idSupabase
    ]);
} catch (Exception $e) {
    if ($e instanceof SupabaseOfflineException) {
        http_response_code(200);
        echo json_encode([
            "status" => "offline",
            "message" => "Necesita conexion a internet."
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
$conexion->close();
?>