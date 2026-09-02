import { ruedasListView } from "../list/ruedas.js";

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
                        <th class="thr t3"></th>
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
                        <td class="pb t3"></td>
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
                        <th class="thl t">Placa</th>
                        <th class="th t">Codigo</th>
                        <th class="th t">Marca</th>
                        <th class="th t15">Precio Rueda</th>
                        <th class="th t15">Viajes Hechos</th>
                        <th class="th t8">Estado</th>
                        <th class="thr t5">Info</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data_ruedas_individuales.forEach(rd => {
            const placa = rd.estado_flota === "Activo" ? (rd.placa || "-") : "";
            html += `
                <tr>
                    <td class="pb pm t">${placa}</td>
                    <td class="pb pm t">${rd.codigo}</td>
                    <td class="pb pm t">${rd.nombre_marca_rueda}</td>
                    <td class="pb pm t15">${rd.precio_rueda} Bs.</td>
                    <td class="pb pm t15">${rd.viajes_hechos}</td>
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

    } catch (error) {
        cont.innerHTML = "<p>Error cargando Lote de Ruedas</p>";
        console.error(error);
    }
}
