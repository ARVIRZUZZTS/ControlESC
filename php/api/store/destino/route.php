<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sync.php");

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
    $abrev = isset($data['abrev']) ? trim($data['abrev']) : null;
    if ($abrev !== null && mb_strlen($abrev) > 4) {
        throw new Exception("La abreviacion debe tener maximo 4 caracteres.");
    }
    if ($abrev === '') $abrev = null;
    $informacion = isset($data['informacion']) ? trim($data['informacion']) : null;
    if ($informacion === '') $informacion = null;
    $telefono = isset($data['telefono']) ? trim($data['telefono']) : null;
    if ($telefono === '') $telefono = null;
    $precio_peaje = isset($data['precio_peaje']) && $data['precio_peaje'] !== '' && $data['precio_peaje'] !== null
        ? (float)$data['precio_peaje'] : null;

    try {
        /* Camino normal: Supabase es la fuente de verdad */
        if (supabaseDestinoNombreExiste($nombre)) {
            throw new Exception("Ya existe un destino con ese nombre.");
        }

        $datosSupabase = [
            'nombre_destino' => $nombre,
            'tiene_tramos' => (bool)$tiene_tramos,
            'sucursal' => $sucursal,
            'abrev' => $abrev,
            'informacion' => $informacion,
            'telefono' => $telefono,
            'sincronizado' => 1
        ];

        $creado = supabaseDestinoCrear($datosSupabase);
        if (!$creado) {
            throw new Exception("Supabase no devolvio el destino creado.");
        }

        $idSupabase = (int)$creado['id'];

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
            "pendiente" => false,
            "id" => $idSupabase
        ]);
    } catch (SupabaseOfflineException $e) {
        /* Sin red: se guarda local con id alto y se encola */
        if (!$conexion) {
            throw new Exception("Sin conexion y sin base local para guardar.");
        }

        $stmtDup = $conexion->prepare("SELECT COUNT(*) AS c FROM destinos WHERE nombre_destino = ?");
        $stmtDup->bind_param("s", $nombre);
        $stmtDup->execute();
        $rowDup = $stmtDup->get_result()->fetch_assoc();
        $stmtDup->close();
        if (intval($rowDup['c']) > 0) {
            throw new Exception("Ya existe un destino con ese nombre.");
        }

        $resId = $conexion->query("SELECT COALESCE(MAX(id),0)+1 AS next_id FROM destinos");
        $rowId = $resId->fetch_assoc();
        $idLocal = intval($rowId['next_id']);

        $stmt = $conexion->prepare("INSERT INTO destinos (id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono, precio_peaje) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isissssd", $idLocal, $nombre, $tiene_tramos, $sucursal, $abrev, $informacion, $telefono, $precio_peaje);
        $stmt->execute();
        $stmt->close();

        syncEncolar('destinos', 'insert', [
            'id' => $idLocal,
            'nombre_destino' => $nombre,
            'tiene_tramos' => (bool)$tiene_tramos,
            'sucursal' => $sucursal,
            'abrev' => $abrev,
            'informacion' => $informacion,
            'telefono' => $telefono,
            'sincronizado' => 1
        ], $idLocal);

        echo json_encode([
            "status" => "success",
            "message" => "Guardado en este equipo; se subira a Supabase al reconectar.",
            "pendiente" => true,
            "id" => $idLocal
        ]);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>