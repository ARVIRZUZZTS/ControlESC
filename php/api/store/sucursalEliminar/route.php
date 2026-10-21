<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sync.php");
require_once("../../../sesion.php");

header('Content-Type: application/json');

/* Solo el rol admin puede eliminar */
authExigirAdmin();

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_sucursal'])) {
        throw new Exception("Datos incompletos.");
    }

    $id_sucursal = intval($data['id_sucursal']);
    if ($id_sucursal <= 0) {
        throw new Exception("Id de sucursal invalido.");
    }

    try {
        /* Camino normal: Supabase es la fuente de verdad */
        $enUso = count(supabaseUsuariosPorSucursal($id_sucursal)) > 0;

        /* El espejo local tambien cuenta: puede haber personal sin subir */
        if (!$enUso && $conexion) {
            try {
                $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM personal WHERE sucursal = ?");
                $stmt->bind_param("i", $id_sucursal);
                $stmt->execute();
                $row = $stmt->get_result()->fetch_assoc();
                $stmt->close();
                if ($row && intval($row['total']) > 0) $enUso = true;
            } catch (Exception $e) { /* tabla sin datos: se ignora */ }
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
                $stmt->bind_param("i", $id_sucursal);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            error_log("Replica MySQL sucursal (eliminar) fallo: " . $e->getMessage());
        }

        echo json_encode([
            "status" => "success",
            "message" => "Sucursal eliminada correctamente",
            "pendiente" => false
        ]);
    } catch (SupabaseOfflineException $e) {
        /* Sin red: se elimina local y se encola el borrado */
        if (!$conexion) {
            throw new Exception("Sin conexion y sin base local para guardar.");
        }

        $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM personal WHERE sucursal = ?");
        $stmt->bind_param("i", $id_sucursal);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($row && intval($row['total']) > 0) {
            http_response_code(409);
            echo json_encode([
                "status" => "error",
                "message" => "La sucursal tiene personal asignado; solo se puede modificar."
            ]);
            exit;
        }

        $stmt = $conexion->prepare("DELETE FROM sucursal WHERE id_sucursal = ?");
        $stmt->bind_param("i", $id_sucursal);
        $stmt->execute();
        $stmt->close();

        syncEncolar('sucursal', 'delete', ['id_sucursal' => $id_sucursal], $id_sucursal);

        echo json_encode([
            "status" => "success",
            "message" => "Eliminada en este equipo; se aplicara en Supabase al reconectar.",
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
