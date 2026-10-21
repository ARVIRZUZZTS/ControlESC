import { personalListView } from "../personalListView.js";
import { editarPersonal } from "../new/editarPersonalView.js";
import { fechaISOToDMY } from "../../utils.js";
import { abrirAlert } from "../../components/modal.js";

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

        const estado = dt.estado || "activo";
        const esActivo = estado === "activo";

        title.innerHTML = ``;
        let titleHtml = `
            <div class="backTitle">
                <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
                <h2>DETALLE DEL PERSONAL</h2>
            </div>
            <button id="btnEstadoDetalle" data-id="${dt.id_personal}" data-estado="${estado}">${esActivo ? "Dar Baja" : "Activar"}</button>
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
                        <th class="t5">Sucursal</th>
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
                        <td class="pb pm t5">${fechaISOToDMY(dt.fecha_contrato) || "-"}</td>
                        <td class="pb pm t5">${dt.nombre_sucursal || "-"}</td>
                        <td class="pb pm t5">${estado}</td>
                        <td class="pb t3"><button class="btnEditar listBtn" data-id="${dt.id_personal}"><img src="img/edit.svg" alt="editar"></button></td>
                    </tr>
                </tbody>
            </table>
        `;

        if (!esActivo) {
            html += `
                <hr>
                <h3 class="loteTitulo">Personal Dado de Baja</h3>
                <table id="tbPersonalBaja">
                    <thead>
                        <tr>
                            <th class="thl t5">ID</th>
                            <th class="t10">Personal</th>
                            <th class="t8">Tipo</th>
                            <th class="t5">Mensual Bs.</th>
                            <th class="t5">Total Pagado Bs.</th>
                            <th class="t5">Fecha Contrato</th>
                            <th class="t5">Sucursal</th>
                            <th class="thr t5">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="pb t5">${dt.id_personal}</td>
                            <td class="pb pm t10">${dt.nombre_apellido}</td>
                            <td class="pb pm t8">${dt.tipo_personal}</td>
                            <td class="pb pm t5">${Number(dt.mensual).toFixed(2)}</td>
                            <td class="pb pm t5">${Number(dt.total).toFixed(2)}</td>
                            <td class="pb pm t5">${fechaISOToDMY(dt.fecha_contrato) || "-"}</td>
                            <td class="pb pm t5">${dt.nombre_sucursal || "-"}</td>
                            <td class="pb pm t5">${estado}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        html += `
            <hr>
            <div id="seccionGastosEmpleado"></div>
        `;
        cont.innerHTML = html;

        document.querySelector("#tbPersonalEnt .btnEditar").addEventListener("click", function() {
            editarPersonal(this.dataset.id);
        });

        document.querySelector("#btnEstadoDetalle").addEventListener("click", async function() {
            const id = this.dataset.id;
            const estadoActual = this.dataset.estado;
            const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

            try {
                const res = await fetch("php/api/store/personalEstado/route.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_personal: parseInt(id), estado: nuevoEstado })
                });
                const result = await res.json();
                if (result.status === "success") {
                    personal(id);
                } else {
                    abrirAlert({ mensaje: "Error: " + result.message });
                }
            } catch (error) {
                abrirAlert({ mensaje: "Error al actualizar estado." });
            }
        });

    } catch (error) {
        title.innerHTML = ``;
        cont.innerHTML = "<p>Error al Cargar Personal</p>";
        console.error(error);
    }
}
