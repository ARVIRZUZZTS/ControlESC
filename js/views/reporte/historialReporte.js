import { fechaISOToDMY, estadoAceiteClase } from "../../utils.js";
import { reportesView } from "../reportesView.js";

function esc(v) {
    return v === null || v === undefined ? "" : String(v);
}

function num(v) {
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

function fila(rep) {
    const finalizada = rep.estado === "Finalizado";
    return `
        <tr>
            <td class="pb t3">${rep.id_reporte}</td>
            <td class="pb pm t8"><span class="hist-estado ${finalizada ? "hist-estadoFin" : "hist-estadoAb"}">${esc(rep.estado)}</span></td>
            <td class="pb pm t8">${fechaISOToDMY(rep.fecha_partida) || "-"}</td>
            <td class="pb pm t8">${fechaISOToDMY(rep.fecha_llegada) || "-"}</td>
            <td class="pb pm t20">${esc(rep.ubicacion_llegada) || "-"}</td>
            <td class="pb pm t5">${rep.viajes}</td>
            <td class="pb pm t5">${fmt(rep.aceite_consumido)} L</td>
            <td class="pb pm t10">${fmt(rep.gastos_totales)}</td>
            <td class="pb t15 ${num(rep.balance) < 0 ? "hist-neg" : ""}">${signo(rep.balance)}</td>
        </tr>
    `;
}

export async function historialReporteView({ placa, onBack = reportesView } = {}) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando historial...</p>`;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>HISTORIAL de ${esc(placa)}</h2>
        </div>
    `;

    document.getElementById("backBtn").addEventListener("click", onBack);

    try {
        const res = await fetch(`php/api/get/reportesPlaca/route.php?placa=${encodeURIComponent(placa)}`);
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        const reportes = data.reportes || [];
        const flota = data.flota;

        cont.innerHTML = `
            <div class="hist-cabecera">
                <div class="hist-stats">
                    <div>
                        <span>Viajes totales</span>
                        <strong>${flota ? flota.viajes : 0}</strong>
                    </div>
                </div>
                ${flota ? `
                    <div class="highlight hist-aceite">
                        <p>ACEITE:</p>
                        <p>Capacidad Maxima: ${fmt(flota.capacidad_aceite)} lt</p>
                        <p>Aceite Actual ${fmt(flota.aceite_actual)} lt</p>
                        <label class="estadoAceite ${estadoAceiteClase(flota.viajes_aceite)}">${flota.viajes_aceite}v.</label>
                    </div>
                ` : ""}
            </div>
            <hr>
            ${reportes.length === 0
                ? `<p class="hist-vacio">Esta placa todavia no tiene reportes.</p>`
                : `
                <table id="tbHistorial">
                    <thead>
                        <tr>
                            <th class="thl t3">ID</th>
                            <th class="t8">Estado</th>
                            <th class="t8">Partida</th>
                            <th class="t8">Llegada</th>
                            <th class="t20">Ruta</th>
                            <th class="t5">Viajes</th>
                            <th class="t5">Aceite</th>
                            <th class="t10">Gastos</th>
                            <th class="thr t15">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportes.map(fila).join("")}
                    </tbody>
                </table>
            `}
        `;

    } catch (error) {
        cont.innerHTML = "<p>Error al cargar el historial</p>";
        console.error(error);
    }
}
