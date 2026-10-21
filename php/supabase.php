<?php

/* Timeout corto: si no hay internet el login cae al espejo local sin colgar la app */
const SUPABASE_TIMEOUT = 8;

/* Se lanza solo cuando no hay red (distinta de errores reales de Supabase) */
class SupabaseOfflineException extends Exception {}

function supabaseRequest($method, $endpoint, $body = null, $prefer = null) {
    $envPath = __DIR__ . '/../.env';
    if (!file_exists($envPath)) {
        throw new Exception("Archivo .env no encontrado");
    }

    $env = parse_ini_file($envPath);
    $url = rtrim($env['SUPABASE_URL'], '/') . '/rest/v1/' . ltrim($endpoint, '/');
    $key = $env['SUPABASE_KEY'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, SUPABASE_TIMEOUT);
    curl_setopt($ch, CURLOPT_TIMEOUT, SUPABASE_TIMEOUT);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json',
        'Prefer: ' . ($prefer !== null ? $prefer : 'return=representation')
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    } elseif ($method === 'GET') {
        curl_setopt($ch, CURLOPT_HTTPGET, true);
    }

    $response = curl_exec($ch);
    if ($response === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new SupabaseOfflineException("Sin conexion a Supabase: " . $err);
    }
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 400) {
        throw new Exception("Error Supabase ($httpCode): " . $response);
    }

    if ($response === '' || $response === null) return [];
    return json_decode($response, true);
}

function supabaseCrearUsuario($nombre, $tipoEmpleado, $estado, $sucursal, $contrasena) {
    return supabaseRequest('POST', 'usuarios', [
        'nombre' => $nombre,
        'rol' => $tipoEmpleado,
        'estado' => $estado,
        'sucursal' => $sucursal,
        'contraseña' => $contrasena,
        'sincronizado' => 1
    ]);
}

/* -------------------- Destinos (fuente de verdad en la nube) -------------------- */

function supabaseDestinoListar() {
    return supabaseRequest('GET', 'destinos?select=*&order=id.asc');
}

function supabaseDestinoCrear($datos) {
    $res = supabaseRequest('POST', 'destinos', $datos, 'resolution=merge-duplicates, return=representation');
    return is_array($res) && count($res) > 0 ? $res[0] : null;
}

function supabaseDestinoEditar($id, $datos) {
    supabaseRequest('PATCH', 'destinos?id=eq.' . intval($id), $datos);
    return true;
}

function supabaseDestinoEliminar($id) {
    supabaseRequest('DELETE', 'destinos?id=eq.' . intval($id));
    return true;
}

function supabaseDestinoNombreExiste($nombre, $idIgnorar = null) {
    $endpoint = 'destinos?select=id,nombre_destino&nombre_destino=eq.' . rawurlencode($nombre);
    if ($idIgnorar !== null) {
        $endpoint .= '&id=neq.' . intval($idIgnorar);
    }
    $res = supabaseRequest('GET', $endpoint);
    if (is_array($res) && count($res) > 0) return true;

    /* Fallback: comparar en PHP */
    $todos = supabaseRequest('GET', 'destinos?select=id,nombre_destino&limit=1000');
    if (is_array($todos)) {
        foreach ($todos as $d) {
            if (isset($d['nombre_destino']) && $d['nombre_destino'] === $nombre) {
                if ($idIgnorar !== null && (int)$d['id'] === (int)$idIgnorar) continue;
                return true;
            }
        }
    }
    return false;
}

function supabaseDestinosPorSucursal($idSucursal) {
    $res = supabaseRequest('GET', 'destinos?select=id&sucursal=eq.' . intval($idSucursal));
    return is_array($res) ? $res : [];
}

/* -------------------- Sucursal (fuente de verdad en la nube) -------------------- */

function supabaseSucursalListar() {
    return supabaseRequest('GET', 'sucursal?select=id_sucursal,nombre&order=id_sucursal.asc');
}

function supabaseSucursalCrear($nombre) {
    $res = supabaseRequest('POST', 'sucursal', ['nombre' => $nombre]);
    return is_array($res) && count($res) > 0 ? $res[0] : null;
}

/* Sube una sucursal creada offline respetando su id local.
   merge-duplicates: si el id ya existe en Supabase, actualiza en vez de fallar. */
function supabaseSucursalCrearConId($datos) {
    $res = supabaseRequest('POST', 'sucursal', [
        'id_sucursal' => intval($datos['id_sucursal']),
        'nombre' => $datos['nombre']
    ], 'resolution=merge-duplicates, return=representation');
    return is_array($res) && count($res) > 0 ? $res[0] : null;
}

function supabaseSucursalEditar($idSucursal, $nombre) {
    supabaseRequest('PATCH', 'sucursal?id_sucursal=eq.' . intval($idSucursal), ['nombre' => $nombre]);
    return true;
}

function supabaseSucursalEliminar($idSucursal) {
    supabaseRequest('DELETE', 'sucursal?id_sucursal=eq.' . intval($idSucursal));
    return true;
}

function supabaseSucursalNombreExiste($nombre, $idIgnorar = null) {
    $endpoint = 'sucursal?select=id_sucursal,nombre&nombre=eq.' . rawurlencode($nombre);
    if ($idIgnorar !== null) {
        $endpoint .= '&id_sucursal=neq.' . intval($idIgnorar);
    }
    $endpoint .= '&limit=1000';
    $res = supabaseRequest('GET', $endpoint);
    if (is_array($res) && count($res) > 0) return true;

    /* Puntos o comas en el nombre pueden romper el filtro: se compara en PHP */
    if (strpbrk($nombre, '.,:()') !== false) {
        $todas = supabaseRequest('GET', 'sucursal?select=id_sucursal,nombre&limit=1000');
        if (is_array($todas)) {
            foreach ($todas as $s) {
                if (isset($s['nombre']) && $s['nombre'] === $nombre) return true;
            }
        }
    }
    return false;
}

/* -------------------- Login / roles -------------------- */

function supabaseUsuarioPorNombre($nombre) {
    $res = supabaseRequest('GET', 'usuarios?select=*&nombre=eq.' . rawurlencode($nombre) . '&limit=1');
    if (is_array($res) && count($res) > 0) return $res[0];

    /* Puntos o comas en el nombre pueden romper el filtro: se compara en PHP */
    if (strpbrk($nombre, '.,:()') !== false) {
        $todos = supabaseRequest('GET', 'usuarios?select=*&limit=1000');
        if (is_array($todos)) {
            foreach ($todos as $u) {
                if (isset($u['nombre']) && $u['nombre'] === $nombre) return $u;
            }
        }
    }
    return null;
}

/* El campo rol se llamaba tipo_empleado antes de la migracion */
function supabaseRolDe($fila) {
    if (isset($fila['rol']) && $fila['rol'] !== null) return $fila['rol'];
    if (isset($fila['tipo_empleado'])) return $fila['tipo_empleado'];
    return 'usuario';
}

function supabaseUsuarioPorId($idUsuario) {
    $res = supabaseRequest('GET', 'usuarios?select=*&id_usuario=eq.' . intval($idUsuario) . '&limit=1');
    return is_array($res) && count($res) > 0 ? $res[0] : null;
}

function supabaseUsuariosPorSucursal($idSucursal) {
    $res = supabaseRequest('GET', 'usuarios?select=id_usuario&sucursal=eq.' . intval($idSucursal));
    return is_array($res) ? $res : [];
}

function supabaseCambiarContra($idUsuario, $nuevaContra) {
    supabaseRequest('PATCH', 'usuarios?id_usuario=eq.' . intval($idUsuario), [
        'contraseña' => $nuevaContra,
        'cambio_contra' => true
    ]);
    return true;
}
