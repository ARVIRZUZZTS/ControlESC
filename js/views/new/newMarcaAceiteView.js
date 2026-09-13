import { marcasAceitesView } from "../marcas/marcasAceitesView.js";
import { abrirModal } from "../../components/modal.js";

import { decimalFilter } from "../../utils.js";
import { comillasFilter } from "../../utils.js";

export async function newMarcaAceiteView(marca = null) {

    let cerrar = () => {};
    const editando = !!marca;

    try {
        const contenidoHTML = `
            <form id="formNuevaMarca">
                <div class="modal-fila">
                    <label>Nombre Marca:</label>
                    <input type="text" name="nombre_marca_aceite" placeholder="..." maxlength="25" required
                        value="${editando ? marca.nombre_marca_aceite : ""}">
                </div>
                <div class="modal-fila">
                    <label>Cantidad Lt:</label>
                    <input type="number" step="0.001" name="cantidad" placeholder="0.000 Lt" required
                        value="${editando ? marca.cantidad : ""}"
                        oninput="if(this.value.length > 8) this.value = this.value.slice(0, 8);">
                </div>
                <div class="modal-fila">
                    <label>Precio Unitario (Bs.):</label>
                    <input type="number" step="0.01" name="precio" placeholder="0.00" required
                        value="${editando ? marca.precio : ""}"
                        oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                </div>
            </form>
        `;

        const resultado = abrirModal({
            titulo: editando ? "EDITAR MARCA DE ACEITE" : "NUEVA MARCA DE ACEITE",
            contenidoHTML: contenidoHTML,
            onSubmit: () => {
                const form = resultado.overlay.querySelector("#formNuevaMarca");
                if (form) form.requestSubmit();
            }
        });
        cerrar = resultado.cerrar;

        const form = resultado.overlay.querySelector("#formNuevaMarca");

        const inpMarcaAc = resultado.overlay.querySelector('input[name="nombre_marca_aceite"]');
        const inpCantidad = resultado.overlay.querySelector('input[name="cantidad"]');
        const inpPrecio = resultado.overlay.querySelector('input[name="precio"]');

        if (inpMarcaAc) inpMarcaAc.addEventListener("keydown", comillasFilter);
        if (inpCantidad) inpCantidad.addEventListener("keydown", decimalFilter);
        if (inpPrecio) inpPrecio.addEventListener("keydown", decimalFilter);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            if (editando) dataFinal.id_marca_aceite = marca.id_marca_aceite;

            console.log("Datos listos para enviar:", dataFinal);

            const url = editando ? "php/api/store/marcaAceiteEditar/route.php" : "php/api/store/marcaAceite/route.php";

            const res = await fetch(url, {
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