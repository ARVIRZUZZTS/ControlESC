<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['id_sucursal']) || !isset($data['nombre'])) {
        throw new Exception("Datos incompletos.");
    }

    $id_sucursal = intval($data['id_sucursal']);
    $nombre = trim($data['nombre']);

    if ($nombre === "") {
        throw new Exception("El nombre de la sucursal es obligatorio.");
    }
    if (mb_strlen($nombre) > 50) {
        throw new Exception("El nombre de la sucursal debe tener maximo 50 caracteres.");
    }

    try {
        /* Camino normal: Supabase es la fuente de verdad */
        if (supabaseSucursalNombreExiste($nombre, $id_sucursal)) {
            throw new Exception("Ya existe otra sucursal con ese nombre.");
        }

        supabaseSucursalEditar($id_sucursal, $nombre);

        /* Replica local (best effort) */
        try {
            if ($conexion) {
                $stmt = $conexion->prepare("UPDATE sucursal SET nombre = ? WHERE id_sucursal = ?");
                $stmt->bind_param("si", $nombre, $id_sucursal);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            error_log("Replica MySQL sucursal (editar) fallo: " . $e->getMessage());
        }

        echo json_encode([
            "status" => "success",
            "message" => "Sucursal actualizada correctamente",
            "pendiente" => false
        ]);
    } catch (SupabaseOfflineException $e) {
        /* Sin red: se edita local y se encola */
        if (!$conexion) {
            throw new Exception("Sin conexion y sin base local para guardar.");
        }

        $stmtDup = $conexion->prepare("SELECT COUNT(*) AS c FROM sucursal WHERE nombre = ? AND id_sucursal <> ?");
        $stmtDup->bind_param("si", $nombre, $id_sucursal);
        $stmtDup->execute();
        $rowDup = $stmtDup->get_result()->fetch_assoc();
        $stmtDup->close();
        if (intval($rowDup['c']) > 0) {
            throw new Exception("Ya existe otra sucursal con ese nombre.");
        }

        $stmt = $conexion->prepare("UPDATE sucursal SET nombre = ? WHERE id_sucursal = ?");
        $stmt->bind_param("si", $nombre, $id_sucursal);
        $stmt->execute();
        $stmt->close();

        syncEncolar('sucursal', 'update', ['id_sucursal' => $id_sucursal, 'nombre' => $nombre], $id_sucursal);

        echo json_encode([
            "status" => "success",
            "message" => "Guardada en este equipo; se subira a Supabase al reconectar.",
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
