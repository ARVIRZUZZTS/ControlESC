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
                <div class="modal-fila modal-fila-aviso">
                    <label>Detalles:</label>
                    <span class="avisoDetalles">Elija las marcas y su stock. Una fila por marca.</span>
                </div>
                <div id="loteAceiteDetalles"></div>
                <div class="modal-fila">
                    <button type="button" id="addDetalleAceite">+ Agregar Marca</button>
                </div>
                <div class="modal-fila">
                    <label>Precio Estimado (Bs.):</label>
                    <span id="precioEstimadoText">0.00</span>
                </div>
                <div class="modal-fila">
                    <label>Precio Real (Bs.):</label>
                    <input type="number" id="precioTotalAceite" name="precio_total" step="0.01" placeholder="0.00">
                </div>
            </form>
        `;

        const resultado = abrirModal({
            titulo: "NUEVO LOTE DE ACEITE",
            contenidoHTML: contenidoHTML,
            generativo: true,
            onSubmit: () => {
                const form = resultado.overlay.querySelector("#formNuevoLoteAceite");
                if (form) form.requestSubmit();
            }
        });
        cerrar = resultado.cerrar;

        const overlay = resultado.overlay;
        const contDetalles = overlay.querySelector("#loteAceiteDetalles");
        const inpEstimado = overlay.querySelector("#precioEstimadoText");
        const inpPrecioTot = overlay.querySelector("#precioTotalAceite");

        let filas = [];
        let realTocado = false;
        let realOverride = 0;

        function marcaPrecio(select) {
            const opt = select.selectedOptions[0];
            return opt && opt.dataset.precio ? parseFloat(opt.dataset.precio) : 0;
        }

        function cantidadFila(f) {
            return parseFloat(f.stock.value) || 0;
        }

        function valorFila(f) {
            const typed = parseFloat(f.precio.value) || 0;
            if (typed > 0) return typed;
            return cantidadFila(f) * marcaPrecio(f.marca);
        }

        function actualizarEstimado() {
            const est = filas.reduce((s, f) => s + cantidadFila(f) * marcaPrecio(f.marca), 0);
            inpEstimado.textContent = est.toFixed(2);
        }

        function actualizarTotal() {
            actualizarEstimado();
            if (realTocado) return;
            const real = filas.reduce((s, f) => s + valorFila(f), 0);
            inpPrecioTot.value = real.toFixed(2);
            inpPrecioTot.placeholder = real.toFixed(2);
        }

        function renumFila() {
            const filasDom = contDetalles.querySelectorAll(".loteGenerativoFila");
            filasDom.forEach((f, i) => {
                const label = f.querySelector(".loteGenerativoHeader label");
                if (label) label.textContent = `Marca ${i + 1}`;
            });
        }

        function quitarFila(fila) {
            fila.remove();
            filas = filas.filter(f => f.fila !== fila);
            renumFila();
            actualizarTotal();
        }

        function agregarFila() {
            const fila = document.createElement("div");
            fila.className = "loteGenerativoFila";
            const esPrimera = filas.length === 0;
            fila.innerHTML = `
                <div class="loteGenerativoHeader">
                    ${esPrimera ? "" : `<button type="button" class="btnQuitarMarca btnQuitarFila">×</button>`}
                    <label>Marca ${filas.length + 1}:</label>
                </div>
                <div class="loteGenerativoCol">
                    <select name="marca_al[]">
                        <option value="" data-precio="" data-unidad="">-- Elija Marca --</option>
                        ${optMarcas}
                    </select>
                    <div class="lotegenerativoMarca">
                        <input type="number" step="0.001" name="stock_al[]" placeholder="Cantidad" min="0">
                        <input type="number" step="0.01" name="precio_al[]" placeholder="0.00" min="0">
                    </div>
                </div>
            `;
            contDetalles.appendChild(fila);

            const select = fila.querySelector("select");
            const stock = fila.querySelector('input[name="stock_al[]"]');
            const precio = fila.querySelector('input[name="precio_al[]"]');

            filas.push({ fila, marca: select, stock, precio });

            function placeholderFila() {
                const c = cantidadFila(objeto);
                const pMar = marcaPrecio(select);
                const ph = (c > 0 && pMar > 0) ? (c * pMar) : (pMar > 0 ? pMar : 0);
                precio.placeholder = ph.toFixed(2);
            }
            const objeto = { fila, marca: select, stock, precio };
            placeholderFila();

            stock.addEventListener("keydown", decimalFilter);
            precio.addEventListener("keydown", decimalFilter);
            stock.addEventListener("input", () => {
                placeholderFila();
                actualizarTotal();
            });
            precio.addEventListener("input", actualizarTotal);

            select.addEventListener("change", () => {
                placeholderFila();
                if (precio.value === "" || parseFloat(precio.value) === 0) {
                    precio.value = "";
                }
                actualizarTotal();
            });

            if (!esPrimera) {
                fila.querySelector(".btnQuitarFila").addEventListener("click", () => quitarFila(fila));
            }
        }

        inpPrecioTot.addEventListener("input", () => {
            realTocado = inpPrecioTot.value.trim() !== "";
            realOverride = parseFloat(inpPrecioTot.value) || 0;
        });

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
                precio_ingresado: valorFila(f)
            }));

            const totalReal = realTocado ? realOverride : detalles.reduce((s, d) => s + d.precio_ingresado, 0);

            const payload = {
                fecha_compra: overlay.querySelector('input[name="fecha_compra"]').value,
                precio_total: totalReal,
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