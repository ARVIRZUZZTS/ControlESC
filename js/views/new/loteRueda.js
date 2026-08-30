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
                    <label>Precio Total (Bs.):</label>
                    <input type="number" id="precioTotal" name="precio_total" step="0.01" placeholder="0.00" readonly>
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
        const inpPrecioTot = overlay.querySelector("#precioTotal");

        let filas = [];

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

        function calcularTotal() {
            const total = filas.reduce((sum, f) => sum + valorFila(f), 0);
            inpPrecioTot.value = total.toFixed(2);
        }

        function generarFilas(n) {
            contRuedas.innerHTML = "";
            filas = [];
            for (let i = 0; i < n; i++) {
                const fila = document.createElement("div");
                fila.className = "modal-fila";
                fila.innerHTML = `
                    <label>Rueda ${i + 1}:</label>
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
                filas.push({ marca: select, precio });

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
            }
            calcularTotal();
        }

        inpCantidad.addEventListener("input", () => {
            const n = parseInt(inpCantidad.value) || 0;
            generarFilas(n);
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

            const payload = {
                fecha_compra: overlay.querySelector('input[name="fecha_compra"]').value,
                cantidad: n,
                precio_total: ruedas.reduce((s, r) => s + r.precio_rueda, 0),
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
