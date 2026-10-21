import { showToast } from "./toast.js";

/* Refresca el badge de pendientes en el boton SUCURSALES de Ajustes */
export async function actualizarBadgeSuc() {
    try {
        const res = await fetch("php/api/sync/estado/route.php");
        const data = await res.json();
        if (data.status !== "success") return;

        const badge = document.getElementById("syncBadgeSuc");
        if (badge) {
            const total = (data.pendientes || 0) + (data.errores || 0);
            badge.textContent = total > 0 ? String(total) : "";
            badge.style.display = total > 0 ? "inline-flex" : "none";
            badge.title = data.errores > 0
                ? `${data.errores} con error, ${data.pendientes} pendientes`
                : `${data.pendientes} pendientes de subir`;
        }
        return data;
    } catch (e) {
        return null;
    }
}

/* Revisa cada 5 minutos si hay conexion y sube lo pendiente */
export function iniciarAutoSync() {
    setInterval(async () => {
        try {
            const res = await fetch("php/api/sync/procesar/route.php", { method: "POST" });
            const data = await res.json();
            if (data.status === "success" && data.resumen && data.resumen.subidas > 0) {
                actualizarBadgeSuc();
            }
        } catch (e) { /* sin red: se intenta en 5 minutos mas */ }
    }, 5 * 60 * 1000);
}

/* Boton manual: fuerza la sincronizacion */
export async function sincronizarAhora() {
    try {
        const res = await fetch("php/api/sync/procesar/route.php", { method: "POST" });
        const data = await res.json();
        const r = data.resumen || {};
        await actualizarBadgeSuc();
        if (r.ocupado) {
            showToast({ type: "info", title: "Sincronizando", description: "La sincronizacion ya esta en curso." });
        } else if (r.errores > 0) {
            showToast({ type: "error", title: "Error parcial", description: `Se subieron ${r.subidas || 0}; ${r.errores} quedaron con error.` });
        } else if ((r.subidas || 0) > 0) {
            showToast({ type: "success", title: "Sincronizado", description: "Todo sincronizado con Supabase." });
        } else {
            showToast({ type: "info", title: "Sin pendientes", description: "No hay nada pendiente de subir." });
        }
    } catch (e) {
        showToast({ type: "error", title: "Sin conexion", description: "Se reintentara automaticamente." });
    }
}



