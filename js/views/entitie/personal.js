import { personalListView } from "../personalListView.js";
import { editarPersonal } from "../new/editarPersonalView.js";

export async function personal(id_personal) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");

    try {
        const res = await fetch(`php/api/get/personalEnt/route.php?id_personal=${encodeURIComponent(id_personal)}`);
        const data = await res.json();

        if (data.status === "error") {
            title.innerHTML = ``;
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        const dt = data.data;

        title.innerHTML = ``;
        let titleHtml = `
            <div class="backTitle">
                <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
                <h2>DETALLE DEL PERSONAL</h2>
            </div>
        `;
        title.innerHTML = titleHtml;
        document.getElementById("backBtn").addEventListener("click", personalListView);

        let html = `
            <table id="tbPersonalEnt">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="t10">Personal</th>
                        <th class="t8">Tipo</th>
                        <th class="t5">Mensual Bs.</th>
                        <th class="t5">Total Pagado Bs.</th>
                        <th class="t5">Fecha Contrato</th>
                        <th class="t5">Estado</th>
                        <th class="thr t3">Editar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb t5">${dt.id_personal}</td>
                        <td class="pb pm t10">${dt.nombre_apellido}</td>
                        <td class="pb pm t8">${dt.tipo_personal}</td>
                        <td class="pb pm t5">${Number(dt.mensual).toFixed(2)}</td>
                        <td class="pb pm t5">${Number(dt.total).toFixed(2)}</td>
                        <td class="pb pm t5">${dt.fecha_contrato || "-"}</td>
                        <td class="pb pm t5">${dt.estado || "Activo"}</td>
                        <td class="pb t3"><button class="btnEditar listBtn" data-id="${dt.id_personal}"><img src="img/edit.svg" alt="editar"></button></td>
                    </tr>
                </tbody>
            </table>
            <hr>
            <div id="seccionGastosEmpleado"></div>
        `;
        cont.innerHTML = html;

        document.querySelector("#tbPersonalEnt .btnEditar").addEventListener("click", function() {
            editarPersonal(this.dataset.id);
        });

    } catch (error) {
        title.innerHTML = ``;
        cont.innerHTML = "<p>Error al Cargar Personal</p>";
        console.error(error);
    }
}