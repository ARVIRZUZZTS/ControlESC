<?php
include "../conexion.php";

// Validar que todos los parámetros existen
$required = ['nombre', 'ci', 'fecha', 'destino', 'precio', 'asiento'];
foreach ($required as $field) {
    if (!isset($_POST[$field])) {
        echo json_encode(["success" => false, "error" => "Campo $field faltante"]);
        exit;
    }
}

// Validar que el precio es entero
if (!is_numeric($_POST['precio']) || floatval($_POST['precio']) != intval($_POST['precio'])) {
    echo json_encode(["success" => false, "error" => "El precio debe ser un valor entero"]);
    exit;
}

$nombre = $_POST['nombre'];
$ci = $_POST['ci'];
$codR = isset($_POST['codR']) && $_POST['codR'] !== '' ? $_POST['codR'] : null;
$fecha = $_POST['fecha'];
$destino = $_POST['destino'];
$precio = intval($_POST['precio']); // Asegurar valor entero
$asiento = $_POST['asiento'];

// Validar asiento no ocupado (si es viaje específico)
if ($codR !== null) {
    $check = $conexion->prepare("SELECT 1 FROM persona WHERE codR = ? AND asiento = ?");
    $check->bind_param("ii", $codR, $asiento);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "Asiento $asiento ocupado"]);
        exit;
    }
}

// Insertar
$stmt = $conexion->prepare("INSERT INTO persona (nombre, ci, codR, fecha, destino, precio, asiento) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssissii", $nombre, $ci, $codR, $fecha, $destino, $precio, $asiento);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$conexion->close();
?>