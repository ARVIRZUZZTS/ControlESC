<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");

header("Content-Type: application/json");

try {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data || !isset($data["id_personal"]) || !is_numeric($data["id_personal"])) {
        throw new Exception("No se recibio el personal a editar.");
    }

    $id_personal = (int)$data["id_personal"];
    $nombre = isset($data["nombre"]) ? trim($data["nombre"]) : "";
    $id_te = isset($data["id_te"]) ? intval($data["id_te"]) : 0;

    if ($nombre === "") {
        throw new Exception("El nombre del personal es obligatorio.");
    }
    if (!$id_te) {
        throw new Exception("El tipo de personal es obligatorio.");
    }

    $mensual = isset($data["mensual"]) && is_numeric($data["mensual"]) ? (float)$data["mensual"] : 0.00;
    $fecha_contrato = isset($data["fecha_contrato"]) && preg_match("/^\d{4}-\d{2}-\d{2}$/", $data["fecha_contrato"])
        ? $data["fecha_contrato"]
        : null;
    $estado = isset($data["estado"]) && in_array($data["estado"], ["Activo", "Baja", "activo", "inactivo"], true)
        ? $data["estado"]
        : "Activo";

    // Normalize estado
    if ($estado === "Activo") $estado = "activo";
    if ($estado === "Baja") $estado = "inactivo";

    $sql = "UPDATE personal SET nombre_apellido = ?, id_te = ?, mensual = ?, fecha_contrato = ?, estado = ? WHERE id_personal = ?";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("sisssi", $nombre, $id_te, $mensual, $fecha_contrato, $estado, $id_personal);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el personal: " . $stmt->error);
    }
    $stmt->close();

    // Sync to Supabase
    try {
        $nombre_tipo = "";
        $stmtTipo = $conexion->prepare("SELECT nombre_tipo_personal FROM tipo_personal WHERE id_te = ? LIMIT 1");
        $stmtTipo->bind_param("i", $id_te);
        $stmtTipo->execute();
        $resTipo = $stmtTipo->get_result();
        $tipo = $resTipo->fetch_assoc();
        $stmtTipo->close();
        $nombre_tipo = $tipo ? $tipo["nombre_tipo_personal"] : "";

        $sucursal = null;
        $stmtSuc = $conexion->prepare("SELECT sucursal FROM personal WHERE id_personal = ? LIMIT 1");
        $stmtSuc->bind_param("i", $id_personal);
        $stmtSuc->execute();
        $resSuc = $stmtSuc->get_result();
        $rowSuc = $resSuc->fetch_assoc();
        $stmtSuc->close();
        if ($rowSuc) $sucursal = $rowSuc["sucursal"];

        supabaseUsuarioEditar($id_personal, [
            "nombre" => $nombre,
            "rol" => $nombre_tipo,
            "estado" => $estado,
            "sucursal" => $sucursal
        ]);
    } catch (Exception $e) {
        if ($e instanceof SupabaseOfflineException) {
            throw $e;
        }
        error_log("Supabase edit personal fallo: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "message" => "Personal actualizado correctamente"
    ]);

} catch (Exception $e) {
    if ($e instanceof SupabaseOfflineException) {
        http_response_code(200);
        echo json_encode([
            "status" => "offline",
            "message" => "Necesita conexion a internet."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
$conexion->close();
?>
