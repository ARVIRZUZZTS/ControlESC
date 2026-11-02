<?php
    include '../conexion.php';

    if (isset($_GET['fecha'])) {
        $fecha = $_GET['fecha'];

        $query = "SELECT * FROM reporte WHERE fecha = ? ORDER BY codR";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("s", $fecha);

        if ($stmt->execute()) {
            $res = $stmt->get_result();
            $reportes = $res->fetch_all(MYSQLI_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($reportes);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al ejecutar la consulta.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Parámetro fecha faltante.']);
    }
?>
