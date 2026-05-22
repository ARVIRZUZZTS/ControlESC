import { ruedasListView } from "../list/ruedas.js";

export async function loteRuedaInfo(id_lote) {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Lote de Ruedas...</p>`;
    title.innerHTML = ``;
    
    //<button id="newMarcaRuedaBtn"><img src="img/newMarca.svg" alt="Marcas"></button>  V
    let titleHtml = `
        <h2>LOTE DE RUEDAS ${id_lote}°</h2>
        <div class="btnsTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    //document.getElementById("newMarcaRuedaBtn").addEventListener("click", newMarcaRuedaView);
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

        let html = `
            <div class="infoSection">
                <div class="nmrvrow">
                    <p><strong>Marca:</strong> ${data_info_rueda.marca_rueda}</p>
                    <p><strong>Fecha de Compra:</strong> ${data_info_rueda.fecha_compra}</p>
                </div>
                <div class="nmrvrow">
                    <p><strong>Precio Unitario:</strong> ${data_info_rueda.precio_unitario} Bs.</p>
                    <p><strong>Precio Total:</strong> ${data_info_rueda.precio_total} Bs.</p>                
                </div>                
                <div class="nmrvrow">
                    <p><strong>Cantidad:</strong> ${data_info_rueda.cantidad}</p>
                    <p><strong>En Uso:</strong> ${data_info_rueda.en_uso}</p>
                </div>
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
            let fech_baja = indRueda.fecha_baja == null ? "-" : indRueda.fecha_baja;
            html += `
                <tr>
                    <td class="pb t8"><input type="text" name="tPlaca" value=""></td>
                    <td class="pb pm t8">INNER</td>
                    <td class="pb pm t3">${indRueda.id_ri}</td>
                    <td class="pb pm t3">${indRueda.viajes}</td>
                    <td class="pb pm t5">${indRueda.fecha_instalacion_historial}</td>
                    <td class="pb pm t8">${fech_baja}</td>
                    <td class="pb pm t3">${indRueda.costo_viaje}</td>
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