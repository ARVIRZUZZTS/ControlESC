import { marcasAceitesView } from "./marcas/marcasAceitesView.js";
import { newAceiteView } from "./new/newAceiteView.js";

export async function aceitesListView() {
    
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando aceite...</p>`;
    title.innerHTML = ``;

    const placasRes = await fetch("php/api/get/placasList/route.php");
    const placasResponse = await placasRes.json();
    const placas = placasResponse.data || placasResponse;
    const searchOpt = placas.map(p => `<option value="${p.placa}"></option>`).join("");
    const datalistHTMLSearch  =   `<datalist id="placasListSearch">${searchOpt}</datalist>`;

    let titleHtml = `
        <h2>LOTES DE ACEITE</h2>
        <div class="btnsTitle">
            <input class="tPlaca" 
                type="text" 
                list="placasListSearch"
                maxlength="10"
                autocomplete="off"
                placeholder="Por Placa">
            <select id="filtroRuedas">
                <option value="todas">Todas</option>
                <option value="activas">Activas</option>
                <option value="almacen">Almacen</option>
                <option value="baja">Baja</option>
                <option value="reciente">Reciente</option>
                <option value="antiguo">Antiguo</option>
            </select>
            <button id="marcaAceiteBtn"><img src="img/marcas.svg" alt="Marcas"></button>
            <button id="newAceiteBtn"><img src="img/newAceite.svg" alt="Nuevo Aceite"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("marcaAceiteBtn").addEventListener("click", marcasAceitesView);
    document.getElementById("newAceiteBtn").addEventListener("click", newAceiteView);

    try {

       // const res = await fetch("php/views/ruedasView.php");
       // const data = await res.json();
//
       // const options = placas.map(p => `<option value="${p.placa}"></option>`).join("");
       // const almacen = `<option value="Almacen"></option><option value="Baja"></option>`;
       // const datalistHTML  =   `<datalist id="placasList">
       //                             ${almacen}
       //                             ${options}
       //                         </datalist>`;
//
       // let html = `
       //     <table id="tbRuedas">
       //         <thead>
       //             <tr>
       //                 <th class="t10">Placa</th>
       //                 <th class="t10">Codigo</th>
       //                 <th class="t10">Marca</th>
       //                 <th class="t10">Diam/Esp/Grs</th>
       //                 <th class="t10">Adquirido</th>
       //                 <th class="t5">Viajes</th>
       //                 <th class="t10">Precio Bs</th>
       //             </tr>
       //         </thead>
       //         <tbody>
       // `;
       // data.forEach(rueda => {
       //     let fillRueda = ``;
       //     if (rueda.estado == 0) {
       //         fillRueda = `placeholder="${rueda.placa}"`;
       //     } else {
       //         fillRueda = `placeholder="Baja" disabled`;
       //     }
//
       //     html += `
       //         <tr data-id_rueda="${rueda.id_rueda}">
       //             <td class="t10"><input class="tPlaca" 
       //                                 type="text" 
       //                                 list="placasList"
       //                                 maxlength="10"
       //                                 autocomplete="off"
       //                                 ${fillRueda}>
       //             </td>
       //             <td class="t10">${rueda.codigo}</td>
       //             <td class="t10">${rueda.marca_rueda}</td>
       //             <td class="t10">${rueda.diametro}/${rueda.espesor}/${rueda.grosor}</td>
       //             <td class="t10">${rueda.fecha_compra}</td>
       //             <td class="t5">${rueda.viajes}/${rueda.media_viajes}</td>
       //             <td class="t10">${rueda.precio}</td>
       //         </tr>
       //     `;
       // });
//
       // html += `
       //         </tbody>
       //     </table>
       // `;
       // cont.innerHTML = html + datalistHTML + datalistHTMLSearch;
       // console.log(data);
       // document.querySelectorAll(".tPlaca").forEach(input => {
       //     input.addEventListener("change", function () {
       //         const fila = this.closest("tr");
       //         const id_rueda = fila.dataset.id_rueda;
       //         const placa = this.value.trim();
       //     
       //         guardarPlacaRueda(id_rueda, placa);            
       //     });
       // 
       // });
    } catch (error) {
        cont.innerHTML = "<p>Error cargando ruedas</p>";
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