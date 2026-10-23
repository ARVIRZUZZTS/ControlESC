<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header("Content-Type: application/json");

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data || !isset($data["id_sucursal"]) || !isset($data["nombre"])) {
        throw new Exception("Datos incompletos.");
    }

    $id_sucursal = $data["id_sucursal"];
    $nombre = trim($data["nombre"]);

    if ($nombre === "") {
        throw new Exception("El nombre de la sucursal es obligatorio.");
    }
    if (mb_strlen($nombre) > 50) {
        throw new Exception("El nombre de la sucursal debe tener maximo 50 caracteres.");
    }

    if (supabaseSucursalNombreExiste($nombre, $id_sucursal)) {
        throw new Exception("Ya existe otra sucursal con ese nombre.");
    }

    supabaseSucursalEditar($id_sucursal, $nombre);

    /* Replica local (best effort) */
    try {
        if ($conexion) {
            $stmt = $conexion->prepare("UPDATE sucursal SET nombre = ? WHERE id_sucursal = ?");
            $stmt->bind_param("ss", $nombre, $id_sucursal);
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        error_log("Replica MySQL sucursal (editar) fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Sucursal actualizada correctamente"
    ]);
} catch (Exception $e) {
    if ($e instanceof SupabaseOfflineException) {
        http_response_code(200);
        echo json_encode([
            "status" => "offline",
            "message" => "Necesita conexion a internet."
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
$conexion->close();
?>
