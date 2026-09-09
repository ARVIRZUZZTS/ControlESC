import { marcasRuedasView } from "../marcas/ruedas.js";
import { newLoteRuedaView } from "../new/loteRueda.js";
import { loteRuedaInfo } from "../lotes/loteRuedaInfo.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";

export async function ruedasListView() {
    
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando ruedas...</p>`;
    title.innerHTML = ``;

    const placasRes = await fetch("php/api/get/placasList/route.php");
    const placasResponse = await placasRes.json();
    const placas = placasResponse.data || placasResponse;

    let titleHtml = `
        <h2>LOTES DE RUEDAS</h2>
        <div class="btnsTitle">
            <div class="ac-wrap">
                <input id="busquedaPlacaRuedas" 
                    type="text" 
                    class="tPlaca"
                    maxlength="10"
                    autocomplete="off"
                    placeholder="Por Placa">
            </div>
            <select id="filtroRuedas">
                <option value="todas">Todas</option>
                <option value="activas">Activas</option>
                <option value="almacen">Almacen</option>
                <option value="baja">Baja</option>
                <option value="reciente">Reciente</option>
                <option value="antiguo">Antiguo</option>
            </select>
            <button id="marcaRuedaBtn"><img src="img/marcas.svg" alt="Marcas"></button>
            <button id="newRuedaBtn"><img src="img/newRueda.svg" alt="Nueva Rueda"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    autocompleteSeleccion({
        input: document.getElementById("busquedaPlacaRuedas"),
        opciones: placas.map(p => ({ id: p.placa, label: p.placa })),
        valorActual: "",
        placeholder: "Por Placa",
        modoBuscador: true
    });

    document.getElementById("marcaRuedaBtn").addEventListener("click", marcasRuedasView);
    document.getElementById("newRuedaBtn").addEventListener("click", newLoteRuedaView);

    try {

        const res = await fetch("php/views/ruedas.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        const options = placas.map(p => `<option value="${p.placa}"></option>`).join("");
        const almacen = `<option value="Almacen"></option><option value="Baja"></option>`;
        const datalistHTML  =   `<datalist id="placasList">
                                    ${almacen}
                                    ${options}
                                </datalist>`;

        let html = `
            <table id="tbRuedas">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Marca</th>
                        <th class="th t8">Fecha Compra</th>
                        <th class="th t8">Precio Total Bs.</th>
                        <th class="th t5">Cantidad</th>
                        <th class="th t5">Stock</th>
                        <th class="thr t3">Info.</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(rueda => {
            let fillRueda = ``;
            if (rueda.estado == 0) {
                fillRueda = `placeholder="${rueda.placa}"`;
            } else {
                fillRueda = `placeholder="Baja" disabled`;
            }

            html += `
                <tr data-id_rueda="${rueda.id_rl}">
                    <td class="pb t5">${rueda.id_rl}</td>
                    <td class="pb pm t10">${rueda.marcas || "-"}</td>
                    <td class="pb pm t8">${rueda.fecha_compra}</td>
                    <td class="pb pm t8">${rueda.precio_total}</td>
                    <td class="pb pm t5">${rueda.cantidad}</td>
                    <td class="pb pm t5">${rueda.stock}</td>
                    <td class="pb t3">
                        <button class="btnInfo listBtn" data-id="${rueda.id_rl}">
                            <img src="img/info.svg" alt="reporte">
                        </button>
                    </td>
                </tr>
            `;
        });        
        html += `
                </tbody>
            </table>
        `;
        cont.innerHTML = html + datalistHTML;

        document.querySelectorAll(".btnInfo").forEach(btn => {
            btn.addEventListener("click", function() {
                loteRuedaInfo(this.dataset.id);
            });
        });

        console.log(data);
        
    } catch (error) {
        cont.innerHTML = "<p>Error cargando ruedas</p>";
        console.error(error);
    }
}