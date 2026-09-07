import { aceitesListView } from "../aceitesListView.js";
import { abrirAlert, abrirEliminar } from "../../components/modal.js";

export async function loteAceiteInfo(id_lote) {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Lote de Aceite...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>LOTE DE ACEITE ${id_lote}°</h2>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", aceitesListView);

    const { asignarAceiteModal } = await import("../new/asignarAceiteModal.js");

    try {
        const res = await fetch(`php/api/get/loteAceiteInfo/route.php?id_lote=${id_lote}`);
        const loteResponse = await res.json();
        if (loteResponse.status === "error") {
            cont.innerHTML = `<p>${loteResponse.message}</p>`;
            return;
        }
        const lote = loteResponse.data;
        const detalles = loteResponse.detalles || [];

        let html = `
            <table id="tbResumenLote">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Marca</th>
                        <th class="th t10">Fecha Compra</th>
                        <th class="th t10">Precio Total</th>
                        <th class="th t8">Cantidad</th>
                        <th class="th t8">Stock</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb pm t5">${lote.id_al}</td>
                        <td class="pb pm t10">${lote.marcas || "-"}</td>
                        <td class="pb pm t10">${lote.fecha_compra}</td>
                        <td class="pb pm t10">${lote.precio_total} Bs.</td>
                        <td class="pb pm t8">${lote.cantidad}</td>
                        <td class="pb pm t8">${lote.stock_total}</td>
                        <td class="pb t3">
                            <button class="btnInfo listBtn btnEliminarLote" data-id="${lote.id_al}">
                                <img src="img/trash.svg" alt="Eliminar">
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        html += `
            <hr class="loteSeparador">
            <h3 class="loteTitulo">Detalle de Lote</h3>
            <table id="tbDetalleAceite">
                <thead>
                    <tr>
                        <th class="thl t10">Marca</th>
                        <th class="th t8">Unidad</th>
                        <th class="th t8">Precio Ingresado</th>
                        <th class="th t8">Stock</th>
                        <th class="th t8">Asignado</th>
                        <th class="th t8">Disponible</th>
                        <th class="th t8">Estado</th>
                        <th class="thr t5">Asignar</th>
                    </tr>
                </thead>
                <tbody>
        `;

        detalles.forEach(rd => {
            html += `
                <tr data-id_ad="${rd.id_ad}">
                    <td class="pb t10">${rd.nombre_marca_aceite}</td>
                    <td class="pb pm t8">${rd.unidad_aceite}</td>
                    <td class="pb pm t8">${rd.precio_ingresado} Bs.</td>
                    <td class="pb pm t8">${rd.stock}</td>
                    <td class="pb pm t8">${rd.asignado}</td>
                    <td class="pb pm t8">${rd.disponible}</td>
                    <td class="pb pm t8">${rd.estado}</td>
                    <td class="pb t5">
                        <button class="btnAsignar listBtn" data-id="${rd.id_ad}" data-unidad="${rd.unidad_aceite}" data-conversion="${rd.conversion}" data-disponible="${rd.disponible}">
                            Asignar
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

        document.querySelector(".btnEliminarLote").addEventListener("click", function () {
            const id = this.dataset.id;
            const mensaje = `Esta seguro que quiere eliminar este ${id} de Lote de Aceite?`;
            abrirEliminar({
                titulo: "Eliminar Lote de Aceite",
                mensaje,
                botonEliminar: "ELIMINAR",
                onConfirmar: async () => {
                    const res = await fetch("php/api/store/loteAceiteEliminar/route.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_al: parseInt(id) })
                    });
                    const result = await res.json();
                    if (result.status === "success") {
                        aceitesListView();
                    } else {
                        abrirAlert({ mensaje: "Error: " + result.message });
                    }
                }
            });
        });

        document.querySelectorAll(".btnAsignar").forEach(btn => {
            btn.addEventListener("click", function () {
                const id_ad = this.dataset.id;
                const unidad = this.dataset.unidad;
                const conversion = parseFloat(this.dataset.conversion);
                const disponible = parseFloat(this.dataset.disponible);
                asignarAceiteModal({ id_ad, unidad, conversion, disponible, onSuccess: () => loteAceiteInfo(id_lote) });
            });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando Lote de Aceite</p>";
        console.error(error);
    }
}
