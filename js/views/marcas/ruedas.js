import { ruedasListView } from "../list/ruedas.js";
import { newMarcaRuedaView } from "../new/marcaRueda.js";

export async function marcasRuedasView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Marcas de Ruedas...</p>`;
    title.innerHTML = ``;
    
    let titleHtml = `
        <h2>MARCAS DE RUEDAS</h2>
        <div class="btnsTitle">
        <button id="newMarcaRuedaBtn"><img src="img/newMarca.svg" alt="Marcas"></button>
        <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("newMarcaRuedaBtn").addEventListener("click", newMarcaRuedaView);
    document.getElementById("backBtn").addEventListener("click", ruedasListView);
    
    try {

        const res = await fetch("php/views/marcas/marcasRuedas.php");
        const data = await res.json();
        let html = `
            <table id="tbFlotas">
                <thead>
                    <tr>
                        <th class="thl t10">Nombre</th>
                        <th class="t10">Modelo</th>
                        <th class="t5">Diametro</th>
                        <th class="t5">Ancho</th>
                        <th class="t5">Perfil</th>
                        <th class="t8">Precio</th>
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
                    <td class="pb t10">${marcRueda.marca_rueda}</td>
                    <td class="pb pm t10">${marcRueda.modelo}</td>
                    <td class="pb pm t5">${marcRueda.diametro}</td>
                    <td class="pb pm t5">${marcRueda.ancho}</td>
                    <td class="pb pm t5">${marcRueda.perfil}</td>
                    <td class="pb pm t8">${marcRueda.precio} Bs.</td>
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