import { ruedasListView } from "../list/ruedas.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";

import { strFecha } from "../../utils.js";
import { hardFilter } from "../../utils.js";
import { decimalFilter } from "../../utils.js";

export async function newLoteRuedaView() {

    let cerrar = () => {};

    try {
        const fechaDef = strFecha();

        const marca_ruedaRes = await fetch("php/api/get/marcaRueda/route.php");
        const marcasResponse = await marca_ruedaRes.json();
        const marcas_ruedas = marcasResponse.data || marcasResponse;

        const optMarcas = marcas_ruedas.map(m =>
            `<option value="${m.id_marca_rueda}" data-precio="${m.precio_unitario}">${m.nombre_marca_rueda}</option>`
        ).join("");

        const contenidoHTML = `
            <form id="formNuevoLote">
                <div class="modal-fila">
                    <label>Fecha Compra:</label>
                    <input type="date" name="fecha_compra" value="${fechaDef}" required>
                </div>
                <div class="modal-fila">
                    <label>Cantidad:</label>
                    <input type="number" id="cantidad" name="cantidad" placeholder="0" min="1" required
                        oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                </div>
                <div id="loteRuedas"></div>
                <div class="modal-fila">
                    <label>Precio Estimado (Bs.):</label>
                    <span id="precioEstimadoRuedas">0.00</span>
                </div>
                <div class="modal-fila">
                    <label>Precio Real (Bs.):</label>
                    <input type="number" id="precioTotal" name="precio_total" step="0.01" placeholder="0.00">
                </div>
            </form>
        `;

        const resultado = abrirModal({
            titulo: "NUEVO LOTE DE RUEDAS",
            contenidoHTML: contenidoHTML,
            onSubmit: () => {
                const form = resultado.overlay.querySelector("#formNuevoLote");
                if (form) form.requestSubmit();
            }
        });
        cerrar = resultado.cerrar;

        const overlay = resultado.overlay;
        const inpCantidad = overlay.querySelector("#cantidad");
        const contRuedas = overlay.querySelector("#loteRuedas");
        const inpEstimado = overlay.querySelector("#precioEstimadoRuedas");
        const inpPrecioTot = overlay.querySelector("#precioTotal");

        let filas = [];
        let realTocado = false;
        let realOverride = 0;

        if (inpCantidad) inpCantidad.addEventListener("keydown", hardFilter);

        function precioDeMarca(select) {
            const opt = select.selectedOptions[0];
            return opt && opt.dataset.precio ? parseFloat(opt.dataset.precio) : 0;
        }

        function valorFila(fila) {
            const p = parseFloat(fila.precio.value) || 0;
            if (p > 0) return p;
            return precioDeMarca(fila.marca);
        }

        function actualizarEstimado() {
            const est = filas.reduce((sum, f) => sum + precioDeMarca(f.marca), 0);
            inpEstimado.textContent = est.toFixed(2);
        }

        function calcularTotal() {
            actualizarEstimado();
            if (realTocado) return;
            const total = filas.reduce((sum, f) => sum + valorFila(f), 0);
            inpPrecioTot.value = total.toFixed(2);
            inpPrecioTot.placeholder = total.toFixed(2);
        }

        function renumFilas() {
            const filasDom = contRuedas.querySelectorAll(".modal-fila");
            filasDom.forEach((f, i) => {
                const label = f.querySelector("label");
                if (label) label.textContent = `Rueda ${i + 1}:`;
            });
        }

        function quitarFila(fila, objeto) {
            fila.remove();
            filas = filas.filter(f => f !== objeto);
            inpCantidad.value = filas.length;
            renumFilas();
            calcularTotal();
        }

        function generarFilas(n) {
            contRuedas.innerHTML = "";
            filas = [];
            for (let i = 0; i < n; i++) {
                const fila = document.createElement("div");
                fila.className = "modal-fila";
                fila.innerHTML = `
                    <div class="loteGenerativoHeader">
                        ${i === 0 ? "" : `<button type="button" class="btnQuitarMarca btnQuitarFila">×</button>`}
                        <label>Rueda ${i + 1}:</label>
                    </div>
                    <div class="lote-marca-precio">
                        <select name="marca_rd[]">
                            <option value="" data-precio="">-- Elija Marca --</option>
                            ${optMarcas}
                        </select>
                        <input type="number" step="0.01" name="precio_rd[]" placeholder="0.00"
                            oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                    </div>
                `;
                contRuedas.appendChild(fila);

                const select = fila.querySelector("select");
                const precio = fila.querySelector("input");
                const objeto = { fila, marca: select, precio };
                filas.push(objeto);

                if (precio) precio.addEventListener("keydown", decimalFilter);
                precio.addEventListener("input", calcularTotal);
                select.addEventListener("change", () => {
                    const pMar = precioDeMarca(select);
                    precio.placeholder = pMar > 0 ? pMar.toFixed(2) : "0.00";
                    if (precio.value === "" || parseFloat(precio.value) === 0) {
                        precio.value = "";
                    }
                    calcularTotal();
                });
                if (i > 0) {
                    fila.querySelector(".btnQuitarFila").addEventListener("click", () => quitarFila(fila, objeto));
                }
            }
            calcularTotal();
        }

        inpCantidad.addEventListener("input", () => {
            const n = parseInt(inpCantidad.value) || 0;
            generarFilas(n);
        });

        inpPrecioTot.addEventListener("input", () => {
            realTocado = inpPrecioTot.value.trim() !== "";
            realOverride = parseFloat(inpPrecioTot.value) || 0;
        });

        const form = overlay.querySelector("#formNuevoLote");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const n = filas.length;
            if (n < 1) {
                abrirAlert({ mensaje: "Coloca una cantidad de ruedas." });
                return;
            }
            const sinMarca = filas.filter(f => !f.marca.value);
            if (sinMarca.length > 0) {
                abrirAlert({ mensaje: "Debes elegir la marca de cada rueda." });
                return;
            }

            const ruedas = filas.map(f => ({
                id_marca_rueda: parseInt(f.marca.value),
                precio_rueda: valorFila(f)
            }));

            const totalReal = realTocado ? realOverride : ruedas.reduce((s, r) => s + r.precio_rueda, 0);

            const payload = {
                fecha_compra: overlay.querySelector('input[name="fecha_compra"]').value,
                cantidad: n,
                precio_total: totalReal,
                ruedas
            };

            console.log("Datos listos para enviar:", payload);

            const res = await fetch("php/api/store/loteRueda/route.php", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            cerrar();
            ruedasListView();
        });

    } catch (error) {
        console.error(error);
    }
}
