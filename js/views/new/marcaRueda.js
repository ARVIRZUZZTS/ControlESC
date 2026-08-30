import { marcasRuedasView } from "../marcas/ruedas.js";
import { abrirModal } from "../../components/modal.js";
import { decimalFilter } from "../../utils.js";

export async function newMarcaRuedaView() {

    let cerrar = () => {};

    try {
        const contenidoHTML = `
            <form id="formNuevaMarca">
                <div class="modal-fila">
                    <label>Nombre Marca:</label>
                    <input type="text" name="nombre_marca_rueda" placeholder="..." maxlength="25" required>
                </div>
                <div class="modal-fila">
                    <label>Precio Unitario (Bs.):</label>
                    <input type="number" step="0.01" name="precio_unitario" placeholder="0.00" required
                        oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                </div>
                <div class="modal-fila">
                    <label>Medida:</label>
                    <input type="number" step="0.01" name="medida" placeholder="0.00 cm"
                        oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                </div>
                <div class="modal-fila">
                    <label>Serie:</label>
                    <input type="text" name="serie" placeholder="..." maxlength="25">
                </div>
                <div class="modal-fila">
                    <label>Trilla:</label>
                    <input type="text" name="trilla" placeholder="..." maxlength="50">
                </div>
                <div class="modal-fila">
                    <label>Aro:</label>
                    <input type="text" name="aro" placeholder="..." maxlength="50">
                </div>
                <div class="modal-fila">
                    <label>Media Viajes:</label>
                    <input type="number" name="media_viajes" placeholder="0" required
                        oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                </div>
            </form>
        `;

        const resultado = abrirModal({
            titulo: "NUEVA MARCA DE RUEDA",
            contenidoHTML: contenidoHTML,
            onSubmit: () => {
                const form = resultado.overlay.querySelector("#formNuevaMarca");
                if (form) form.requestSubmit();
            }
        });
        cerrar = resultado.cerrar;

        const form = resultado.overlay.querySelector("#formNuevaMarca");

        const inpPrecio = resultado.overlay.querySelector('input[name="precio_unitario"]');
        if (inpPrecio) inpPrecio.addEventListener("keydown", decimalFilter);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            console.log("Datos listos para enviar:", dataFinal);

            const res = await fetch("php/api/store/marcaRueda/route.php", {
                method: "POST",
                body: JSON.stringify(dataFinal)
            });

            cerrar();
            marcasRuedasView();
        });

    } catch (error) {
        console.error(error);
    }
}
