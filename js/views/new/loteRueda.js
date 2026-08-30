import { ruedasListView } from "../list/ruedas.js";
import { abrirModal } from "../../components/modal.js";

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

        const searchOpt = marcas_ruedas.map(m => `<option value="${m.id_marca_rueda}">${m.nombre_marca_rueda}</option>`).join("");

        const contenidoHTML = `
            <form id="formNuevoLote">
                <div class="modal-fila">
                    <label>Marca:</label>
                    <select id="selectMarca" name="marca_rueda">${searchOpt}</select>
                </div>
                <div class="modal-fila">
                    <label>Fecha Compra:</label>
                    <input type="date" name="fecha_compra" value="${fechaDef}" required>
                </div>
                <div class="modal-fila">
                    <label>Cantidad:</label>
                    <input type="number" name="cantidad" placeholder="0" required
                        oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                </div>
                <div class="modal-fila">
                    <label>Precio Unitario (Bs.):</label>
                    <input type="number" step="0.01" name="precio_unitario" placeholder="0.00"
                        oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                </div>
                <div class="modal-fila">
                    <label>Precio Total (Bs.):</label>
                    <input type="number" step="0.01" name="precio_total" placeholder="0.00" required
                        oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
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
        const selectMarca = overlay.querySelector("#selectMarca");
        const inpCantidad = overlay.querySelector('input[name="cantidad"]');
        const inpPrecioUni = overlay.querySelector('input[name="precio_unitario"]');
        const inpPrecioTot = overlay.querySelector('input[name="precio_total"]');

        const actualizarTotal = () => {
            const cant = parseFloat(inpCantidad.value) || 0;
            const uni = parseFloat(inpPrecioUni.value) || 0;
            inpPrecioTot.value = (cant * uni).toFixed(2);
        };

        const actualizarPrecio = () => {
            const idSeleccionado = selectMarca.value;
            const marcaEncontrada = marcas_ruedas.find(m => m.id_marca_rueda == idSeleccionado);
            if (marcaEncontrada) {
                actualizarTotal();
            }
        };

        selectMarca.addEventListener("change", actualizarPrecio);
        inpCantidad.addEventListener("input", actualizarTotal);
        inpPrecioUni.addEventListener("input", actualizarTotal);

        if (inpCantidad) inpCantidad.addEventListener("keydown", hardFilter);
        if (inpPrecioUni) inpPrecioUni.addEventListener("keydown", decimalFilter);
        if (inpPrecioTot) inpPrecioTot.addEventListener("keydown", decimalFilter);

        actualizarPrecio();

        const form = overlay.querySelector("#formNuevoLote");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            console.log("Datos listos para enviar:", dataFinal);

            const res = await fetch("php/api/store/loteRueda/route.php", {
                method: "POST",
                body: JSON.stringify(dataFinal)
            });

            cerrar();
            ruedasListView();
        });

    } catch (error) {
        console.error(error);
    }
}
