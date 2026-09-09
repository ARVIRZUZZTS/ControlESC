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

        function resumenPrecioHtml(estimado, real, estado) {
            const diff = (parseFloat(real) || 0) - (parseFloat(estimado) || 0);
            if (estado === "Subio") {
                return `<div class="precioEstado precio-subio"><img src="img/up.svg" class="flechaPrecio" alt="Subio"><span class="montoReal">${real}</span><span class="diferenciaPrecio">+${diff.toFixed(2)}</span></div>`;
            }
            if (estado === "Bajo") {
                return `<div class="precioEstado precio-bajo"><img src="img/down.svg" class="flechaPrecio" alt="Bajo"><span class="montoReal">${real}</span><span class="diferenciaPrecio">${diff.toFixed(2)}</span></div>`;
            }
            return `<div class="precioEstado"><span class="montoReal">${real}</span></div>`;
        }

        function detallePrecioClase(real, actual) {
            if (real > actual) return "precio-subio";
            if (real < actual) return "precio-bajo";
            return "";
        }

        function detallePrecioHtml(real, actual) {
            const diff = (parseFloat(real) || 0) - (parseFloat(actual) || 0);
            if (diff > 0) return `${real}<span class="diferenciaPrecio">  +${diff.toFixed(2)}</span>`;
            if (diff < 0) return `${real}<span class="diferenciaPrecio">  ${diff.toFixed(2)}</span>`;
            return `${real}`;
        }

        let html = `
            <table id="tbResumenLote">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Marca</th>
                        <th class="th t10">Fecha Compra</th>
                        <th class="th t10">Precio Total Bs.</th>
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
                        <td class="pb pm t10">${resumenPrecioHtml(lote.precio_estimado || lote.precio_total, lote.precio_real || lote.precio_total, lote.estado_precio || "Mantuvo")}</td>
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
                        <th class="th t8">Precio Ingresado Bs.</th>
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
                    <td class="pb pm t8 ${detallePrecioClase(parseFloat(rd.precio_ingresado) || 0, (parseFloat(rd.stock) || 0) * (parseFloat(rd.precio) || 0))}">${detallePrecioHtml(rd.precio_ingresado, (parseFloat(rd.stock) || 0) * (parseFloat(rd.precio) || 0))}</td>
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
