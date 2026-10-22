<?php
require_once("../../../conexion.php");
require_once("../../../supabase.php");
require_once("../../../sesion.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['personal']) || !is_array($data['personal']) || count($data['personal']) === 0) {
        throw new Exception("No se recibió personal para registrar.");
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
        $sucursal = isset($emp['sucursal']) && $emp['sucursal'] !== null ? intval($emp['sucursal']) : 3;
        $contrasena = isset($emp['contrasena']) ? $emp['contrasena'] : "";

        if ($contrasena === "") {
            throw new Exception("La contraseña es obligatoria.");
        }

        // Get tipo_personal name for Supabase rol
        $nombre_tipo = "";
        if ($conexion) {
            $stmtTipo = $conexion->prepare("SELECT nombre_tipo_personal FROM tipo_personal WHERE id_te = ? LIMIT 1");
            $stmtTipo->bind_param("i", $id_te);
            $stmtTipo->execute();
            $resTipo = $stmtTipo->get_result();
            $tipo = $resTipo->fetch_assoc();
            $stmtTipo->close();
            $nombre_tipo = $tipo ? $tipo['nombre_tipo_personal'] : "";
        }

        // Fuente de verdad: Supabase
        $datosSupabase = [
            'nombre' => $nombre,
            'rol' => $nombre_tipo,
            'estado' => $estado,
            'sucursal' => $sucursal,
            'contraseña' => $contrasena,
            'sincronizado' => 1
        ];

        $creado = supabaseCrearUsuario($nombre, $nombre_tipo, $estado, $sucursal, $contrasena);
        if (!$creado) {
            throw new Exception("Supabase no devolvio el usuario creado.");
        }

        if (is_array($creado) && isset($creado[0]['id_usuario'])) {
            $id_supabase = $creado[0]['id_usuario'];
        } elseif (isset($creado['id_usuario'])) {
            $id_supabase = $creado['id_usuario'];
        } else {
            throw new Exception("Supabase no devolvio el id del usuario creado.");
        }

        // Replica local (best effort)
        try {
            if ($conexion) {
                $stmt = $conexion->prepare("INSERT INTO personal (id_personal, nombre_apellido, id_te, mensual, total, fecha_contrato, estado, sucursal, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("isiddssis", $id_supabase, $nombre, $id_te, $mensual, $total, $fecha_contrato, $estado, $sucursal, $contrasena);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            error_log("Replica MySQL personal (crear) fallo: " . $e->getMessage());
        }

        // Solo admins se agregan al espejo local (usuarios_rol)
        if ($nombre_tipo === 'admin') {
            authUpsertEspejoLocal($nombre, $nombre_tipo, $contrasena);
        }

        $creados[] = [
            "id_personal" => $id_supabase,
            "nombre_apellido" => $nombre,
            "id_te" => $id_te
        ];
    }

    echo json_encode([
        "status" => "success",
        "message" => "Personal registrado correctamente",
        "personal" => $creados
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