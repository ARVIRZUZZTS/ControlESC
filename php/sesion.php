<?php

/* Sesiones y roles. El login vive contra Supabase (usuarios) y,
   si no hay red, contra el espejo local (usuarios_rol). */

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

/* Refresca el espejo local de credenciales para poder entrar sin internet */
function authUpsertEspejoLocal($nombre, $rol, $contrasena) {
    global $conexion;
    if (!$conexion) return;
    try {
        $stmt = $conexion->prepare(
            "INSERT INTO usuarios_rol (nombre, rol, contrasena) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rol = ?, contrasena = ?"
        );
        $stmt->bind_param("sssss", $nombre, $rol, $contrasena, $rol, $contrasena);
        $stmt->execute();
        $stmt->close();
    } catch (Exception $e) {
        error_log("No se pudo actualizar el espejo local de roles: " . $e->getMessage());
    }
}

function authLoginLocal($nombre, $contrasena) {
    global $conexion;
    if (!$conexion) {
        throw new Exception("Sin conexion a Supabase y sin base local disponible. Conectate a internet al menos una vez.");
    }
    $stmt = $conexion->prepare("SELECT nombre, rol, contrasena FROM usuarios_rol WHERE nombre = ? LIMIT 1");
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();

    if (!$row || $row['contrasena'] === null || $contrasena !== $row['contrasena']) {
        throw new Exception("Usuario o contrasena incorrectos (modo sin conexion).");
    }
    return [
        "nombre" => $row['nombre'],
        "rol" => $row['rol'],
        "sucursal" => null
    ];
}
