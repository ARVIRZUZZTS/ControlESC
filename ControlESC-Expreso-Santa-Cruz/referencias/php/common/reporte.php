
<?php
include '../conexion.php';

if (isset($_GET['codR'])) {
    $codR = $_GET['codR'];

    $query = "SELECT * FROM reporte WHERE codR = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $codR);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $reporte = $result->fetch_assoc();

        header('Content-Type: application/json');
        echo json_encode($reporte);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetro codR faltante.']);
}
?>