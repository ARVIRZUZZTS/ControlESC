import { ruedasListView } from "../list/ruedas.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { abrirAlert, abrirConfirmation } from "../../components/modal.js";

export async function loteRuedaInfo(id_lote) {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Lote de Ruedas...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>LOTE DE RUEDAS ${id_lote}°</h2>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", ruedasListView);

    try {
        const res_info_rueda = await fetch(`php/api/get/loteRuedaInfo/route.php?id_lote=${id_lote}`);
        const loteResponse = await res_info_rueda.json();
        const data_info_rueda = loteResponse.data || loteResponse;

        const res_rueda_individuales = await fetch(`php/api/get/ruedasIndividuales/route.php?id_lote=${id_lote}`);
        const ruedas_individualesResponse = await res_rueda_individuales.json();
        const data_ruedas_individuales = ruedas_individualesResponse.data || ruedas_individualesResponse;

        const placasRes = await fetch("php/api/get/placasList/route.php");
        const placasResponse = await placasRes.json();
        const placas = placasResponse.data || placasResponse;
        const placasOptions = placas.map(p => ({ id: p.placa, label: p.placa }));

        let html = `
            <table id="tbResumenLote">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Marca</th>
                        <th class="th t8">Fecha Compra</th>
                        <th class="th t8">Precio Total</th>
                        <th class="th t5">Cantidad</th>
                        <th class="th t5">Stock</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb pm t5">${data_info_rueda.id_rl}</td>
                        <td class="pb pm t10">${data_info_rueda.marcas || "-"}</td>
                        <td class="pb pm t8">${data_info_rueda.fecha_compra}</td>
                        <td class="pb pm t8">${data_info_rueda.precio_total} Bs.</td>
                        <td class="pb pm t5">${data_info_rueda.cantidad}</td>
                        <td class="pb pm t5">${data_info_rueda.stock}</td>
                        <td class="pb t3">trash.svg</td>
                    </tr>
                </tbody>
            </table>
        `;

        html += `
            <hr class="loteSeparador">
            <h3 class="loteTitulo">Detalle de Lote</h3>
            <table id="tbDetalleLote">
                <thead>
                    <tr>
                        <th class="thl t8">Placa</th>
                        <th class="th t15">Codigo</th>
                        <th class="th t10">Marca</th>
                        <th class="th t10">Precio Rueda</th>
                        <th class="th t8">Viajes Hechos</th>
                        <th class="th t8">Estado</th>
                        <th class="thr t5">Info</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data_ruedas_individuales.forEach(rd => {
            const baja = rd.estado === "Baja";
            const operativa = rd.estado === "Operativo";
            const placaClass = baja ? " placa-baja" : "";
            const valorPlaca = baja ? "BAJA" : (operativa ? (rd.placa || "") : "");

            html += `
                <tr data-id_rd="${rd.id_rd}">
                    <td class="pb pm t8">
                        <div class="ac-wrap">
                            <input type="text" class="inputPlacaRueda${placaClass}" maxlength="10" autocomplete="off">
                        </div>
                    </td>
                    <td class="pb pm t15">${rd.codigo}</td>
                    <td class="pb pm t10">${rd.nombre_marca_rueda}</td>
                    <td class="pb pm t10">${rd.precio_rueda} Bs.</td>
                    <td class="pb pm t8">${rd.viajes_hechos}</td>
                    <td class="pb pm t8">${rd.estado}</td>
                    <td class="pb t5">
                        <button class="btnInfo listBtn" data-id="${rd.id_rd}">
                            <img src="img/info.svg" alt="info">
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        document.querySelectorAll("#tbDetalleLote tbody tr").forEach(fila => {
            const id_rd = fila.dataset.id_rd;
            const rd = data_ruedas_individuales.find(r => String(r.id_rd) === String(id_rd));
            if (!rd) return;

            const input = fila.querySelector(".inputPlacaRueda");
            const rd_estado = rd.estado;
            const baja = rd_estado === "Baja";
            const operativa = rd_estado === "Operativo";
            const placaActual = baja ? "" : (operativa ? (rd.placa || "") : "");

            const opciones = operativa
                ? [...placasOptions, { id: null, label: "-- Quitar de Flota --" }]
                : placasOptions;

            const ac = autocompleteSeleccion({
                input,
                opciones,
                valorActual: placaActual,
                placeholder: baja ? "BAJA" : (operativa ? placaActual : "Instalar a Flota:"),
                placeholderSiempre: true,
                onCambio: ({ tocado }) => {
                    if (!tocado) return;
                    const nueva = input.value.trim();
                    const previa = placaActual === "BAJA" ? "" : placaActual;
                    if (nueva === placaActual || nueva === previa) return;

                    const ejecutar = (accion) =>
                        fetch("php/api/features/ruedaFlota/route.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ accion, id_rd: parseInt(id_rd), placa: nueva })
                        })
                        .then(r => r.json())
                        .then(data => {
                            if (data.status === "success") {
                                loteRuedaInfo(id_lote);
                            } else {
                                abrirAlert({ mensaje: "Error: " + data.message });
                            }
                        });

                    if (baja) {
                        const mensaje = `Esta seguro de que quiere Instalar una Rueda que fue dada de Baja? tiene ${rd.viajes_hechos} viajes hechos.`;
                        abrirConfirmation({
                            titulo: "Confirmar Instalacion",
                            mensaje,
                            onAceptar: () => ejecutar("instalar")
                        });
                    } else if (operativa && nueva && nueva !== placaActual) {
                        if (nueva === "-- Quitar de Flota --") {
                            abrirConfirmation({
                                titulo: "Confirmar",
                                mensaje: "Esta seguro de quitar la rueda de la flota y dejarla en almacen?",
                                onAceptar: () => ejecutar("quitar")
                            });
                        } else {
                            abrirConfirmation({
                                titulo: "Confirmar Traslado",
                                mensaje: `Esta seguro de mover la rueda de la placa ${placaActual} a la placa ${nueva}?`,
                                onAceptar: () => ejecutar("mover")
                            });
                        }
                    } else if (!operativa && nueva) {
                        ejecutar("instalar");
                    }
                }
            });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando Lote de Ruedas</p>";
        console.error(error);
    }
}