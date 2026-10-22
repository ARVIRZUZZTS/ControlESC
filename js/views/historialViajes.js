import { fechaISOToDMY } from "../utils.js";
import { abrirModal, abrirAlert } from "../components/modal.js";
import { crearCampoFecha } from "../components/fechaCampo.js";
import { reportesView } from "./reportesView.js";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export async function historialViajesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");

    let fechaRef = new Date();
    fechaRef.setHours(0, 0, 0, 0);

    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>HISTORIAL DE VIAJES</h2>
        </div>
    `;

    const backBtn = document.getElementById("backBtn");
    if (backBtn) backBtn.addEventListener("click", () => {
        reportesView();
    });

    cont.innerHTML = `<p>Cargando historial...</p>`;

    await renderVista();

    async function renderVista() {
        const primerDia = new Date(fechaRef);
        primerDia.setDate(primerDia.getDate() - 3);

        const dias = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(primerDia);
            d.setDate(d.getDate() + i);
            dias.push(d);
        }

        const inicio = formatISO(dias[0]);
        const fin = formatISO(dias[5]);

        let reportes = [];
        try {
            const res = await fetch(`php/api/get/historialViajes/route.php?inicio=${inicio}&fin=${fin}`);
            const data = await res.json();
            if (data.status === "success") {
                reportes = data.reportes || [];
            }
        } catch (e) {
            console.error("Error fetching historial:", e);
        }

        const eventosPorFecha = {};
        dias.forEach(d => {
            eventosPorFecha[formatISO(d)] = [];
        });

        reportes.forEach(r => {
            const placa = r.placa;
            if (r.fecha_partida && eventosPorFecha[r.fecha_partida]) {
                eventosPorFecha[r.fecha_partida].push({ tipo: "partio", placa, reporte: r });
            }
            if (r.fecha_llegada && eventosPorFecha[r.fecha_llegada]) {
                if (r.fecha_retorno && r.fecha_retorno === r.fecha_llegada) {
                    eventosPorFecha[r.fecha_llegada].push({ tipo: "retorno", placa, reporte: r });
                } else {
                    eventosPorFecha[r.fecha_llegada].push({ tipo: "llego", placa, reporte: r });
                }
            }
            if (r.fecha_retorno && r.fecha_retorno !== r.fecha_llegada && eventosPorFecha[r.fecha_retorno]) {
                eventosPorFecha[r.fecha_retorno].push({ tipo: "retorno", placa, reporte: r });
            }
        });

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyISO = formatISO(hoy);

        const primerMes = dias[0].getMonth();
        const ultimoMes = dias[5].getMonth();
        const primerAnio = dias[0].getFullYear();
        const ultimoAnio = dias[5].getFullYear();

        let headerMes = MESES[primerMes];
        let headerAnio = primerAnio;
        if (primerMes !== ultimoMes) {
            headerMes = `${MESES[primerMes]} - ${MESES[ultimoMes]}`;
            if (primerAnio !== ultimoAnio) {
                headerAnio = `${primerAnio} - ${ultimoAnio}`;
            }
        }

        title.innerHTML = `
            <div class="backTitle">
                <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
                <h2>HISTORIAL DE VIAJES</h2>
            </div>
            <div class="hist-buscador">
                <button id="histHoyBtn" class="btnSync">Hoy</button>
                <span id="fechaPartida" class="fechaContenedor"></span>
            </div>
        `;

        const backBtn = document.getElementById("backBtn");
        if (backBtn) backBtn.addEventListener("click", () => {
            reportesView();
        });

        let html = `
            <div class="hist-nav">
                <button id="histPrev" class="hist-nav-btn"><img src="img/back.svg" alt="Anterior"></button>
                <span class="hist-periodo">${headerMes} ${headerAnio}</span>
                <button id="histNext" class="hist-nav-btn"><img src="img/next.svg" alt="Siguiente"></button>
            </div>
            <div class="hist-grupo">
        `;

        dias.forEach(d => {
            const iso = formatISO(d);
            const esHoy = iso === hoyISO;
            const eventos = eventosPorFecha[iso] || [];

            html += `
                <div class="hist-dia ${esHoy ? 'hist-dia-hoy' : ''}">
                    <div class="hist-dia-fecha">
                        ${esHoy ? '<span class="hist-badge-hoy">Hoy</span>' : ''}
                        <span class="hist-dia-num">${String(d.getDate()).padStart(2, '0')}</span>
                        <span class="hist-dia-mes">${MESES[d.getMonth()].substring(0, 3)}</span>
                        <span class="hist-dia-sem">${DIAS_SEMANA[d.getDay()]}</span>
                    </div>
                    <div class="hist-dia-eventos">
                        ${eventos.length === 0 ? '<span class="hist-sin-eventos">-</span>' : eventos.map(ev => {
                            let label = "";
                            let clase = "";
                            if (ev.tipo === "partio") { label = "Partió"; clase = "hist-ev-partio"; }
                            else if (ev.tipo === "llego") { label = "Llegó"; clase = "hist-ev-llego"; }
                            else if (ev.tipo === "retorno") { label = "Retornó"; clase = "hist-ev-retorno"; }
                            else if (ev.tipo === "estimado") { label = "Llegada Est."; clase = "hist-ev-estimado"; }
                            return `<div class="hist-evento ${clase}">${label}: ${ev.placa}</div>`;
                        }).join("")}
                    </div>
                </div>
            `;
        });

        html += `
            </div>
        `;

        cont.innerHTML = html;

        // Event listeners
        document.getElementById("histPrev").addEventListener("click", () => {
            fechaRef.setDate(fechaRef.getDate() - 6);
            renderVista();
        });
        document.getElementById("histNext").addEventListener("click", () => {
            fechaRef.setDate(fechaRef.getDate() + 6);
            renderVista();
        });

        const hoyBtn = document.getElementById("histHoyBtn");
        if (hoyBtn) {
            if (formatISO(fechaRef) === hoyISO) {
                hoyBtn.style.display = "none";
            } else {
                hoyBtn.style.display = "";
                hoyBtn.addEventListener("click", () => {
                    fechaRef = new Date();
                    fechaRef.setHours(0, 0, 0, 0);
                    renderVista();
                });
            }
        }

        // FechaPartida field (3-part date input)
        const campoFecha = crearCampoFecha(formatISO(fechaRef));
        document.getElementById("fechaPartida").appendChild(campoFecha);
        campoFecha.addEventListener("fechaCambio", () => {
            const iso = campoFecha.getISO();
            if (iso) {
                const parts = iso.split("-");
                fechaRef = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                fechaRef.setHours(0, 0, 0, 0);
                renderVista();
            }
        });
    }

    function formatISO(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }
}