import { ruedasListView } from "../list/ruedas.js";
import { newMarcaRuedaView } from "../new/marcaRueda.js";

export async function marcasRuedasView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Marcas de Ruedas...</p>`;
    title.innerHTML = ``;
    
    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>MARCAS DE RUEDAS</h2>
        </div>
        <button id="newMarcaRuedaBtn"><img src="img/newMarca.svg" alt="Marcas"></button>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("newMarcaRuedaBtn").addEventListener("click", newMarcaRuedaView);
    document.getElementById("backBtn").addEventListener("click", ruedasListView);
    
    try {

        const res = await fetch("php/views/marcas/marcasRuedas.php");
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
                        <th class="thl t10">Nombre</th>
                        <th class="t8">Precio U. Bs.</th>
                        <th class="t10">Medida</th>
                        <th class="t5">Serie</th>
                        <th class="t5">Trilla</th>
                        <th class="t5">Aro</th>
                        <th class="t5">Viajes</th>
                        <th class="t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(marcRueda => {
            html += `
                <tr>
                    <td class="pb t10">${marcRueda.nombre_marca_rueda}</td>
                    <td class="pb pm t8">${marcRueda.precio_unitario}</td>
                    <td class="pb pm t10">${marcRueda.medida}</td>
                    <td class="pb pm t5">${marcRueda.serie}</td>
                    <td class="pb pm t5">${marcRueda.trilla}</td>
                    <td class="pb pm t5">${marcRueda.aro}</td>
                    <td class="pb pm t5">${marcRueda.media_viajes}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${marcRueda.id_marca_rueda}"><img src="img/edit.svg" alt="reporte"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${marcRueda.id_marca_rueda}"><img src="img/trash.svg" alt="reporte"></button></td>
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