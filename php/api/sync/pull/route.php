<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header("Content-Type: application/json");

$resumen = ["sucursal" => 0, "destinos" => 0, "usuarios_acceso" => 0];
$online = true;

try {
    // Verifica conectividad
    $sucursalesRemotas = supabaseSucursalListar();
} catch (Exception $e) {
    $online = false;
    $sucursalesRemotas = [];
}

if (!$online) {
    echo json_encode([
        "status" => "success",
        "online" => false,
        "message" => "Sin conexion. No se sincronizo.",
        "resumen" => $resumen
    ]);
    if ($conexion) $conexion->close();
    exit;
}

try {
    // Sucursal
    foreach ($sucursalesRemotas as $s) {
        $id = (string)($s['id_sucursal'] ?? $s['id'] ?? '');
        $nombre = $s['nombre'] ?? '';
        if ($id === '') continue;
        $stmt = $conexion->prepare("INSERT INTO sucursal (id_sucursal, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)");
        if ($stmt) {
            $stmt->bind_param("ss", $id, $nombre);
            if ($stmt->execute()) $resumen["sucursal"]++;
            $stmt->close();
        }
    }

    // Destinos
    $destinosRemotos = supabaseDestinoListar();
    if (is_array($destinosRemotos)) {
        foreach ($destinosRemotos as $d) {
            $id = (string)($d['id'] ?? '');
            if ($id === '') continue;
            $nombre = $d['nombre_destino'] ?? '';
            $tiene = !empty($d['tiene_tramos']) ? 1 : 0;
            $suc = isset($d['sucursal']) && $d['sucursal'] !== null ? (string)$d['sucursal'] : null;
            $abrev = $d['abrev'] ?? null;
            $info = $d['informacion'] ?? null;
            $tel = $d['telefono'] ?? null;

            $stmt = $conexion->prepare("INSERT INTO destinos (id, nombre_destino, tiene_tramos, sucursal, abrev, informacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre_destino = VALUES(nombre_destino), tiene_tramos = VALUES(tiene_tramos), sucursal = VALUES(sucursal), abrev = VALUES(abrev), informacion = VALUES(informacion), telefono = VALUES(telefono)");
            if ($stmt) {
                $stmt->bind_param("ssissss", $id, $nombre, $tiene, $suc, $abrev, $info, $tel);
                if ($stmt->execute()) $resumen["destinos"]++;
                $stmt->close();
            }
        }
    }

    // Usuarios (solo admins -> espejo local)
    $usuariosRemotos = supabaseUsuarioListar();
    if (is_array($usuariosRemotos)) {
        foreach ($usuariosRemotos as $u) {
            $rol = supabaseRolDe($u);
            if ($rol !== 'admin') continue;
            $nombre = $u['nombre'] ?? '';
            if ($nombre === '') continue;
            $contra = $u['contraseña'] ?? $u['contrasena'] ?? null;
            $stmt = $conexion->prepare("INSERT INTO usuarios_acceso (nombre, rol, contrasena) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rol = VALUES(rol), contrasena = VALUES(contrasena)");
            if ($stmt) {
                $stmt->bind_param("sss", $nombre, $rol, $contra);
                if ($stmt->execute()) $resumen["usuarios_acceso"]++;
                $stmt->close();
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "online" => true,
        "message" => "Sincronizacion completada.",
        "resumen" => $resumen
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "online" => true,
        "message" => $e->getMessage(),
        "resumen" => $resumen
    ]);
}

if ($conexion) $conexion->close();
?>
