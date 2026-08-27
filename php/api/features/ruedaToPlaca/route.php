<?php
require_once("../../../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {

    $id_rueda = $data["id_rueda"];
    $placa = trim($data["placa"]);

    if ($placa === "Baja") {
        $sql = "UPDATE rueda_flota SET placa = '-', estado = 'Baja' WHERE id_rf = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_rueda);
        $stmt->execute();
        $stmt->close();

        echo json_encode(["status" => "success", "message" => "Rueda dada de baja correctamente"]);
        exit;
    }

    if ($placa === "Almacen") {
        $sql = "UPDATE rueda_flota SET placa = 'Almacenado' WHERE id_rf = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_rueda);
        $stmt->execute();
        $stmt->close();

        echo json_encode(["status" => "success", "message" => "Rueda enviada a almacén correctamente"]);
        exit;
    }

    $sql = "SELECT placa FROM flota WHERE placa = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Placa no válida"
        ]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    $sql = "UPDATE rueda_flota SET placa = ?, estado = 'Activo' WHERE id_rf = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("si", $placa, $id_rueda);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Rueda asignada a placa correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al guardar la asignación"]);
    }
    $stmt->close();
}
?>