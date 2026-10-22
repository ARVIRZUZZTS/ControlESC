<?php
require_once("../../../conexion.php");
require_once("../../../sesion.php");

header("Content-Type: application/json");

$usuario = authUsuario();
if (!$usuario) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesion expirada. Vuelve a iniciar sesion."]);
    exit;
}

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    $nueva = isset($data["contrasena"]) ? $data["contrasena"] : "";
    $repetir = isset($data["repetir"]) ? $data["repetir"] : "";
    $ubicacion_actual = isset($data["ubicacion_actual"]) ? trim($data["ubicacion_actual"]) : null;

    if ($nueva === "" || $repetir === "") {
        throw new Exception("Completa ambos campos.");
    }
    if (mb_strlen($nueva) > 20 || mb_strlen($repetir) > 20) {
        throw new Exception("La contrasena debe tener maximo 20 caracteres.");
    }
    if ($nueva !== $repetir) {
        throw new Exception("Las contrasenas no coinciden.");
    }

    $idUsuario = isset($usuario["id_usuario"]) ? intval($usuario["id_usuario"]) : 0;

    if ($idUsuario > 0) {
        try {
            supabaseCambiarContra($idUsuario, $nueva);
        } catch (Exception $e) {
            // Sin red: se guarda en el espejo local
        }
    }

    $usuario2 = $usuario;
    if ($ubicacion_actual !== null && $ubicacion_actual !== "") {
        $usuario2["ubicacion_actual"] = $ubicacion_actual;
    }
    authUpsertEspejoLocal($usuario["nombre"], $usuario["rol"], $nueva, $ubicacion_actual);
    $_SESSION["usuario"] = $usuario2;

    echo json_encode([
        "status" => "success",
        "message" => "Contrasena actualizada correctamente"
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>
