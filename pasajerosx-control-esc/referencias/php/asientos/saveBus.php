<?php
include "../conexion.php";
header('Content-Type: application/json');

try {
    // Verificar que la conexión esté establecida
    if (!$conexion) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Obtener datos del POST
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['nombreBus'])) {
        throw new Exception("Datos inválidos: nombreBus no especificado");
    }

    // Validar que haya elementos para guardar
    if (!isset($data['elementos']) || !is_array($data['elementos']) || count($data['elementos']) === 0) {
        throw new Exception("No hay elementos para guardar");
    }

    // Desactivar autocommit para manejar transacciones
    $conexion->autocommit(false);

    // Si es modo edición, primero eliminamos los registros existentes
    if (isset($data['operacion']) && $data['operacion'] === 'e' && isset($data['nombreOriginal'])) {
        $deleteStmt = $conexion->prepare("DELETE FROM planilla WHERE nombre = ?");
        if (!$deleteStmt) {
            throw new Exception("Error al preparar consulta de eliminación: " . $conexion->error);
        }
        $deleteStmt->bind_param("s", $data['nombreOriginal']);
        if (!$deleteStmt->execute()) {
            throw new Exception("Error al eliminar registros existentes: " . $deleteStmt->error);
        }
        $deleteStmt->close();
    }

    // Preparar la consulta SQL para insertar
    $insertStmt = $conexion->prepare("INSERT INTO planilla (nombre, tipo, numAs, posX, posY, estado) 
                                    VALUES (?, ?, ?, ?, ?, 0)");

    if (!$insertStmt) {
        throw new Exception("Error al preparar la consulta de inserción: " . $conexion->error);
    }

    // Determinar el nombre a usar (para copias)
    $nombreBus = $data['nombreBus'];
    if (isset($data['operacion']) && $data['operacion'] === 'c' && isset($data['nombreOriginal'])) {
        // Para copias, usamos el nuevo nombre (ya validado en el frontend)
        $nombreBus = $data['nombreBus'];
    } elseif (isset($data['operacion']) && $data['operacion'] === 'e' && isset($data['nombreOriginal'])) {
        // Para edición, usamos el nombre original (por si cambió el nombre)
        $nombreBus = $data['nombreOriginal'];
    }

    // Procesar cada elemento
    foreach ($data['elementos'] as $elemento) {
        // Validar campos requeridos
        if (!isset($elemento['tipo']) || !isset($elemento['posX']) || !isset($elemento['posY'])) {
            throw new Exception("Elemento incompleto: faltan campos requeridos");
        }

        // Determinar numAs (número de asiento o 'x' si no es asiento)
        $numAs = isset($elemento['numAs']) ? $elemento['numAs'] : 'x';
        
        // Vincular parámetros
        $insertStmt->bind_param("sssss", 
            $nombreBus,
            $elemento['tipo'],
            $numAs,
            $elemento['posX'],
            $elemento['posY']
        );
        
        // Ejecutar la inserción
        if (!$insertStmt->execute()) {
            throw new Exception("Error al ejecutar la inserción: " . $insertStmt->error);
        }
    }

    // Si el nombre cambió en edición, actualizamos todos los registros
    if (isset($data['operacion']) && $data['operacion'] === 'e' && 
        isset($data['nombreOriginal']) && $data['nombreOriginal'] !== $data['nombreBus']) {
        $updateStmt = $conexion->prepare("UPDATE planilla SET nombre = ? WHERE nombre = ?");
        if (!$updateStmt) {
            throw new Exception("Error al preparar consulta de actualización: " . $conexion->error);
        }
        $updateStmt->bind_param("ss", $data['nombreBus'], $data['nombreOriginal']);
        if (!$updateStmt->execute()) {
            throw new Exception("Error al actualizar nombre del bus: " . $updateStmt->error);
        }
        $updateStmt->close();
    }

    // Confirmar la transacción
    $conexion->commit();
    $insertStmt->close();

    echo json_encode([
        'success' => true, 
        'message' => 'Diseño guardado correctamente',
        'elementosGuardados' => count($data['elementos']),
        'nombreFinal' => $data['nombreBus']
    ]);

} catch (Exception $e) {
    // Revertir en caso de error
    if (isset($conexion)) {
        $conexion->rollback();
    }
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
} finally {
    // Restaurar autocommit
    if (isset($conexion)) {
        $conexion->autocommit(true);
    }
}
?>