<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sesion.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $nombre = isset($data['nombre']) ? trim($data['nombre']) : "";
    $contrasena = isset($data['contrasena']) ? $data['contrasena'] : "";

    if ($nombre === "" || $contrasena === "") {
        throw new Exception("Ingresa usuario y contrasena.");
    }
    if (mb_strlen($nombre) > 20 || mb_strlen($contrasena) > 20) {
        throw new Exception("Usuario y contrasena: maximo 20 caracteres.");
    }

    authSesionIniciada();

    $usuario = null;
    $online = true;
    try {
        $fila = supabaseUsuarioPorNombre($nombre);
        if (!$fila || $fila['contraseña'] !== $contrasena) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Usuario o contrasena incorrectos."]);
            exit;
        }
        if (($fila['estado'] ?? '') !== 'activo') {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "El usuario esta inactivo."]);
            exit;
        }
        $usuario = [
            "id_usuario" => $fila['id_usuario'],
            "nombre" => $fila['nombre'],
            "rol" => supabaseRolDe($fila),
            "sucursal" => $fila['sucursal']
        ];
    } catch (Exception $e) {
        /* Sin red: se intenta con el espejo local */
        $online = false;
        $usuario = authLoginLocal($nombre, $contrasena);
    }

    $_SESSION['usuario'] = $usuario;

    if ($online) {
        authUpsertEspejoLocal($usuario['nombre'], $usuario['rol'], $contrasena);
        /* Apenas hay red se sube lo que quedó pendiente */
        syncProcesar();
    }

    echo json_encode([
        "status" => "success",
        "message" => $online ? "Bienvenido" : "Bienvenido (sin conexion)",
        "usuario" => $usuario
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
