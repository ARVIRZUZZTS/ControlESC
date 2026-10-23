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
                            if (ev.tipo === "partio") { label = "Partió"; }
                            else if (ev.tipo === "llego") { label = "Llegó"; }
                            else if (ev.tipo === "retorno") { label = "Retornó"; }
                            else if (ev.tipo === "estimado") { label = "Llegada Est."; }
                            const c1 = ev.reporte?.color1 || '#6366f1';
                            const c2 = ev.reporte?.color2;
                            const grad = c2 && c2 !== c1 ? `linear-gradient(135deg, ${c1}, ${c2})` : c1;
                            const txt = colorTextoFlota(c1, c2);
                            const extra = ev.tipo === "estimado" ? 'border:1px dashed var(--accent);font-style:italic;' : '';
                            return `<div class="hist-evento" style="background:${grad};color:${txt};${extra};text-shadow:0 0 2px rgba(0,0,0,0.6),0 0 2px rgba(255,255,255,0.6);font-weight:bold;">${label}: ${ev.placa}</div>`;
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

function luminanciaHex(hex) {
    if (!hex || typeof hex !== "string") return 0;
    const h = hex.replace("#", "");
    if (h.length !== 6) return 0;
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const toLin = (v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function colorTextoFlota(c1, c2) {
    const l1 = luminanciaHex(c1);
    const l2 = c2 ? luminanciaHex(c2) : l1;
    const maxL = Math.max(l1, l2);
    const minL = Math.min(l1, l2);
    // contraste minimo para texto blanco vs parte mas clara
    const contrasteBlanco = (1.0 + 0.05) / (maxL + 0.05);
    // contraste minimo para texto negro vs parte mas oscura
    const contrasteNegro = (minL + 0.05) / (0.0 + 0.05);
    return contrasteBlanco >= contrasteNegro ? "#ffffff" : "#000000";
}