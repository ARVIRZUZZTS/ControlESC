<?php
header('Content-Type: application/json');

// Incluir el archivo de conexión
include '../conexion.php';

// Obtener el nombre del bus desde la solicitud POST
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';

if(empty($nombre)) {
    echo json_encode(['success' => false, 'message' => 'Nombre del bus no proporcionado']);
    exit;
}

try {
    // Iniciar transacción para asegurar que ambas eliminaciones se completen
    $conexion->begin_transaction();
    
    // 1. Eliminar todos los elementos del bus (asientos, extras)
    $sqlElementos = "DELETE FROM planilla WHERE nombre = ?";
    $stmtElementos = $conexion->prepare($sqlElementos);
    $stmtElementos->bind_param("s", $nombre);
    $stmtElementos->execute();
    
    // Confirmar la transacción
    $conexion->commit();
    
    echo json_encode(['success' => true, 'message' => 'Bus eliminado correctamente']);
    
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    $conexion->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al eliminar el bus: ' . $e->getMessage()]);
}

// Cerrar conexión
$conexion->close();
?>