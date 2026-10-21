<?php

require_once(__DIR__ . "/supabase.php");

/*
 * Cola de sincronizacion hacia Supabase.
 * Solo se encolan las tablas que viven en la nube: sucursal, usuarios, destinos.
 * Las demas tablas (flotas, ruedas, aceite, reportes...) son 100% locales.
 */

function syncEncolar($tabla, $operacion, $datos, $idLocal = null) {
    global $conexion;
    if (!$conexion) return;
    try {
        $json = json_encode($datos);
        $stmt = $conexion->prepare(
            "INSERT INTO sync_pendiente (tabla, operacion, datos, id_local, estado)
             VALUES (?, ?, ?, ?, 'pendiente')"
        );
        $stmt->bind_param("sssi", $tabla, $operacion, $json, $idLocal);
        $stmt->execute();
        $stmt->close();
    } catch (Exception $e) {
        error_log("syncEncolar fallo ($tabla/$operacion): " . $e->getMessage());
    }
}

function syncContar() {
    global $conexion;
    if (!$conexion) return ["pendientes" => 0, "errores" => 0];
    try {
        $res = $conexion->query("SELECT estado, COUNT(*) AS total FROM sync_pendiente GROUP BY estado");
        $out = ["pendientes" => 0, "errores" => 0];
        while ($row = $res->fetch_assoc()) {
            if ($row['estado'] === 'pendiente') $out['pendientes'] = intval($row['total']);
            if ($row['estado'] === 'error') $out['errores'] = intval($row['total']);
        }
        return $out;
    } catch (Exception $e) {
        return ["pendientes" => 0, "errores" => 0];
    }
}

function syncListarErrores() {
    global $conexion;
    if (!$conexion) return [];
    try {
        $res = $conexion->query(
            "SELECT id_pend, tabla, operacion, error, creado
             FROM sync_pendiente WHERE estado = 'error'
             ORDER BY id_pend DESC LIMIT 20"
        );
        $out = [];
        while ($row = $res->fetch_assoc()) $out[] = $row;
        return $out;
    } catch (Exception $e) {
        return [];
    }
}

/* Aplica la cola en orden. Devuelve resumen. */
function syncProcesar() {
    global $conexion;
    if (!$conexion) {
        return ["subidas" => 0, "errores" => 0, "sin_base" => true];
    }

    /* Un solo proceso a la vez: si otro request ya sincroniza, salir */
    $lock = $conexion->query("SELECT GET_LOCK('sync_supabase', 0) AS l");
    $rowLock = $lock->fetch_assoc();
    if (intval($rowLock['l']) !== 1) {
        return ["subidas" => 0, "errores" => 0, "ocupado" => true];
    }

    try {
        $res = $conexion->query(
            "SELECT id_pend, tabla, operacion, datos FROM sync_pendiente
             WHERE estado = 'pendiente' ORDER BY id_pend ASC LIMIT 200"
        );
        $pendientes = [];
        while ($row = $res->fetch_assoc()) $pendientes[] = $row;

        $subidas = 0;
        $errores = 0;

        foreach ($pendientes as $p) {
            $datos = json_decode($p['datos'], true);
            try {
                switch ($p['tabla'] . ":" . $p['operacion']) {
                    case 'sucursal:insert':
                        supabaseSucursalCrearConId($datos);
                        break;
                    case 'sucursal:update':
                        supabaseRequest('PATCH', 'sucursal?id_sucursal=eq.' . intval($datos['id_sucursal']), [
                            'nombre' => $datos['nombre']
                        ]);
                        break;
                    case 'sucursal:delete':
                        supabaseRequest('DELETE', 'sucursal?id_sucursal=eq.' . intval($datos['id_sucursal']));
                        break;
                    case 'usuarios:insert':
                        supabaseRequest('POST', 'usuarios', $datos, 'resolution=merge-duplicates, return=minimal');
                        break;
                    case 'destinos:insert':
                        supabaseDestinoCrear($datos);
                        break;
                    case 'destinos:update':
                        supabaseDestinoEditar($datos['id'], $datos);
                        break;
                    case 'destinos:delete':
                        supabaseDestinoEliminar($datos['id']);
                        break;
                    default:
                        throw new Exception("Operacion no soportada: " . $p['tabla'] . ":" . $p['operacion']);
                }

                $stmt = $conexion->prepare("DELETE FROM sync_pendiente WHERE id_pend = ?");
                $stmt->bind_param("i", $p['id_pend']);
                $stmt->execute();
                $stmt->close();
                $subidas++;
            } catch (SupabaseOfflineException $e) {
                /* Se corto la red: se deja la cola como esta para el proximo intento */
                break;
            } catch (Exception $e) {
                $errMsg = substr("Error Supabase: " . $e->getMessage(), 0, 250);
                $stmt = $conexion->prepare("UPDATE sync_pendiente SET estado = 'error', error = ? WHERE id_pend = ?");
                $stmt->bind_param("si", $errMsg, $p['id_pend']);
                $stmt->execute();
                $stmt->close();
                $errores++;
            }
        }

        return ["subidas" => $subidas, "errores" => $errores];
    } finally {
        $conexion->query("SELECT RELEASE_LOCK('sync_supabase')");
    }
}

/* Descarga destinos de Supabase y los sincroniza con local.
   Usa nombre_destino como clave (no el id, porque los ids difieren).
   Solo actualiza campos sincronizados; NO toca precio_peaje (solo local). */
function syncDestinosPull() {
    global $conexion;
    if (!$conexion) return ["nuevos" => 0, "actualizados" => 0, "sin_base" => true];

    try {
        $remotos = supabaseDestinoListar();
    } catch (Exception $e) {
        return ["nuevos" => 0, "actualizados" => 0, "error" => $e->getMessage()];
    }

    $nuevos = 0;
    $actualizados = 0;

    foreach ($remotos as $r) {
        $nombre = $r["nombre_destino"];
        // Buscar por nombre en local
        $stmt = $conexion->prepare("SELECT id FROM destinos WHERE nombre_destino = ? LIMIT 1");
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();

        if ($row) {
            // Actualizar campos sincronizados (no precio_peaje)
            $stmt = $conexion->prepare("UPDATE destinos SET tiene_tramos = ?, sucursal = ?, abrev = ?, informacion = ?, telefono = ? WHERE id = ?");
            $tt = $r["tiene_tramos"] ? 1 : 0;
            $stmt->bind_param("iisssi", $tt, $r["sucursal"], $r["abrev"], $r["informacion"], $r["telefono"], $row["id"]);
            $stmt->execute();
            $stmt->close();
            $actualizados++;
        } else {
            // Insertar nuevo: si el id de Supabase ya existe local, usar id nuevo
            $idInsert = (int)$r["id"];
            $chk = $conexion->prepare("SELECT COUNT(*) AS c FROM destinos WHERE id = ?");
            $chk->bind_param("i", $idInsert);
            $chk->execute();
            $chkRow = $chk->get_result()->fetch_assoc();
            $chk->close();
            if (intval($chkRow["c"]) > 0) {
                $resId = $conexion->query("SELECT GREATEST(COALESCE(MAX(id),0)+1, 1000) AS next_id FROM destinos");
                $idInsert = intval($resId->fetch_assoc()["next_id"]);
            }
            $stmt = $conexion->prepare("INSERT INTO destinos (id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $tt = $r["tiene_tramos"] ? 1 : 0;
            $stmt->bind_param("isisssi", $idInsert, $nombre, $tt, $r["sucursal"], $r["abrev"], $r["informacion"], $r["telefono"]);
            $stmt->execute();
            $stmt->close();
            $nuevos++;
        }
    }

    return ["nuevos" => $nuevos, "actualizados" => $actualizados];
}
