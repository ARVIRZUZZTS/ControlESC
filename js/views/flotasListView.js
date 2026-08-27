import { flota } from "./entitie/flota.js";

export async function flotasListView() {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <h2>FLOTAS</h2>
        <button id="newFlotaBtn"><img src="img/newFlota.svg" alt="reporte"></button>
    `;
    title.innerHTML = titleHtml;
    try {

        const res = await fetch("php/views/flotas.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbFlotas">
                <thead>
                    <tr>
                        <th class="thl t8">Placa</th>
                        <th class="t10">Propietario</th>
                        <th class="t10">Chofer 1</th>
                        <th class="t10">Chofer 2</th>
                        <th class="t5">Estado</th>
                        <th class="t5">Viajes</th>
                        <th class="t3">Info.</th>
                        <th class="t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(flota => {
            html += `
                <tr>
                    <td class="pb t8">${flota.placa}</td>
                    <td class="pb pm t10">${flota.propietario}</td>
                    <td class="pb pm t10">${flota.chofer1}</td>
                    <td class="pb pm t10">${flota.chofer2}</td>
                    <td class="pb pm t5">${flota.estado}</td>
                    <td class="pb pm t5">${flota.viajes}</td>
                    <td class="pb pm t3"><button class="btnInfo listBtn" data-id="${flota.placa}" onclick="flota('${flota.placa}')"><img src="img/info.svg" alt="reporte"></button></td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${flota.placa}"><img src="img/edit.svg" alt="reporte"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${flota.placa}"><img src="img/trash.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

    } catch (error) {
        cont.innerHTML = "<p>Error cargando flotas</p>";
        console.error(error);
    }

}