<?php
require_once("../../../sesion.php");

header('Content-Type: application/json');

$usuario = authUsuario();

echo json_encode([
    "status" => "success",
    "logueado" => $usuario !== null,
    "usuario" => $usuario
]);
