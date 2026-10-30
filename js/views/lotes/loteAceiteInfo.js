import { aceitesListView } from "../aceitesListView.js";
import { abrirAlert, abrirEliminar } from "../../components/modal.js";
import { fechaISOToDMY, flotaGradiente, colorTextoFlota } from "../../utils.js";

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
                        <th class="t10">Marca</th>
                        <th class="t10">Fecha Compra</th>
                        <th class="t10">Precio Total Bs.</th>
                        <th class="t8">Unidades</th>
                        <th class="t8">Cantidad</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb pm t5">${lote.id_al}</td>
                        <td class="pb pm t10">${lote.marcas || "-"}</td>
                        <td class="pb pm t10">${fechaISOToDMY(lote.fecha_compra)}</td>
                        <td class="pb pm t10">${resumenPrecioHtml(lote.precio_estimado || lote.precio_total, lote.precio_real || lote.precio_total, lote.estado_precio || "Mantuvo")}</td>
                        <td class="pb pm t8">${lote.cantidad}</td>
                        <td class="pb pm t8">${Number(lote.cantidad_lt || 0).toFixed(3)}</td>
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
            <div class="asignarWrap">
                <h2 class="loteTitulo">Detalle de Lote</h2>
                <button class="btnAsignarGlobal listBtn" id="btnAsignarGlobal">Asignar Aceite a Flota</button>
            </div>
            <table id="tbDetalleAceite">
                <thead>
                    <tr>
                        <th class="thl t10">Marca</th>
                        <th class="t8">Precio Ingresado Bs.</th>
                        <th class="t8">Cantidad</th>
                        <th class="t8">Asignado</th>
                        <th class="t8">Disponible</th>
                        <th class="t8">Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;

        detalles.forEach(rd => {
            html += `
                <tr data-id_ad="${rd.id_ad}">
                    <td class="pb t10">${rd.nombre_marca_aceite}</td>
                    <td class="pb pm t8 ${detallePrecioClase(parseFloat(rd.precio_ingresado) || 0, (parseFloat(rd.stock) || 0) * (parseFloat(rd.precio) || 0))}">${detallePrecioHtml(rd.precio_ingresado, (parseFloat(rd.stock) || 0) * (parseFloat(rd.precio) || 0))}</td>
                    <td class="pb pm t8">${((parseFloat(rd.stock) || 0) * (parseFloat(rd.cantidad) || 0)).toFixed(3)}</td>
                    <td class="pb pm t8">${(parseFloat(rd.asignado) || 0).toFixed(3)}</td>
                    <td class="pb pm t8">${(parseFloat(rd.disponible) || 0).toFixed(3)}</td>
                    <td class="pb pm t8">${rd.estado}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        if (loteResponse.flotas && loteResponse.flotas.length > 0) {
            html += `
                <hr class="loteSeparador">
                <h3 class="loteTitulo">Aceite por Flota</h3>
                <table id="tbAceiteFlota">
                    <thead>
                        <tr>
                            <th class="thl t10">Placa</th>
                            <th class="t8">Cantidad (Lt.)</th>
                            <th class="t8">Estado</th>
                            <th class="thr t10">Fecha de Uso</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            loteResponse.flotas.forEach(af => {
                const fechaUso = af.fecha_uso && af.fecha_uso !== '0000-00-00' ? fechaISOToDMY(af.fecha_uso) : '-';
                html += `
                    <tr>
                        <td class="pb t10"><span class="placa-badge" style="background:${flotaGradiente(af.color1, af.color2)};color:${colorTextoFlota(af.color1, af.color2, af.color_texto)}">${af.placa}</span></td>
                        <td class="pb pm t8">${(parseFloat(af.cantidad) || 0).toFixed(3)}</td>
                        <td class="pb pm t8">${af.estado}</td>
                        <td class="pb pm t10">${fechaUso}</td>
                    </tr>
                `;
            });
            html += `
                    </tbody>
                </table>
            `;
        }

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

        document.getElementById("btnAsignarGlobal").addEventListener("click", function () {
            const primerDetalle = detalles[0];
            if (!primerDetalle) {
                abrirAlert({ mensaje: "No hay detalles disponibles para asignar." });
                return;
            }
            const id_ad = primerDetalle.id_ad;
            const disponible = parseFloat(primerDetalle.disponible);
            asignarAceiteModal({ id_ad, disponible, onSuccess: () => loteAceiteInfo(id_lote) });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando Lote de Aceite</p>";
        console.error(error);
    }
}
