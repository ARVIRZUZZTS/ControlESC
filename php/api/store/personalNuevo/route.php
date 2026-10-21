<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sync.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['personal']) || !is_array($data['personal']) || count($data['personal']) === 0) {
        throw new Exception("No se recibió personal para registrar.");
    }

    $sql = "INSERT INTO personal (nombre_apellido, id_te, mensual, total, fecha_contrato, estado, sucursal, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $hasNewFields = true;
    if (!$stmt) {
        $hasNewFields = false;
        $sql = "INSERT INTO personal (nombre_apellido, id_te, mensual, total, fecha_contrato, estado) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparacion de la consulta: " . $conexion->error);
        }
    }

    $creados = [];
    foreach ($data['personal'] as $emp) {
        $nombre = isset($emp['nombre']) ? trim($emp['nombre']) : "";
        $id_te = isset($emp['id_te']) ? intval($emp['id_te']) : 0;

        if ($nombre === "") {
            throw new Exception("El nombre del personal es obligatorio.");
        }
        if (!$id_te) {
            throw new Exception("El tipo de personal es obligatorio.");
        }

        $mensual = isset($emp['mensual']) && is_numeric($emp['mensual']) ? (float)$emp['mensual'] : 0.00;
        $total = isset($emp['total']) && is_numeric($emp['total']) ? (float)$emp['total'] : 0.00;
        $fecha_contrato = isset($emp['fecha_contrato']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $emp['fecha_contrato'])
            ? $emp['fecha_contrato']
            : null;
        $estado = isset($emp['estado']) && in_array($emp['estado'], ['activo', 'inactivo'], true)
            ? $emp['estado']
            : 'activo';
        $sucursal = isset($emp['sucursal']) ? intval($emp['sucursal']) : null;
        $contrasena = isset($emp['contrasena']) ? $emp['contrasena'] : "";

        if ($hasNewFields) {
            $stmt->bind_param("siddssis", $nombre, $id_te, $mensual, $total, $fecha_contrato, $estado, $sucursal, $contrasena);
        } else {
            $stmt->bind_param("siddss", $nombre, $id_te, $mensual, $total, $fecha_contrato, $estado);
        }

        if (!$stmt->execute()) {
            throw new Exception("Error al registrar el personal: " . $stmt->error);
        }

        $id_personal = $stmt->insert_id;

        $sqlTipo = "SELECT nombre_tipo_personal FROM tipo_personal WHERE id_te = ? LIMIT 1";
        $stmtTipo = $conexion->prepare($sqlTipo);
        $stmtTipo->bind_param("i", $id_te);
        $stmtTipo->execute();
        $resTipo = $stmtTipo->get_result();
        $tipo = $resTipo->fetch_assoc();
        $stmtTipo->close();
        $nombre_tipo = $tipo ? $tipo['nombre_tipo_personal'] : "";

        try {
            supabaseCrearUsuario($nombre, $nombre_tipo, $estado, $sucursal, $contrasena);
        } catch (SupabaseOfflineException $e) {
            /* Sin red: se encola para subir cuando vuelva la conexion */
            syncEncolar('usuarios', 'insert', [
                'id_usuario' => $id_personal,
                'nombre' => $nombre,
                'rol' => $nombre_tipo,
                'estado' => $estado,
                'sucursal' => $sucursal,
                'contraseña' => $contrasena,
                'sincronizado' => 1
            ], $id_personal);
        } catch (Exception $e) {
            error_log("Error Supabase al crear usuario: " . $e->getMessage());
        }

        $creados[] = [
            "id_personal" => $id_personal,
            "nombre_apellido" => $nombre,
            "id_te" => $id_te
        ];
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Personal registrado correctamente",
        "personal" => $creados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
