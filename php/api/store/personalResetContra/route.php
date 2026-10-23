<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sesion.php");

header("Content-Type: application/json");

authExigirAdmin();

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data || !isset($data["id_personal"]) || !isset($data["contrasena"])) {
        throw new Exception("Datos incompletos.");
    }

    $id_personal = intval($data["id_personal"]);
    $nueva = trim($data["contrasena"]);
    $repetir = isset($data["repetir"]) ? trim($data["repetir"]) : $nueva;

    if ($nueva === "" || mb_strlen($nueva) > 20) {
        throw new Exception("La contrasena debe tener entre 1 y 20 caracteres.");
    }
    if ($nueva !== $repetir) {
        throw new Exception("Las contrasenas no coinciden.");
    }

    // Update local
    if ($conexion) {
        $stmt = $conexion->prepare("UPDATE personal SET contrasena = ? WHERE id_personal = ?");
        $stmt->bind_param("si", $nueva, $id_personal);
        $stmt->execute();
        $stmt->close();
    }

    // Update Supabase
    try {
        supabaseUsuarioEditar($id_personal, ["contrase\xc3\xb1a" => $nueva]);
    } catch (Exception $e) {
        if ($e instanceof SupabaseOfflineException) {
            throw $e;
        }
        error_log("Supabase reset contra fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Contrasena actualizada correctamente"
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
