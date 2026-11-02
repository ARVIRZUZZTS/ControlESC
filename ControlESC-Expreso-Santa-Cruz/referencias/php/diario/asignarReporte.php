<?php
include "../conexion.php";

$codP = $_POST['codP'];
$codR = $_POST['codR'];

$sql = "UPDATE persona SET codR = ? WHERE codP = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ii", $codR, $codP);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
?>
