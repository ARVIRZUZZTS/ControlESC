<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sesion.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

authExigirAdmin();

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id'])) {
        throw new Exception("Datos incompletos.");
    }

    $id = intval($data['id']);
    if ($id <= 0) {
        throw new Exception("Id de destino invalido.");
    }

    /* Verificar si esta en uso (flota referencia este destino) */
    try {
        $enUso = count(supabaseDestinosPorSucursal(0)) > 0; // placeholder
        $enUso = false;
        if ($conexion) {
            $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM flota WHERE id_destino = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if ($row && intval($row['total']) > 0) $enUso = true;
        }
    } catch (Exception $e) {
        $enUso = false;
    }

    try {
        /* Camino normal */
        if ($enUso) {
            http_response_code(409);
            echo json_encode([
                "status" => "error",
                "message" => "El destino tiene flotas asignadas; solo se puede modificar."
            ]);
            exit;
        }

        supabaseDestinoEliminar($id);

        try {
            if ($conexion) {
                $stmt = $conexion->prepare("DELETE FROM destinos WHERE id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            error_log("Replica MySQL destino (eliminar) fallo: " . $e->getMessage());
        }

        echo json_encode([
            "status" => "success",
            "message" => "Destino eliminado correctamente",
            "pendiente" => false
        ]);
    } catch (SupabaseOfflineException $e) {
        /* Sin red */
        if (!$conexion) {
            throw new Exception("Sin conexion y sin base local para guardar.");
        }

        $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM flota WHERE id_destino = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($row && intval($row['total']) > 0) {
            http_response_code(409);
            echo json_encode([
                "status" => "error",
                "message" => "El destino tiene flotas asignadas; solo se puede modificar."
            ]);
            exit;
        }

        $stmt = $conexion->prepare("DELETE FROM destinos WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();

        syncEncolar('destinos', 'delete', ['id' => $id], $id);

        echo json_encode([
            "status" => "success",
            "message" => "Eliminado en este equipo; se aplicara en Supabase al reconectar.",
            "pendiente" => true
        ]);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>