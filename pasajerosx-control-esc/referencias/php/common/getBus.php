<?php
header('Content-Type: application/json');

include '../conexion.php';

$response = [];

if ($conexion) {
    if (isset($_GET['placa'])) {
        $placa = $_GET['placa'];
        $query = "SELECT p.* FROM planilla p INNER JOIN flota f ON f.nombre_planilla = p.nombre WHERE f.placa = ?";
        $stmt = $conexion->prepare($query);
        if ($stmt) {
            $stmt->bind_param("s", $placa);
            $stmt->execute();
            $result = $stmt->get_result();
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            $response = $data;
            $stmt->close();
        } else {
            $response = ['error' => 'Error al preparar la consulta'];
        }
    } elseif (isset($_GET['nombre'])) {
        $nombre = $_GET['nombre'];
        $query = "SELECT * FROM planilla WHERE nombre = ?";
        $stmt = $conexion->prepare($query);
        if ($stmt) {
            $stmt->bind_param("s", $nombre);
            $stmt->execute();
            $result = $stmt->get_result();
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            $response = $data;
            $stmt->close();
        } else {
            $response = ['error' => 'Error al preparar la consulta'];
        }
    } else {
        $response = ['error' => 'Parámetro placa o nombre requerido'];
    }
    
    $conexion->close();
} else {
    $response = ['error' => 'Error de conexión a la base de datos'];
}

echo json_encode($response);
?>