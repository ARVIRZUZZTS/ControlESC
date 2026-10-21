import { abrirModal, abrirAlert } from "./components/modal.js";

/* Modal para cambiar la contrasena del usuario en sesion */
export function modalCambiarContra() {
    const contenidoHTML = `
        <form id="formContra">
            <div class="modal-fila">
                <label>Nueva contrasena:</label>
                <input type="password" name="contrasena" maxlength="20" placeholder="Maximo 20 caracteres" required>
            </div>
            <div class="modal-fila">
                <label>Repetir contrasena:</label>
                <input type="password" name="repetir" maxlength="20" placeholder="Maximo 20 caracteres" required>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: "CAMBIAR CONTRASENA",
        contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formContra");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formContra");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const contrasena = form.querySelector('input[name="contrasena"]').value;
        const repetir = form.querySelector('input[name="repetir"]').value;

        if (!contrasena || !repetir) {
            abrirAlert({ mensaje: "Completa ambos campos." });
            return;
        }
        if (contrasena.length > 20) {
            abrirAlert({ mensaje: "La contrasena debe tener maximo 20 caracteres." });
            return;
        }
        if (contrasena !== repetir) {
            abrirAlert({ mensaje: "Las contrasenas no coinciden." });
            return;
        }

        try {
            const res = await fetch("php/api/auth/cambiarContra/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contrasena, repetir })
            });
            const result = await res.json();
            if (result.status === "success") {
                resultado.cerrar();
                abrirAlert({ mensaje: result.message, titulo: "Contrasena" });
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al cambiar la contrasena." });
        }
    });
}
