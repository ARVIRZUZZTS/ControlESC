<?php
/* Parametros globales del sistema. Fuente unica de verdad. */

const VIAJES_POR_CAMBIO_ACEITE = 17;
const VIAJES_AVISO_ACEITE = 14;
const PORC_AVISO_RUEDA = 0.80;
const VIAJES_POR_TRAMO = 1;
const MAX_VIAJES_REPORTE = 3;

function configSistema() {
    return [
        "viajes_por_cambio_aceite" => VIAJES_POR_CAMBIO_ACEITE,
        "viajes_aviso_aceite" => VIAJES_AVISO_ACEITE,
        "porc_aviso_rueda" => PORC_AVISO_RUEDA,
        "max_viajes_reporte" => MAX_VIAJES_REPORTE
    ];
}

function litrosPorViaje($capacidad_aceite) {
    $capacidad = floatval($capacidad_aceite);
    if ($capacidad <= 0) return 0.0;
    return round($capacidad / VIAJES_POR_CAMBIO_ACEITE, 3);
}

/*
 * Una ruta "A - B - C" son 2 viajes (A->B, B->C).
 * "A - B - B - A" son 2 tambien: quedarse en la misma ciudad no es un viaje.
 * "A - B - C - A" son 3.
 */
function countTramos($ubicacion) {
    if ($ubicacion === null || trim($ubicacion) === "") return 1;
    $partes = preg_split('/\s*-\s*/', trim($ubicacion));
    $lugares = [];
    foreach ($partes as $p) {
        $p = trim($p);
        if ($p !== "") $lugares[] = $p;
    }
    if (count($lugares) < 2) return 1;

    $tramos = 0;
    for ($i = 1; $i < count($lugares); $i++) {
        if (mb_strtolower($lugares[$i]) !== mb_strtolower($lugares[$i - 1])) $tramos++;
    }
    return $tramos > 0 ? $tramos : 1;
}
