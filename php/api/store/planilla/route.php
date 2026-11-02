<?php
require_once("../../../conexion.php");
require_once("../../../includes/planillaImagen.php");

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['nombreBus']) || trim($data['nombreBus']) === "") {
        throw new Exception("El nombre de la planilla es obligatorio.");
    }

    $nombreBus = trim($data['nombreBus']);
    $operacion = isset($data['operacion']) ? trim($data['operacion']) : 'n';
    $nombreOriginal = isset($data['nombreOriginal']) && $data['nombreOriginal'] !== null ? trim($data['nombreOriginal']) : null;
    $elementos = (isset($data['elementos']) && is_array($data['elementos'])) ? $data['elementos'] : [];

    if (count($elementos) === 0) {
        throw new Exception("La planilla no tiene elementos.");
    }

    $conexion->begin_transaction();

    if ($operacion === 'e' && $nombreOriginal !== null && $nombreOriginal !== "" && $nombreOriginal !== $nombreBus) {
        $stmt = $conexion->prepare("DELETE FROM planilla WHERE nombre = ?");
        if (!$stmt) throw new Exception("Error al preparar eliminacion: " . $conexion->error);
        $stmt->bind_param("s", $nombreOriginal);
        if (!$stmt->execute()) throw new Exception("Error al eliminar planilla original: " . $stmt->error);
        $stmt->close();
    } elseif ($operacion === 'e' && $nombreOriginal !== null && $nombreOriginal !== "") {
        // mismo nombre: reemplazar contenido
        $stmt = $conexion->prepare("DELETE FROM planilla WHERE nombre = ?");
        if (!$stmt) throw new Exception("Error al preparar eliminacion: " . $conexion->error);
        $stmt->bind_param("s", $nombreOriginal);
        if (!$stmt->execute()) throw new Exception("Error al eliminar planilla original: " . $stmt->error);
        $stmt->close();
    }

    $stmt = $conexion->prepare("INSERT INTO planilla (nombre, tipo, numAs, posX, posY, estado) VALUES (?, ?, ?, ?, ?, ?)");
    if (!$stmt) throw new Exception("Error al preparar insercion: " . $conexion->error);

    foreach ($elementos as $el) {
        $tipo = isset($el['tipo']) ? trim($el['tipo']) : '';
        $numAs = isset($el['numAs']) ? (int)$el['numAs'] : 0;
        $posX = isset($el['posX']) ? (int)$el['posX'] : 0;
        $posY = isset($el['posY']) ? (int)$el['posY'] : 0;
        $estado = isset($el['estado']) ? (int)$el['estado'] : 0;

        $stmt->bind_param("ssiisi", $nombreBus, $tipo, $numAs, $posX, $posY, $estado);
        if (!$stmt->execute()) {
            throw new Exception("Error al guardar elemento: " . $stmt->error);
        }
    }
    $stmt->close();

    $conexion->commit();

    $imagen = generarImagenPlanilla($nombreBus);

    echo json_encode([
        "status" => "success",
        "message" => "Planilla guardada correctamente",
        "nombre" => $nombreBus,
        "imagen" => $imagen
    ]);
} catch (Exception $e) {
    if (isset($conexion)) $conexion->rollback();
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conexion->close();
?>
