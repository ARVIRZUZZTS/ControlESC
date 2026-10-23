<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sesion.php");

header('Content-Type: application/json');

authExigirAdmin();

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id'])) {
        throw new Exception("Datos incompletos.");
    }

    $id = $data['id'];

    /* Verificar si esta en uso (flota referencia este destino) */
    $enUso = false;
    if ($conexion) {
        $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM flota WHERE id_destino = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($row && intval($row['total']) > 0) $enUso = true;
    }

    if ($enUso) {
        http_response_code(409);
        echo json_encode([
            "status" => "error",
            "message" => "El destino tiene flotas asignadas; solo se puede modificar."
        ]);
        exit;
    }

    /* Fuente de verdad: Supabase */
    supabaseDestinoEliminar($id);

    /* Replica local (best effort) */
    try {
        if ($conexion) {
            $stmt = $conexion->prepare("DELETE FROM destinos WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        error_log("Replica MySQL destino (eliminar) fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Destino eliminado correctamente"
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