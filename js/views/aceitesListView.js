import { marcasAceitesView } from "./marcas/marcasAceitesView.js";
import { newAceiteView } from "./new/newAceiteView.js";
import { loteAceiteInfo } from "./lotes/loteAceiteInfo.js";

export async function aceitesListView() {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando aceite...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <h2>LOTES DE ACEITE</h2>
        <div class="btnsTitle">
            <button id="marcaAceiteBtn"><img src="img/marcas.svg" alt="Marcas"></button>
            <button id="newAceiteBtn"><img src="img/newAceite.svg" alt="Nuevo Aceite"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("marcaAceiteBtn").addEventListener("click", marcasAceitesView);
    document.getElementById("newAceiteBtn").addEventListener("click", newAceiteView);

    try {
        const res = await fetch("php/views/aceites.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbAceites">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Marca</th>
                        <th class="th t10">Fecha Compra</th>
                        <th class="th t10">Precio Total Bs.</th>
                        <th class="th t8">Cantidad</th>
                        <th class="th t8">Stock</th>
                        <th class="thr t3">Info.</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(aceite => {
            html += `
                <tr data-id_lote="${aceite.id_al}">
                    <td class="pb t5">${aceite.id_al}</td>
                    <td class="pb pm t10">${aceite.marcas || "-"}</td>
                    <td class="pb pm t10">${aceite.fecha_compra}</td>
                    <td class="pb pm t10">${aceite.precio_total}</td>
                    <td class="pb pm t8">${aceite.cantidad}</td>
                    <td class="pb pm t8">${aceite.stock_total}</td>
                    <td class="pb t3">
                        <button class="btnInfo listBtn" data-id="${aceite.id_al}">
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

        cont.innerHTML = html;

        document.querySelectorAll(".btnInfo").forEach(btn => {
            btn.addEventListener("click", function () {
                loteAceiteInfo(this.dataset.id);
            });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando aceite</p>";
        console.error(error);
    }
}
