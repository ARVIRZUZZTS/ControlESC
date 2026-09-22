import { personal } from "./entitie/personal.js";
import { newPersonalView } from "./new/newPersonalView.js";

function moneda(valor) {
    const n = parseFloat(valor);
    if (isNaN(n)) return "0.00";
    return n.toFixed(2);
}

export async function personalListView() {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <h2>PERSONAL</h2>
        <button id="newPersonalBtn"><img src="img/newPersonal.svg" alt="nuevo"></button>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("newPersonalBtn").addEventListener("click", newPersonalView);

    try {

        const res = await fetch("php/views/personal.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbPersonal">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="t10">Personal</th>
                        <th class="t8">Tipo</th>
                        <th class="t5">Mensual Bs.</th>
                        <th class="t5">Total Pagado Bs.</th>
                        <th class="t5">Fecha Contrato</th>
                        <th class="t5">Estado</th>
                        <th class="thr t3">Info.</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(per => {
            html += `
                <tr>
                    <td class="pb t5">${per.id_personal}</td>
                    <td class="pb pm t10">${per.nombre_apellido}</td>
                    <td class="pb pm t8">${per.tipo_personal}</td>
                    <td class="pb pm t5">${moneda(per.mensual)}</td>
                    <td class="pb pm t5">${moneda(per.total)}</td>
                    <td class="pb pm t5">${per.fecha_contrato || "-"}</td>
                    <td class="pb pm t5">${per.estado || "Activo"}</td>
                    <td class="pb t3"><button class="btnInfo listBtn" data-id="${per.id_personal}" alt="reporte"><img src="img/info.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        document.querySelectorAll("#tbPersonal .btnInfo").forEach(btn => {
            btn.addEventListener("click", function() {
                personal(this.dataset.id);
            });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando personal</p>";
        console.error(error);
    }

}