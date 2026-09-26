import { fechaISOToDMY } from "../utils.js";

const RUEDA_AVISO_PORC = 0.8;
const ACEITE_AVISO_VIAJES = 14;
const ACEITE_CRITICO_VIAJES = 17;

const NIVELES = {
    critico: { orden: 2, clase: "aviso-critico", etiqueta: "CRITICO" },
    aviso: { orden: 1, clase: "aviso-warning", etiqueta: "AVISO" },
    anomalia: { orden: 0, clase: "aviso-anomalia", etiqueta: "ANOMALIA" }
};

function esc(v) {
    return v === null || v === undefined ? "" : String(v);
}

function nivelRueda(viajes, media) {
    const v = parseInt(viajes) || 0;
    const m = parseInt(media) || 0;
    if (m <= 0) return null;
    if (v >= m) return "critico";
    if (v >= Math.ceil(m * RUEDA_AVISO_PORC)) return "aviso";
    return null;
}

function listarAvisos(data) {
    const avisos = [];
    const cfg = data.config || {};
    const avisoRuedaPorc = cfg.porc_aviso_rueda || RUEDA_AVISO_PORC;
    const avisoAceite = cfg.viajes_aviso_aceite || ACEITE_AVISO_VIAJES;
    const criticoAceite = cfg.viajes_por_cambio_aceite || ACEITE_CRITICO_VIAJES;

    (data.ruedas || []).forEach(r => {
        const v = parseInt(r.viajes_hechos) || 0;
        const m = parseInt(r.media_viajes) || 0;
        if (m <= 0) return;
        let nivel = null;
        if (v >= m) nivel = "critico";
        else if (v >= Math.ceil(m * avisoRuedaPorc)) nivel = "aviso";
        if (!nivel) return;
        avisos.push({
            tipo: "Rueda",
            nivel: nivel,
            placa: r.placa,
            detalle: `${r.nombre_marca_rueda} - ${r.posicion}`,
            viajes: v,
            limite: m,
            mensaje: nivel === "critico"
                ? `Rueda supero su vida util (${v}/${m} viajes). Programar cambio urgente.`
                : `Prever siguiente compra de rueda (${v}/${m} viajes).`
        });
    });

    (data.aceites || []).forEach(a => {
        const v = parseInt(a.viajes_aceite) || 0;
        let nivel = null;
        if (v >= criticoAceite) nivel = "critico";
        else if (v >= avisoAceite) nivel = "aviso";
        if (!nivel) return;
        const ultimo = a.ultimo_cambio ? fechaISOToDMY(a.ultimo_cambio) : "sin registro";
        avisos.push({
            tipo: "Aceite",
            nivel: nivel,
            placa: a.placa,
            detalle: `Cambio de aceite: ${ultimo}`,
            viajes: v,
            limite: criticoAceite,
            mensaje: nivel === "critico"
                ? `Cambio de aceite vencido (${v} viajes desde el ultimo cambio).`
                : `Prever cambio de aceite (${v} viajes desde el ultimo cambio).`
        });
    });

    (data.anomalias || []).forEach(a => {
        const extra = a.codigo ? ` - ${a.codigo}` : "";
        avisos.push({
            tipo: a.tipo,
            nivel: "anomalia",
            placa: a.placa,
            detalle: `${a.evento}${extra}`,
            viajes: a.viajes,
            limite: a.limite,
            mensaje: a.detalle,
            fecha: a.fecha
        });
    });

    return avisos.sort((a, b) =>
        NIVELES[b.nivel].orden - NIVELES[a.nivel].orden || a.placa.localeCompare(b.placa)
    );
}

export async function avisosView() {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando avisos...</p>`;
    title.innerHTML = `<h2>AVISOS</h2>`;

    try {

        const res = await fetch("php/api/get/avisos/route.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${esc(data.message)}</p>`;
            console.error(data.message);
            return;
        }

        const avisos = listarAvisos(data);
        const criticos = avisos.filter(a => a.nivel === "critico").length;
        const anomalias = avisos.filter(a => a.nivel === "anomalia").length;

        title.innerHTML = `
            <h2>AVISOS</h2>
            <div class="btnsTitle">
                <span id="resumenAvisos" class="aviso-resumen"></span>
                <select id="filtroAvisoTipo">
                    <option value="">Todo</option>
                    <option value="Rueda">Ruedas</option>
                    <option value="Aceite">Aceite</option>
                    <option value="__anomalia">Anomalias</option>
                </select>
                <select id="filtroAvisoNivel">
                    <option value="">Todos los niveles</option>
                    <option value="critico">Solo criticos</option>
                    <option value="aviso">Solo avisos</option>
                    <option value="anomalia">Solo anomalias</option>
                </select>
            </div>
        `;

        document.getElementById("filtroAvisoTipo").addEventListener("change", renderTabla);
        document.getElementById("filtroAvisoNivel").addEventListener("change", renderTabla);

        function renderTabla() {
            const tipo = document.getElementById("filtroAvisoTipo").value;
            const nivel = document.getElementById("filtroAvisoNivel").value;

            const resumen = document.getElementById("resumenAvisos");
            const visibles = avisos.filter(a => {
                const coincideTipo = tipo === "" || (tipo === "__anomalia" ? a.nivel === "anomalia" : a.tipo === tipo);
                return coincideTipo && (nivel === "" || a.nivel === nivel);
            });
            resumen.textContent = `${visibles.length} aviso(s) - ${criticos} critico(s) - ${anomalias} anomalia(s)`;
            resumen.className = criticos > 0 ? "aviso-resumen aviso-resumen-critico" : "aviso-resumen";

            if (visibles.length === 0) {
                cont.innerHTML = `<p class="aviso-vacio">No hay avisos que mostrar.</p>`;
                return;
            }

            let html = `
                <table id="tbAvisos">
                    <thead>
                        <tr>
                            <th class="thl t5">Nivel</th>
                            <th class="th t5">Tipo</th>
                            <th class="th t8">Placa</th>
                            <th class="th t20">Detalle</th>
                            <th class="th t5">Viajes</th>
                            <th class="th t5">Limite</th>
                            <th class="thl t20">Aviso</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            visibles.forEach(a => {
                const n = NIVELES[a.nivel];
                html += `
                    <tr class="aviso-fila ${n.clase}">
                        <td class="pb pm t5"><span class="aviso-badge ${n.clase}">${n.etiqueta}</span></td>
                        <td class="pb pm t5">${a.tipo}</td>
                        <td class="pb t8">${esc(a.placa)}</td>
                        <td class="pb pm t20">${esc(a.detalle)}</td>
                        <td class="pb pm t5">${a.viajes === null || a.viajes === undefined ? "-" : a.viajes}</td>
                        <td class="pb pm t5">${a.limite === null || a.limite === undefined ? "-" : a.limite}</td>
                        <td class="pb t20">${esc(a.mensaje)}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;
            cont.innerHTML = html;
        }

        renderTabla();

    } catch (error) {
        cont.innerHTML = "<p>Error cargando avisos</p>";
        console.error(error);
    }
}
