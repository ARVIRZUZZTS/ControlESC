<?php
require_once("../../../sesion.php");

header('Content-Type: application/json');

authSesionIniciada();

if (isset($_SESSION['usuario'])) {
    unset($_SESSION['usuario']);
}

session_destroy();

echo json_encode([
    "status" => "success",
    "message" => "Sesion cerrada"
]);
