<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['nombre'])) {
        throw new Exception("No se recibieron datos validos.");
    }

    $nombre = trim($data['nombre']);
    if ($nombre === "") {
        throw new Exception("El nombre de la sucursal es obligatorio.");
    }
    if (mb_strlen($nombre) > 50) {
        throw new Exception("El nombre de la sucursal debe tener maximo 50 caracteres.");
    }

    try {
        /* Camino normal: Supabase es la fuente de verdad */
        if (supabaseSucursalNombreExiste($nombre)) {
            throw new Exception("Ya existe una sucursal con ese nombre.");
        }

        $creada = supabaseSucursalCrear($nombre);
        if (!$creada) {
            throw new Exception("Supabase no devolvio la sucursal creada.");
        }

        /* Replica local (best effort: la app sigue aunque MySQL este caido) */
        try {
            if ($conexion) {
                $stmt = $conexion->prepare("INSERT INTO sucursal (id_sucursal, nombre) VALUES (?, ?)");
                $stmt->bind_param("is", $creada['id_sucursal'], $nombre);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            error_log("Replica MySQL sucursal (crear) fallo: " . $e->getMessage());
        }

        echo json_encode([
            "status" => "success",
            "message" => "Sucursal creada correctamente",
            "pendiente" => false,
            "id" => (int)$creada['id_sucursal']
        ]);
    } catch (SupabaseOfflineException $e) {
        /* Sin red: se guarda local con id alto y se encola para subir despues */
        if (!$conexion) {
            throw new Exception("Sin conexion y sin base local para guardar.");
        }

        $stmtDup = $conexion->prepare("SELECT COUNT(*) AS c FROM sucursal WHERE nombre = ?");
        $stmtDup->bind_param("s", $nombre);
        $stmtDup->execute();
        $rowDup = $stmtDup->get_result()->fetch_assoc();
        $stmtDup->close();
        if (intval($rowDup['c']) > 0) {
            throw new Exception("Ya existe una sucursal con ese nombre.");
        }

        $resId = $conexion->query("SELECT COALESCE(MAX(id_sucursal),0)+1 AS next_id FROM sucursal");
        $rowId = $resId->fetch_assoc();
        $idLocal = intval($rowId['next_id']);

        $stmt = $conexion->prepare("INSERT INTO sucursal (id_sucursal, nombre) VALUES (?, ?)");
        $stmt->bind_param("is", $idLocal, $nombre);
        $stmt->execute();
        $stmt->close();

        syncEncolar('sucursal', 'insert', ['id_sucursal' => $idLocal, 'nombre' => $nombre], $idLocal);

        echo json_encode([
            "status" => "success",
            "message" => "Guardada en este equipo; se subira a Supabase al reconectar.",
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
