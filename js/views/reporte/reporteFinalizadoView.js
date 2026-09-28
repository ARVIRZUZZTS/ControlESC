import { fechaISOToDMY } from "../../utils.js";
import { diaDeFechaISO } from "../../components/fechaCampo.js";
import { abrirHojaImpresion, imprimirParte, datosDesdeReporte } from "./imprimirReporte.js";
import { abrirAlert } from "../../components/modal.js";

function esc(v) {
    return v === null || v === undefined ? "" : String(v);
}

function num(v) {
    if (v === null || v === undefined || v === "") return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

function fmt(v) {
    return num(v).toFixed(2);
}

function signo(v) {
    const n = num(v);
    return (n < 0 ? "-" : "") + Math.abs(n).toFixed(2);
}

function hay(v) {
    return v !== null && v !== undefined && v !== "" && parseFloat(v) > 0;
}

function lineaFecha(etiqueta, fecha, dia) {
    return `
        <div class="rep-linea">
            <span>${etiqueta}</span>
            <strong>${esc(fecha) || "-"}</strong>
            <span>Dia:</span>
            <span class="rep-dia">${esc(dia) || "-"}</span>
        </div>
    `;
}

/* Una celda de la vista: sin inputs, solo texto. Se usa el mismo ancho que
   los .repInput de la vista editable para que las columnas calcen. */
function dato(etiqueta, valor, extra = "") {
    return `
        <div class="sba">
            <h4>${etiqueta}</h4>
            <strong class="rep-dato">${valor}${extra}</strong>
        </div>
    `;
}

function listasOtros(gastos, anomalias) {
    if (gastos.length === 0 && anomalias.length === 0) {
        return dato("Otros:", "-");
    }
    const items = gastos.map(g => `
        <li>${esc(g.titulo) || "Gasto"}${hay(g.responsable) ? ` <span class="rep-datoObs">- ${esc(g.responsable)}</span>` : ""}: <strong>${fmt(g.gasto_generico)}</strong></li>
    `).join("");
    const anomal = anomalias.map(a => `
        <li class="rep-datoAnom">Anomalia${esc(a.detalle_anomalia) ? ` <span class="rep-datoObs">- ${esc(a.detalle_anomalia)}</span>` : ""}: <strong>${fmt(a.gasto_subanomalia)}</strong></li>
    `).join("");
    return `
        <div class="sba rep-otros">
            <div class="rep-otros-left">
                <div class="rep-otros-header">
                    <h2 class="rep-otros-titulo">Otros</h2>
                </div>
                ${gastos.length > 0 ? `<ul class="rep-listaOtros">${items}</ul>` : ""}
                ${anomalias.length > 0 ? `<ul class="rep-listaOtros">${anomal}</ul>` : ""}
            </div>
        </div>
    `;
}

export async function reporteFinalizadoView({ idReporte, onBack = null } = {}) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");

    const volver = onBack || (() => history.back());

    cont.innerHTML = `<p>Cargando reporte...</p>`;
    title.innerHTML = ``;

    let datos = null;

    try {
        const res = await fetch(`php/api/get/reporteDetalle/route.php?id_reporte=${encodeURIComponent(idReporte)}`);
        const data = await res.json();
        if (data.status === "error") throw new Error(data.message);

        const rep = data.reporte;
        const gastos = data.gastos || [];
        const anomalias = data.anomalias || [];

        /* La misma hoja que se imprime, para mostrar los mismos totales. */
        const paraImprimir = datosDesdeReporte(rep, gastos, anomalias);
        datos = { rep, gastos, anomalias, paraImprimir };

        const ruta = esc(rep.ubicacion_llegada) || "-";
        const ret = esc(rep.ubicacion_retorno);
        const viaje = ret ? "Cochabamba - " + ret : "Cochabamba";
        const finalizada = rep.estado === "Finalizado";

        title.innerHTML = `
            <div class="backTitle">
                <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
                <h2>Reporte #${esc(rep.id_reporte)} - ${esc(rep.placa)}</h2>
            </div>
            <div class="btnsTitle">
                <button id="imprimirReporteBtn"><img src="img/print.svg" alt="Imprimir">Imprimir</button>
            </div>
        `;

        document.getElementById("backBtn").addEventListener("click", volver);
        document.getElementById("imprimirReporteBtn").addEventListener("click", imprimir);

        const liq = (campo, ubic) => {
            if (!hay(rep[campo])) return "";
            return dato(`Liquidacion de ${ubic}:`, fmt(rep[campo]));
        };

        const asignaciones = [];
        if (hay(rep.asignacion_efectivo) || hay(rep.asignacion_qr)) {
            const partes = [];
            if (hay(rep.asignacion_efectivo)) partes.push("Efectivo: " + fmt(rep.asignacion_efectivo));
            if (hay(rep.asignacion_qr)) partes.push("Qr: " + fmt(rep.asignacion_qr));
            asignaciones.push(dato("Asignacion $ en:", partes.join(" - ")));
        }

        cont.innerHTML = `
            <div class="rep-encabezado">
                <h4>LINEA DE BUSES EXPRESSO SANTA CRUZ</h4>
                <h4>PARTE DE LLEGADAS DE BUSES</h4>
            </div>

            <div class="rep-encabezado2">
                <div class="rep-linea">
                    <span>Partio de:</span>
                    <strong>-</strong>
                    <span>Fecha:</span>
                    <strong>${esc(fechaISOToDMY(rep.fecha_partida)) || "-"}</strong>
                    <span>Dia:</span>
                    <span class="rep-dia">${esc(diaDeFechaISO(rep.fecha_partida))}</span>
                </div>
                <div class="rep-linea">
                    <span>Retorno de:</span>
                    <strong>${ret || "-"}</strong>
                    <span>Fecha:</span>
                    <strong>${esc(fechaISOToDMY(rep.fecha_retorno)) || "-"}</strong>
                    <span>Dia:</span>
                    <span class="rep-dia">${esc(diaDeFechaISO(rep.fecha_retorno))}</span>
                </div>
                <div class="rep-linea">
                    <span>Llego a:</span>
                    <strong>${ruta}</strong>
                    <span>Fecha:</span>
                    <strong>${esc(fechaISOToDMY(rep.fecha_llegada)) || "-"}</strong>
                    <span>Dia:</span>
                    <span class="rep-dia">${esc(diaDeFechaISO(rep.fecha_llegada))}</span>
                    <span>Placa:</span>
                    <strong>${esc(rep.placa)}</strong>
                </div>
            </div>

            <div class="rep-cierre">
                <div class="rep-cierreTag ${finalizada ? "rep-cierreOk" : "rep-cierreAlerta"}">
                    <strong>Reporte #${esc(rep.id_reporte)} ${esc(rep.estado)}</strong>
                    <span>Viajes: ${esc(rep.viajes)} | Aceite: ${fmt(rep.aceite_consumido)} L</span>
                </div>
                <span class="rep-soloLectura">Solo lectura - reporte finalizado</span>
            </div>

            <div class="estructuraReporteVista">
                <h2 class="rep-seccion">Ingresos</h2>

                ${liq("liquidacion_pasajes", `Pasajes${ret ? " - " + ret : ""}`)}
                ${liq("liquidacion_encomiendas", `Encomiendas${ret ? " - " + ret : ""}`)}
                ${liq("liquidacion_pasajes_auxiliar", "Pasajes Auxiliar")}
                ${asignaciones.join("")}
                ${hay(rep.otros) ? dato("Otros:", esc(rep.otros)) : ""}
                ${dato("Total Efectivo:", fmt(paraImprimir.total_ingresos))}

                <h2 class="rep-seccion">Gastos</h2>

                ${dato(`Diesel de: ${viaje}${rep.factura_diesel_partida ? " <span class=\"rep-datoOk\">Factura Ok</span>" : ""}:`, fmt(rep.diesel_partida))}
                ${dato(`Diesel de: ${ret || "Cochabamba"} a: Cochabamba${rep.factura_diesel_retorno ? " <span class=\"rep-datoOk\">Factura Ok</span>" : ""}:`, fmt(rep.diesel_llegada))}
                ${dato(`Peaje de: ${viaje}:`, fmt(rep.peaje_ida))}
                ${dato(`Peaje de: ${ret || "Cochabamba"} a: Cochabamba:`, fmt(rep.peaje_retorno))}
                ${listasOtros(gastos, anomalias)}
                ${dato("Gastos Totales:", fmt(paraImprimir.total_egresos))}

                <h2 class="rep-seccion">Balance</h2>

                ${dato("Resultado (Ingresos - Gastos):", `<span class="${num(paraImprimir.balance) < 0 ? "hist-neg" : ""}">${signo(paraImprimir.balance)}</span>`)}
            </div>
        `;

    } catch (error) {
        cont.innerHTML = `<p>${esc(error.message || "Error al cargar el reporte")}</p>`;
        title.innerHTML = `
            <div class="backTitle">
                <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
                <h2>Reporte</h2>
            </div>
        `;
        document.getElementById("backBtn").addEventListener("click", volver);
        console.error(error);
    }

    /* Igual que en el historial: la ventana se abre en el clic, no despues del fetch. */
    function imprimir() {
        if (!datos) return;
        const win = abrirHojaImpresion();
        if (!win) return;
        try {
            imprimirParte(datos.paraImprimir, win);
        } catch (error) {
            win.close();
            abrirAlert({ mensaje: error.message || "No se pudo generar la hoja de impresion." });
            console.error(error);
        }
    }
}
