<?php
require_once("../conexion.php");
require_once("../supabase.php");

header('Content-Type: application/json');

// Si hay red, sincronizar personal desde Supabase (preservando datos operativos locales)
$remotos = null;
try {
    $remotos = supabaseUsuarioListar();
} catch (Exception $e) {
    $remotos = null;
}

if (is_array($remotos) && $conexion) {
    foreach ($remotos as $u) {
        $id = (string)($u['id_usuario'] ?? '');
        $nombre = $u['nombre'] ?? '';
        if ($id === '' || $nombre === '') continue;

        $rol = supabaseRolDe($u);
        $estado = $u['estado'] ?? 'activo';
        $sucursal = isset($u['sucursal']) && $u['sucursal'] !== null ? (string)$u['sucursal'] : null;
        $contra = $u['contraseña'] ?? $u['contrasena'] ?? null;

        // Mapeo rol -> id_te (tipo_personal)
        $map = [
            'Chofer Principal' => 1,
            'Chofer Auxiliar' => 2,
            'Ayudante' => 3,
            'Boletero' => 4,
            'encomiendas' => 8,
            'admin' => 8,
            'gerente' => 8,
        ];
        $id_te = array_key_exists($rol, $map) ? $map[$rol] : null;

        $stmt = $conexion->prepare("INSERT INTO personal (id_personal, nombre_apellido, id_te, estado, sucursal, contrasena) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre_apellido = VALUES(nombre_apellido), id_te = VALUES(id_te), estado = VALUES(estado), sucursal = VALUES(sucursal), contrasena = VALUES(contrasena)");
        if ($stmt) {
            $stmt->bind_param("ssssss", $id, $nombre, $id_te, $estado, $sucursal, $contra);
            $stmt->execute();
            $stmt->close();
        }
    }
}

try {
    $sql = "SELECT p.id_personal, p.nombre_apellido, IFNULL(tp.nombre_tipo_personal, 'Sin tipo') AS tipo_personal, IFNULL(p.mensual, 0) AS mensual, IFNULL(p.total, 0) AS total, p.fecha_contrato, p.estado, p.sucursal, IFNULL(s.nombre, '') AS nombre_sucursal
            FROM personal p
            LEFT JOIN tipo_personal tp ON tp.id_te = p.id_te
            LEFT JOIN sucursal s ON s.id_sucursal = p.sucursal
            WHERE p.estado = 'activo'
            ORDER BY p.nombre_apellido";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    $personal = [];

    while ($row = $result->fetch_assoc()) {
        $personal[] = $row;
    }

    $stmt->close();
    echo json_encode($personal);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al cargar personal: " . $e->getMessage()
    ]);
}
if ($conexion) $conexion->close();
?>
