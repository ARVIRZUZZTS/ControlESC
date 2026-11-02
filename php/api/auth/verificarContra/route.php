<?php
require_once("../../../sesion.php");
require_once("../../../conexion.php");

header('Content-Type: application/json');

authSesionIniciada();
$usuario = authUsuario();
if (!$usuario) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesion no iniciada."]);
    exit;
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $password = isset($data['password']) ? $data['password'] : "";

    $stmt = $conexion->prepare("SELECT contrasena FROM usuarios_acceso WHERE nombre = ? LIMIT 1");
    if (!$stmt) throw new Exception("Error al preparar la consulta.");
    $stmt->bind_param("s", $usuario['nombre']);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();

    if (!$row || $row['contrasena'] === null || $password !== $row['contrasena']) {
        echo json_encode(["status" => "error", "message" => "Contrasena incorrecta."]);
        exit;
    }

    echo json_encode(["status" => "success", "message" => "Contrasena correcta."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conexion->close();
?>
