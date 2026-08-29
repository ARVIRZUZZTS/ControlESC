export function abrirModal({ titulo = "Modal", contenidoHTML = "", onSubmit = null, onCancel = null, botonGuardar = "GUARDAR" } = {}) {

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modalOverlay";

    const html = `
        <div class="modal-panel" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button type="button" class="modal-close" aria-label="Cerrar">&times;</button>
            </div>
            <div class="modal-body">
                ${contenidoHTML}
            </div>
            <div class="modal-footer">
                <button type="button" class="modal-cancel">CANCELAR</button>
                <button type="button" class="modal-accept">${botonGuardar}</button>
            </div>
        </div>
    `;

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    let cerrado = false;

    const limpiar = () => {
        overlay.remove();
        document.removeEventListener("keydown", onEsc);
    };

    const cerrar = () => {
        if (cerrado) return;
        cerrado = true;
        limpiar();
        if (onCancel) onCancel();
    };

    const onEsc = (e) => {
        if (e.key === "Escape") cerrar();
    };

    overlay.querySelector(".modal-close").addEventListener("click", cerrar);
    overlay.querySelector(".modal-cancel").addEventListener("click", cerrar);

    overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay) cerrar();
    });

    panelGuardar();

    function panelGuardar() {
        const panel = overlay.querySelector(".modal-panel");
        panel.querySelector(".modal-accept").addEventListener("click", () => {
            if (onSubmit) onSubmit(cerrar);
        });
    }

    document.addEventListener("keydown", onEsc);

    return {
        cerrar,
        overlay
    };
}
