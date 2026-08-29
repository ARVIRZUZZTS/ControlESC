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
                        <th class="t10">Ubicacion</th>
                        <th class="t5">Viajes</th>
                        <th class="thr t3">Info.</th>
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
                    <td class="pb pm t10">${flota.ubicacion}</td>
                    <td class="pb pm t5">${flota.viajes}</td>
                    <td class="pb t3"><button class="btnInfo listBtn" data-id="${flota.placa}" alt="reporte"><img src="img/info.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        document.querySelectorAll("#tbFlotas .btnInfo").forEach(btn => {
            btn.addEventListener("click", function() {
                flota(this.dataset.id);
            });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando flotas</p>";
        console.error(error);
    }

}