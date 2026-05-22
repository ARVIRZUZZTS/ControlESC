import { aceitesListView } from "../aceitesListView.js";
import { newMarcaAceiteView } from "../new/newMarcaAceiteView.js";

export async function marcasAceitesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Marcas de Aceites...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <h2>MARCAS DE ACEITES</h2>
        <div class="btnsTitle">
        <button id="marcaAceiteBtn"><img src="img/newMarca.svg" alt="Marcas"></button>
        <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("marcaAceiteBtn").addEventListener("click", newMarcaAceiteView);
    document.getElementById("backBtn").addEventListener("click", aceitesListView);
    
    try {

        const res = await fetch("php/views/marcas/marcasAceites.php");
        const data = await res.json();
        let html = `
            <table id="tbMarcasAceite">
                <thead>
                    <tr>
                        <th class="thl t10">Nombre</th>
                        <th class="t10">Cantidad</th>
                        <th class="t10">Total Lt.</th>
                        <th class="t8">Precio</th>
                        <th class="t5">Viajes</th>
                        <th class="t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(marcAceite => {
            
            let cantLt = marcAceite.cantidad * marcAceite.conversion;
            let cantAbrev = marcAceite.cantidad * 1;
            html += `
                <tr>
                    <td class="pb t10">${marcAceite.marca_aceite}</td>
                    <td class="pb pm t10">${cantAbrev} ${marcAceite.abrev}.</td>
                    <td class="pb pm t10">${cantLt} Lt.</td>
                    <td class="pb pm t8">${marcAceite.precio} Bs.</td>
                    <td class="pb pm t10">${marcAceite.media_viajes}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${marcAceite.id_marca_aceite}"><img src="img/edit.svg" alt="reporte"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${marcAceite.id_marca_aceite}"><img src="img/trash.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

    } catch (error) {
        cont.innerHTML = "<p>Error cargando Marcas de Aceites</p>";
        console.error(error);
    }
}