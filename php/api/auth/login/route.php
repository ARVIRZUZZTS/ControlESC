<?php
require_once("../../../conexion.php");
require_once("../../../sesion.php");

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

    // Login 100% local: solo compara contra usuarios_rol (solo admins)
    $usuario = authLoginLocal($nombre, $contrasena);

    // Verificar que sea admin
    if ($usuario['rol'] !== 'admin') {
        throw new Exception("No tiene acceso a esta plataforma.");
    }

    $_SESSION['usuario'] = $usuario;

    echo json_encode([
        "status" => "success",
        "message" => "Bienvenido",
        "usuario" => $usuario
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>