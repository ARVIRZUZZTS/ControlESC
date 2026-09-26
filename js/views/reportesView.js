import { reporteViaje } from "./reporte/reporteInfo.js";
import { historialReporteView } from "./reporte/historialReporte.js";
import { fechaISOToDMY } from "../utils.js";

export async function reportesView() {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando reportes...</p>`;
    title.innerHTML = ``;

    try {

        const [resFlotas, resEstados, resUbicaciones] = await Promise.all([
            fetch("php/views/reportes.php"),
            fetch("php/api/get/flotaEstados/route.php"),
            fetch("php/api/get/ubicaciones/route.php")
        ]);

        const flotas = await resFlotas.json();
        if (flotas.status === "error") {
            cont.innerHTML = `<p>${flotas.message}</p>`;
            console.error(flotas.message);
            return;
        }

        const estados = (await resEstados.json()).data || [];
        const ubicaciones = (await resUbicaciones.json()).data || [];

        const optEstados = `<option value="">Todos estados</option>` +
            estados.map(e => `<option value="${e.id_fe}">${e.nombre_estado_flota}</option>`).join("");

        const optUbicaciones = `<option value="">Todas ubicaciones</option>` +
            ubicaciones.map(u => `<option value="${u.id_ubicacion}">${u.nombre_ubicacion}</option>`).join("");

        let titleHtml = `
            <h2>REPORTES</h2>
            <div class="btnsTitle">
                <button id="limpiarFiltrosBtn">Limpiar Filtros</button>
                <select id="filtroRuedas">
                    ${optEstados}
                </select>
                <select id="filtroUbicacion">
                    ${optUbicaciones}
                </select>
            </div>
        `;
        title.innerHTML = titleHtml;

        document.getElementById("filtroRuedas").addEventListener("change", renderTabla);
        document.getElementById("filtroUbicacion").addEventListener("change", renderTabla);
        document.getElementById("limpiarFiltrosBtn").addEventListener("click", () => {
            document.getElementById("filtroRuedas").value = "";
            document.getElementById("filtroUbicacion").value = "";
            renderTabla();
        });

        let filtradas = flotas;

        function renderTabla() {
            const idEstado = document.getElementById("filtroRuedas").value;
            const idUbicacion = document.getElementById("filtroUbicacion").value;

            filtradas = flotas.filter(f => {
                if (idEstado !== "" && Number(f.id_fe) !== Number(idEstado)) return false;
                if (idUbicacion !== "" && Number(f.id_u) !== Number(idUbicacion)) return false;
                return true;
            });

            cont.innerHTML = construirHtml(filtradas);
            document.querySelectorAll("#tbReportes .btnInfo").forEach(btn => {
                btn.addEventListener("click", function() {
                    reporteViaje(this.dataset.placa);
                });
            });
            document.querySelectorAll("#tbReportes .btnHistorial").forEach(btn => {
                btn.addEventListener("click", function() {
                    historialReporteView({ placa: this.dataset.placa, onBack: reportesView });
                });
            });
        }

        function construirHtml(lista) {
            let html = `
                <table id="tbReportes">
                    <thead>
                        <tr>
                            <th class="thl t8">Placa</th>
                            <th class="th t8">Estado</th>
                            <th class="th t10">Reporte</th>
                            <th class="th t3">Info.</th>
                            <th class="thr t5">Historial</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            lista.forEach(f => {
                const rep = f.id_reporte
                    ? `#${f.id_reporte} - ${fechaISOToDMY(f.fecha_partida) || "-"}`
                    : "Sin reporte abierto";
                html += `
                    <tr>
                        <td class="pb t8">${f.placa}</td>
                        <td class="pb pm t8">${f.estado}</td>
                        <td class="pb pm t10">${rep}</td>
                        <td class="pb pm t3">
                            <button class="btnInfo listBtn" data-placa="${f.placa}" title="Abrir reporte">
                                <img src="img/info.svg" alt="reporte">
                            </button>
                        </td>
                        <td class="pb t5">
                            <button class="btnHistorial listBtn" data-placa="${f.placa}" title="Ver historial de ${f.finalizados} reporte(s)">
                                <img src="img/reportesList.svg" alt="historial">
                            </button>
                        </td>
                    </tr>
                `;
            });
            html += `
                    </tbody>
                </table>
            `;
            return html;
        }

        renderTabla();

    } catch (error) {
        cont.innerHTML = "<p>Error cargando reportes</p>";
        console.error(error);
    }
}