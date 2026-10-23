<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header("Content-Type: application/json");

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data || !isset($data["id_personal"]) || !isset($data["estado"])) {
        throw new Exception("Datos incompletos.");
    }

    $id_personal = intval($data["id_personal"]);
    $estado = $data["estado"] === "activo" ? "activo" : "inactivo";

    $sql = "UPDATE personal SET estado = ? WHERE id_personal = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion: " . $conexion->error);
    }

    $stmt->bind_param("si", $estado, $id_personal);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar estado: " . $stmt->error);
    }
    $stmt->close();

    // Sync to Supabase
    try {
        supabaseUsuarioEditar($id_personal, ["estado" => $estado]);
    } catch (Exception $e) {
        if ($e instanceof SupabaseOfflineException) {
            throw $e;
        }
        error_log("Supabase estado personal fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Estado actualizado correctamente"
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
