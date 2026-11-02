<?php
include '../conexion.php';

if (isset($_GET['codR'])) {
    $codR = $_GET['codR'];

    $query = "SELECT * FROM persona WHERE codR = ? ORDER BY asiento";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $codR);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $pasajeros = $result->fetch_all(MYSQLI_ASSOC);

        header('Content-Type: application/json');
        echo json_encode($pasajeros);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetro codR faltante.']);
}
?>
