<?php
// php/includes/planillaImagen.php

function generarImagenPlanilla($nombre) {
    global $conexion;

    if (!extension_loaded('gd')) {
        return null;
    }

    $stmt = $conexion->prepare("SELECT tipo, numAs, posX, posY FROM planilla WHERE nombre = ?");
    if (!$stmt) return null;
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $result = $stmt->get_result();

    $elementos = [];
    while ($row = $result->fetch_assoc()) {
        $elementos[] = $row;
    }
    $stmt->close();

    if (count($elementos) === 0) {
        return null;
    }

    $scale = 0.5;
    $w = 230;
    $h = 360;
    $img = imagecreatetruecolor($w, $h);
    $bg = imagecolorallocate($img, 240, 240, 240);
    imagefill($img, 0, 0, $bg);
    $border = imagecolorallocate($img, 180, 180, 180);
    imagerectangle($img, 0, 0, $w - 1, $h - 1, $border);

    $green = imagecolorallocate($img, 76, 175, 80);
    $red = imagecolorallocate($img, 244, 67, 54);
    $purple = imagecolorallocate($img, 156, 39, 176);
    $blue = imagecolorallocate($img, 33, 150, 243);
    $yellow = imagecolorallocate($img, 255, 193, 7);
    $black = imagecolorallocate($img, 0, 0, 0);

    foreach ($elementos as $el) {
        $x = (int)round(((int)$el['posX']) * $scale);
        $y = (int)round(((int)$el['posY']) * $scale);
        $tipo = $el['tipo'];
        if ($tipo === 'asiento') {
            $size = 18;
            imagefilledrectangle($img, $x, $y, $x + $size, $y + $size, $green);
            imagerectangle($img, $x, $y, $x + $size, $y + $size, $black);
            $num = (string)$el['numAs'];
            imagestring($img, 1, $x + 3, $y + 5, $num, $black);
        } elseif ($tipo === 'puerta') {
            imagefilledrectangle($img, $x, $y, $x + 16, $y + 24, $blue);
        } elseif ($tipo === 'baño') {
            imagefilledrectangle($img, $x, $y, $x + 16, $y + 16, $red);
        } elseif ($tipo === 'tv') {
            imagefilledrectangle($img, $x, $y, $x + 20, $y + 12, $purple);
        } elseif ($tipo === '2do piso') {
            imagefilledrectangle($img, $x, $y, $x + 30, $y + 12, $yellow);
        }
    }

    $safe = preg_replace('/\s+/', '_', $nombre);
    $dir = __DIR__ . '/../../img/planillas';
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $path = $dir . '/' . $safe . '.webp';

    if (function_exists('imagewebp')) {
        imagewebp($img, $path, 85);
    } else {
        imagepng($img, str_replace('.webp', '.png', $path));
    }
    imagedestroy($img);

    return 'img/planillas/' . $safe . '.webp';
}
?>
