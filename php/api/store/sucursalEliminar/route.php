<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sesion.php");

header("Content-Type: application/json");

authExigirAdmin();

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data || !isset($data["id_sucursal"])) {
        throw new Exception("Datos incompletos.");
    }

    $id_sucursal = $data["id_sucursal"];

    /* Verificar si esta en uso */
    $enUso = count(supabaseUsuariosPorSucursal($id_sucursal)) > 0;
    if (!$enUso && $conexion) {
        try {
            $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM personal WHERE sucursal = ?");
            $stmt->bind_param("s", $id_sucursal);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if ($row && intval($row["total"]) > 0) $enUso = true;
        } catch (Exception $e) { }
    }

    if ($enUso) {
        http_response_code(409);
        echo json_encode([
            "status" => "error",
            "message" => "La sucursal tiene usuarios o personal asignado; solo se puede modificar."
        ]);
        exit;
    }

    supabaseSucursalEliminar($id_sucursal);

    try {
        if ($conexion) {
            $stmt = $conexion->prepare("DELETE FROM sucursal WHERE id_sucursal = ?");
            $stmt->bind_param("s", $id_sucursal);
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        error_log("Replica MySQL sucursal (eliminar) fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Sucursal eliminada correctamente"
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
