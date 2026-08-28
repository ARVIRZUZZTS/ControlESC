import { flotasListView } from "../flotasListView.js";

export async function flota(placa) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>DETALLE de FLOTA ${placa}</h2>
        </div>
    `;
    title.innerHTML = titleHtml;
    document.getElementById("backBtn").addEventListener("click", flotasListView);

    try {
        const res = await fetch(`php/api/get/flotaEnt/route.php?placa=${encodeURIComponent(placa)}`);
        const data = await res.json();
        const dt = data.data;
        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbFlotaEnt">
                <thead>
                    <tr>
                        <th class="thl t8">Placa</th>
                        <th class="t10">Propietario</th>
                        <th class="t10">Chofer 1</th>
                        <th class="t10">Chofer 2</th>
                        <th class="t5">Estado</th>
                        <th class="t5">Viajes</th>
                        <th class="thr t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb t8">${dt.placa}</td>
                        <td class="pb pm t10">${dt.propietario}</td>
                        <td class="pb pm t10">${dt.chofer1}</td>
                        <td class="pb pm t10">${dt.chofer2}</td>
                        <td class="pb pm t5">${dt.estado}</td>
                        <td class="pb pm t5">${dt.viajes}</td>
                        <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${flota.placa}"><img src="img/edit.svg" alt="reporte"></button></td>
                        <td class="pb t3"><button class="btnEliminar listBtn" data-id="${flota.placa}"><img src="img/trash.svg" alt="reporte"></button></td>                        
                    </tr>
                </tbody>
            </table>
            <hr>
            <div class="highlight">
                <p>Aceite:</p>
                <label id="estadoAceite">${dt.aceite}</label>
            </div>
        `;
        cont.innerHTML = html;

    } catch (error) {
        cont.innerHTML = "<p>Error al Cargar Flotas</p>";
        console.error(error);
    }
}