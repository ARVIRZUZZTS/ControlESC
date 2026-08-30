import { ruedasListView } from "../list/ruedas.js";

export async function loteRuedaInfo(id_lote) {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Lote de Ruedas...</p>`;
    title.innerHTML = ``;
    
    //<button id="newMarcaRuedaBtn"><img src="img/newMarca.svg" alt="Marcas"></button>  V
    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>LOTE DE RUEDAS ${id_lote}°</h2>
        </div>
    `;
    title.innerHTML = titleHtml;

    //document.getElementById("newMarcaRuedaBtn").addEventListener("click", newMarcaRuedaView);
    document.getElementById("backBtn").addEventListener("click", ruedasListView);

    try {
        const res_info_rueda = await fetch(`php/api/get/loteRuedaInfo/route.php?id_lote=${id_lote}`);
        const loteResponse = await res_info_rueda.json();
        const data_info_rueda = loteResponse.data || loteResponse;
        const data_ruedas_detalles = loteResponse.detalles || [];
        
        const res_rueda_individuales = await fetch(`php/api/get/ruedasIndividuales/route.php?id_lote=${id_lote}`);
        const ruedas_individualesResponse = await res_rueda_individuales.json();
        const data_ruedas_individuales = ruedas_individualesResponse.data || ruedas_individualesResponse;
        
        const placasRes = await fetch("php/api/get/placasList/route.php");
        const placasResponse = await placasRes.json();
        const placas = placasResponse.data || placasResponse;

        let html = `
            <div class="infoSection">
                <div class="nmrvrow">
                    <p><strong>F. Compra:</strong> ${data_info_rueda.fecha_compra}</p>
                    <p><strong>Precio Total:</strong> ${data_info_rueda.precio_total} Bs.</p>
                </div>
                <div class="nmrvrow">
                    <p><strong>Cantidad:</strong> ${data_info_rueda.cantidad}</p>
                    <p><strong>Stock:</strong> ${data_info_rueda.stock}</p>
                </div>
                <div class="nmrvrow">
                    <p><strong>Ruedas:</strong></p>
                </div>
                <ul style="list-style:none; margin:0; padding:0 2vh;">
                    ${data_ruedas_detalles.map(rd => `
                        <li><strong>${rd.nombre_marca_rueda}</strong> - ${rd.precio_rueda} Bs.</li>
                    `).join("")}
                </ul>
            </div>
        `;

        html += `
            <table id="tbFlotas">
                <thead>
                    <tr>
                        <th class="thl t8">Placa</th>
                        <th class="thl t8">Posicion</th>
                        <th class="t3">ID Rueda</th>
                        <th class="t3">Viajes</th>
                        <th class="t5">Fechas de Instalacion</th>
                        <th class="t8">Fechas de Baja</th>
                        <th class="t3">Costo X Viaje</th>
                        <th class="t8">Estado</th>
                        <th class="thr t3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        console.log(data_ruedas_individuales);
        data_ruedas_individuales.forEach(indRueda => {
            let fech_uso = indRueda.fecha_uso == null ? "-" : indRueda.fecha_uso;
            html += `
                <tr>
                    <td class="pb t8"><input type="text" name="tPlaca" value="${indRueda.placa}"></td>
                    <td class="pb pm t8">${indRueda.codigo}</td>
                    <td class="pb pm t3">${indRueda.id_rf}</td>
                    <td class="pb pm t3">${indRueda.viajes_hechos}</td>
                    <td class="pb pm t5">${fech_uso}</td>
                    <td class="pb pm t8">-</td>
                    <td class="pb pm t3">-</td>
                    <td class="pb pm t8">${indRueda.estado}</td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id=""><img src="img/trash.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        document.querySelectorAll(".tPlaca").forEach(input => {
            input.addEventListener("change", function () {
                const fila = this.closest("tr");
                const id_rueda = fila.dataset.id_rueda;
                const placa = this.value.trim();
            
                guardarPlacaRueda(id_rueda, placa);            
            });
        
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando Lote de Ruedas</p>";
        console.error(error);
    }
}

async function guardarPlacaRueda(id_rueda, placa) {

    if (placa !== "") {
        try {
            const res = await fetch("php/api/features/ruedaToPlaca/route.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_rueda: id_rueda,
                    placa: placa
                })
            });
            const data = await res.json();
            if (data.status === "ok") {
                console.log("Rueda actualizada", data);
            } else {
                console.log("Error actualizando rueda", data);
            }
        } catch (error) {
            console.error("Error guardando:", error);
        }
    }
}