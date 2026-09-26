import { fechaISOToDMY } from "../utils.js";

const RUEDA_AVISO_PORC = 0.8;
const ACEITE_AVISO_VIAJES = 14;
const ACEITE_CRITICO_VIAJES = 17;

const NIVELES = {
    critico: { orden: 2, clase: "aviso-critico", etiqueta: "CRITICO" },
    aviso: { orden: 1, clase: "aviso-warning", etiqueta: "AVISO" }
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

function nivelAceite(viajes) {
    const v = parseInt(viajes) || 0;
    if (v >= ACEITE_CRITICO_VIAJES) return "critico";
    if (v >= ACEITE_AVISO_VIAJES) return "aviso";
    return null;
}

function listarAvisos(data) {
    const avisos = [];

    (data.ruedas || []).forEach(r => {
        const nivel = nivelRueda(r.viajes_hechos, r.media_viajes);
        if (!nivel) return;
        const viajes = parseInt(r.viajes_hechos) || 0;
        const media = parseInt(r.media_viajes) || 0;
        avisos.push({
            tipo: "Rueda",
            nivel: nivel,
            placa: r.placa,
            detalle: `${r.nombre_marca_rueda} - ${r.posicion}`,
            viajes: viajes,
            limite: media,
            mensaje: nivel === "critico"
                ? `Rueda supero su vida util (${viajes}/${media} viajes). Programar cambio urgente.`
                : `Prever siguiente compra de rueda (${viajes}/${media} viajes).`
        });
    });

    (data.aceites || []).forEach(a => {
        const nivel = nivelAceite(a.viajes_aceite);
        if (!nivel) return;
        const viajes = parseInt(a.viajes_aceite) || 0;
        const ultimo = a.ultimo_cambio ? fechaISOToDMY(a.ultimo_cambio) : "sin registro";
        avisos.push({
            tipo: "Aceite",
            nivel: nivel,
            placa: a.placa,
            detalle: `Cambio de aceite: ${ultimo}`,
            viajes: viajes,
            limite: ACEITE_CRITICO_VIAJES,
            mensaje: nivel === "critico"
                ? `Cambio de aceite vencido (${viajes} viajes desde el ultimo cambio).`
                : `Prever cambio de aceite (${viajes} viajes desde el ultimo cambio).`
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

        title.innerHTML = `
            <h2>AVISOS</h2>
            <div class="btnsTitle">
                <span id="resumenAvisos" class="aviso-resumen"></span>
                <select id="filtroAvisoTipo">
                    <option value="">Todo</option>
                    <option value="Rueda">Ruedas</option>
                    <option value="Aceite">Aceite</option>
                </select>
                <select id="filtroAvisoNivel">
                    <option value="">Todos los niveles</option>
                    <option value="critico">Solo criticos</option>
                    <option value="aviso">Solo avisos</option>
                </select>
            </div>
        `;

        document.getElementById("filtroAvisoTipo").addEventListener("change", renderTabla);
        document.getElementById("filtroAvisoNivel").addEventListener("change", renderTabla);

        function renderTabla() {
            const tipo = document.getElementById("filtroAvisoTipo").value;
            const nivel = document.getElementById("filtroAvisoNivel").value;

            const resumen = document.getElementById("resumenAvisos");
            const visibles = avisos.filter(a =>
                (tipo === "" || a.tipo === tipo) && (nivel === "" || a.nivel === nivel)
            );
            resumen.textContent = `${visibles.length} aviso(s) - ${criticos} critico(s)`;
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
                        <td class="pb pm t5">${a.viajes}</td>
                        <td class="pb pm t5">${a.limite}</td>
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
