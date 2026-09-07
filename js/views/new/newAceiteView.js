import { aceitesListView } from "../aceitesListView.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";

import { strFecha } from "../../utils.js";
import { decimalFilter } from "../../utils.js";
import { hardFilter } from "../../utils.js";

export async function newAceiteView() {

    let cerrar = () => {};

    try {
        const fechaDef = strFecha();

        const marcaRes = await fetch("php/api/get/marcaAceite/route.php");
        const marcasResponse = await marcaRes.json();
        const marcas = marcasResponse.data || marcasResponse;

        const optMarcas = marcas.map(m =>
            `<option value="${m.id_marca_aceite}" data-precio="${m.precio}" data-unidad="${m.unidad_aceite}">${m.nombre_marca_aceite} (${m.unidad_aceite})</option>`
        ).join("");

        const contenidoHTML = `
            <form id="formNuevoLoteAceite">
                <div class="modal-fila">
                    <label>Fecha Compra:</label>
                    <input type="date" name="fecha_compra" value="${fechaDef}" required>
                </div>
                <div class="modal-fila">
                    <label>Detalles:</label>
                    <span>Elija las marcas y su stock. Una fila por marca.</span>
                </div>
                <div id="loteAceiteDetalles"></div>
                <div class="modal-fila">
                    <button type="button" id="addDetalleAceite">+ Agregar Marca</button>
                </div>
                <div class="modal-fila">
                    <label>Precio Total (Bs.):</label>
                    <input type="number" id="precioTotalAceite" name="precio_total" step="0.01" placeholder="0.00" readonly>
                </div>
            </form>
        `;

        const resultado = abrirModal({
            titulo: "NUEVO LOTE DE ACEITE",
            contenidoHTML: contenidoHTML,
            onSubmit: () => {
                const form = resultado.overlay.querySelector("#formNuevoLoteAceite");
                if (form) form.requestSubmit();
            }
        });
        cerrar = resultado.cerrar;

        const overlay = resultado.overlay;
        const contDetalles = overlay.querySelector("#loteAceiteDetalles");
        const inpPrecioTot = overlay.querySelector("#precioTotalAceite");

        let filas = [];

        function actualizarTotal() {
            const total = filas.reduce((s, f) => s + (parseFloat(f.precio.value) || 0), 0);
            inpPrecioTot.value = total.toFixed(2);
        }

        function agregarFila() {
            const fila = document.createElement("div");
            fila.className = "modal-fila";
            fila.innerHTML = `
                <label>Marca ${filas.length + 1}:</label>
                <div class="lote-marca-precio">
                    <select name="marca_al[]">
                        <option value="" data-precio="" data-unidad="">-- Elija Marca --</option>
                        ${optMarcas}
                    </select>
                    <input type="number" step="0.001" name="stock_al[]" placeholder="stock" min="0">
                    <input type="number" step="0.01" name="precio_al[]" placeholder="0.00" min="0">
                    <span class="asUnidad"></span>
                </div>
            `;
            contDetalles.appendChild(fila);

            const select = fila.querySelector("select");
            const stock = fila.querySelector('input[name="stock_al[]"]');
            const precio = fila.querySelector('input[name="precio_al[]"]');
            const unidadSpan = fila.querySelector(".asUnidad");

            filas.push({ marca: select, stock, precio, unidadSpan });

            stock.addEventListener("keydown", decimalFilter);
            precio.addEventListener("keydown", decimalFilter);
            stock.addEventListener("input", actualizarTotal);
            precio.addEventListener("input", actualizarTotal);

            select.addEventListener("change", () => {
                const opt = select.selectedOptions[0];
                const pMar = opt.dataset.precio ? parseFloat(opt.dataset.precio) : 0;
                const unidad = opt.dataset.unidad || "";
                unidadSpan.textContent = unidad;
                precio.placeholder = pMar > 0 ? pMar.toFixed(2) : "0.00";
                if (precio.value === "" || parseFloat(precio.value) === 0) {
                    precio.value = "";
                }
                actualizarTotal();
            });
        }

        overlay.querySelector("#addDetalleAceite").addEventListener("click", agregarFila);

        agregarFila();

        const form = overlay.querySelector("#formNuevoLoteAceite");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (filas.length < 1) {
                abrirAlert({ mensaje: "Agrega al menos una marca." });
                return;
            }
            const sinMarca = filas.filter(f => !f.marca.value);
            if (sinMarca.length > 0) {
                abrirAlert({ mensaje: "Debes elegir la marca de cada detalle." });
                return;
            }
            const sinStock = filas.filter(f => parseFloat(f.stock.value) <= 0);
            if (sinStock.length > 0) {
                abrirAlert({ mensaje: "Debes colocar el stock de cada detalle." });
                return;
            }

            const detalles = filas.map(f => ({
                id_marca_aceite: parseInt(f.marca.value),
                stock: parseFloat(f.stock.value),
                precio_ingresado: parseFloat(f.precio.value) || 0
            }));

            const payload = {
                fecha_compra: overlay.querySelector('input[name="fecha_compra"]').value,
                detalles
            };

            const res = await fetch("php/api/store/loteAceite/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.status === "success") {
                cerrar();
                aceitesListView();
            } else {
                abrirAlert({ mensaje: "Error al guardar: " + result.message });
            }
        });

    } catch (error) {
        console.error(error);
    }
}