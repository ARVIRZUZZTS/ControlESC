import { marcasAceitesView } from "../marcas/marcasAceitesView.js";
import { abrirModal } from "../../components/modal.js";

import { decimalFilter } from "../../utils.js";
import { comillasFilter } from "../../utils.js";

export async function newMarcaAceiteView() {

    let cerrar = () => {};

    try {
        const unidadAceiteRes = await fetch("php/api/get/unidadAceite/route.php");
        const unidadAceiteResponse = await unidadAceiteRes.json();
        const unidadAceite = unidadAceiteResponse.data || unidadAceiteResponse;

        const optUnidades = unidadAceite.map(u =>
            `<option value="${u.id_ua}">${u.unidad_aceite}</option>`
        ).join("");

        const contenidoHTML = `
            <form id="formNuevaMarca">
                <div class="modal-fila">
                    <label>Nombre Marca:</label>
                    <input type="text" name="nombre_marca_aceite" placeholder="..." maxlength="25" required>
                </div>
                <div class="modal-fila">
                    <label>Unidad Aceite:</label>
                    <select name="id_ua" required>
                        <option value="" selected disabled>-- Elija Unidad --</option>
                        ${optUnidades}
                    </select>
                </div>
                <div class="modal-fila">
                    <label>Precio Unitario (Bs.):</label>
                    <input type="number" step="0.01" name="precio" placeholder="0.00" required
                        oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                </div>
            </form>
        `;

        const resultado = abrirModal({
            titulo: "NUEVA MARCA DE ACEITE",
            contenidoHTML: contenidoHTML,
            onSubmit: () => {
                const form = resultado.overlay.querySelector("#formNuevaMarca");
                if (form) form.requestSubmit();
            }
        });
        cerrar = resultado.cerrar;

        const form = resultado.overlay.querySelector("#formNuevaMarca");

        const inpMarcaAc = resultado.overlay.querySelector('input[name="nombre_marca_aceite"]');
        const inpPrecio = resultado.overlay.querySelector('input[name="precio"]');

        if (inpMarcaAc) inpMarcaAc.addEventListener("keydown", comillasFilter);
        if (inpPrecio) inpPrecio.addEventListener("keydown", decimalFilter);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            console.log("Datos listos para enviar:", dataFinal);

            const res = await fetch("php/api/store/marcaAceite/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataFinal)
            });

            const result = await res.json();
            if (result.status === "success") {
                cerrar();
                marcasAceitesView();
            } else {
                console.error("Error guardando marca:", result.message);
            }
        });

    } catch (error) {
        console.error(error);
    }
}