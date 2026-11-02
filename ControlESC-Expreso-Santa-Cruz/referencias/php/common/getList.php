<?php
header('Content-Type: application/json');
require '../conexion.php';

$lists = [
    'c1' => [],
    'l1' => [],
    'c2' => [],
    'l2' => [],
    'conLic' => [],  // Este es el array crítico para el autocompletado
    'ay' => [],
    'pl' => [],

    'dt' => [],
    'hr' => [],
    'ca' => []
];

try {
    // 1. Obtener datos de reportes
    $queryReporte = "SELECT DISTINCT 
                    con1 AS conductor1, 
                    lic1 AS licencia1, 
                    con2 AS conductor2, 
                    lic2 AS licencia2, 
                    ayudante,
                    destino, 
                    placa, 
                    hora, 
                    carril 
                    FROM reporte";
    
    $resultReporte = mysqli_query($conexion, $queryReporte);
    
    if ($resultReporte) {
        while ($row = mysqli_fetch_assoc($resultReporte)) {
            // Procesar conductor principal (modificado)
            if ($row['conductor1'] !== null && $row['conductor1'] !== '') {
                $lists['c1'][] = trim($row['conductor1']);
                if ($row['licencia1'] !== null && $row['licencia1'] !== '') {
                    $lists['l1'][] = trim($row['licencia1']);
                    $lists['conLic'][] = trim($row['conductor1']) . '&' . trim($row['licencia1']);
                }
            }
            
            // Procesar conductor secundario (modificado)
            if ($row['conductor2'] !== null && $row['conductor2'] !== '') {
                $lists['c2'][] = trim($row['conductor2']);
                if ($row['licencia2'] !== null && $row['licencia2'] !== '') {
                    $lists['l2'][] = trim($row['licencia2']);
                    $lists['conLic'][] = trim($row['conductor2']) . '&' . trim($row['licencia2']);
                }
            }
            
            // Otros campos (optimizado)
            foreach (['ayudante', 'placa', 'destino', 'hora', 'carril'] as $field) {
                if ($row[$field] !== null && $row[$field] !== '') {
                    $lists[$field[0] . $field[1]][] = trim($row[$field]); // 'ayudante' -> 'ay'
                }
            }
        }
    }
    
    // Limpieza de datos (versión mejorada)
    foreach ($lists as $key => &$list) {
        if ($key === 'planillasCompletas') continue;
        
        $list = array_values(array_unique($list)); // Elimina duplicados y reindexa
        
        // Solo ordenar arrays que no sean conLic
        if ($key !== 'conLic') {
            sort($list);
        }
    }
    
    // Debug: Verifica los datos antes de enviar
    error_log("Total pares conLic: " . count($lists['conLic']));
    error_log("Ejemplo conLic: " . ($lists['conLic'][0] ?? 'Vacío'));
    
    $queryDestino = "SELECT nombreZona FROM destino ORDER BY nombreZona";
    $resultDestino = mysqli_query($conexion, $queryDestino);
    $lists['dt'] = [];
    if ($resultDestino) {
        while ($row = mysqli_fetch_assoc($resultDestino)) {
            $lists['dt'][] = $row['nombreZona'];
        }
    }

    // 3. Obtener planillas completas desde flota (con DISTINCT para evitar duplicados cuando una misma planilla se asigna a varias flotas)
    $queryPlanillas = "SELECT DISTINCT p.nombre, f.placa, f.conductor1 AS conductor, f.licencia1 AS licencia
                       FROM (SELECT DISTINCT nombre FROM planilla) p
                       LEFT JOIN flota f ON f.nombre_planilla = p.nombre
                       ORDER BY p.nombre";
    $resultPlanillas = mysqli_query($conexion, $queryPlanillas);
    $lists['planillasCompletas'] = [];
    $nombresVistos = [];
    if ($resultPlanillas) {
        while ($row = mysqli_fetch_assoc($resultPlanillas)) {
            if (in_array($row['nombre'], $nombresVistos)) continue;
            $nombresVistos[] = $row['nombre'];
            $lists['planillasCompletas'][] = [
                'nombre' => $row['nombre'],
                'placa' => $row['placa'] ?? '',
                'conductor' => $row['conductor'] ?? '',
                'licencia' => $row['licencia'] ?? ''
            ];
        }
    }

    echo json_encode($lists);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener las listas',
        'details' => $e->getMessage()
    ]);
} finally {
    if (isset($conexion)) {
        mysqli_close($conexion);
    }
}
?>