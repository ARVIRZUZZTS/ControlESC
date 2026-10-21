<?php

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    try {
        $conexion = mysqli_connect("localhost","root","","controlexp2");
    } catch (mysqli_sql_exception $e) {
        /* Sin MySQL la app sigue: Supabase responde y el login cae al espejo local */
        $conexion = null;
        error_log("Conexion MySQL no disponible: " . $e->getMessage());
    }

?>
