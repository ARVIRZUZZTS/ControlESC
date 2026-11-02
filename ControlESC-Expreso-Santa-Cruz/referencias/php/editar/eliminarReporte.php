<?php
include '../conexion.php'; // tu archivo de conexión

if (isset($_GET['codR'])) {
    $codR = $_GET['codR'];

    // Primero elimina los pasajeros relacionados (si es necesario)
    $stmt1 = $conexion->prepare("DELETE FROM persona WHERE codR = ?");
    $stmt1->bind_param("s", $codR);
    $stmt1->execute();

    // Luego elimina el reporte
    $stmt2 = $conexion->prepare("DELETE FROM reporte WHERE codR = ?");
    $stmt2->bind_param("s", $codR);
    $stmt2->execute();

    if ($stmt2->affected_rows > 0) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "No se eliminó el reporte"]);
    }

    $stmt1->close();
    $stmt2->close();
    $conexion->close();
} else {
    echo json_encode(["success" => false, "error" => "codR no proporcionado"]);
}
?>
