<?php

/* Sesiones y roles. El login vive 100% contra el espejo local (usuarios_rol).
   No toca Supabase. Solo admins tienen acceso. */

function authSesionIniciada() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
        session_start();
    }
}

function authUsuario() {
    authSesionIniciada();
    return isset($_SESSION['usuario']) ? $_SESSION['usuario'] : null;
}

function authEsAdmin() {
    $u = authUsuario();
    return $u !== null && $u['rol'] === 'admin';
}

function authExigirAdmin() {
    authSesionIniciada();
    if (!authEsAdmin()) {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "Se requiere el rol de administrador para esta accion."
        ]);
        exit;
    }
}

/* Refresca el espejo local de credenciales (solo admins) */
function authUpsertEspejoLocal($nombre, $rol, $contrasena, $ubicacion_actual = null) {
    global $conexion;
    if (!$conexion) return;
    // Solo admins se guardan en usuarios_rol
    if ($rol !== 'admin') return;
    try {
        if ($ubicacion_actual !== null) {
            $stmt = $conexion->prepare(
                "INSERT INTO usuarios_rol (nombre, rol, contrasena, ubicacion_actual) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE rol = ?, contrasena = ?, ubicacion_actual = ?"
            );
            $stmt->bind_param("sssssss", $nombre, $rol, $contrasena, $ubicacion_actual, $rol, $contrasena, $ubicacion_actual);
        } else {
            $stmt = $conexion->prepare(
                "INSERT INTO usuarios_rol (nombre, rol, contrasena) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE rol = ?, contrasena = ?"
            );
            $stmt->bind_param("sssss", $nombre, $rol, $contrasena, $rol, $contrasena);
        }
        $stmt->execute();
        $stmt->close();
    } catch (Exception $e) {
        error_log("No se pudo actualizar el espejo local de roles: " . $e->getMessage());
    }
}

/* Login 100% local contra usuarios_rol */
function authLoginLocal($nombre, $contrasena) {
    global $conexion;
    if (!$conexion) {
        throw new Exception("Base local no disponible. Verifica que MySQL este corriendo.");
    }
    $stmt = $conexion->prepare("SELECT nombre, rol, contrasena FROM usuarios_rol WHERE nombre = ? LIMIT 1");
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();

    if (!$row || $row['contrasena'] === null || $contrasena !== $row['contrasena']) {
        throw new Exception("Usuario o contrasena incorrectos.");
    }
    return [
        "nombre" => $row['nombre'],
        "rol" => $row['rol'],
        "sucursal" => null,
        "ubicacion_actual" => $row['ubicacion_actual'] ?? null
    ];
}
