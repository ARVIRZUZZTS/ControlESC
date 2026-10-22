<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header("Content-Type: application/json");

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data || !isset($data["nombre"])) {
        throw new Exception("No se recibieron datos validos.");
    }

    $nombre = trim($data["nombre"]);
    if ($nombre === "") {
        throw new Exception("El nombre de la sucursal es obligatorio.");
    }
    if (mb_strlen($nombre) > 50) {
        throw new Exception("El nombre de la sucursal debe tener maximo 50 caracteres.");
    }

    if (supabaseSucursalNombreExiste($nombre)) {
        throw new Exception("Ya existe una sucursal con ese nombre.");
    }

    $creada = supabaseSucursalCrear($nombre);
    if (!$creada) {
        throw new Exception("Supabase no devolvio la sucursal creada.");
    }

    $idSupabase = $creada["id_sucursal"];

    /* Replica local (best effort) */
    try {
        if ($conexion) {
            $stmt = $conexion->prepare("INSERT INTO sucursal (id_sucursal, nombre) VALUES (?, ?)");
            $stmt->bind_param("ss", $idSupabase, $nombre);
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        error_log("Replica MySQL sucursal (crear) fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Sucursal creada correctamente",
        "id" => $idSupabase
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
