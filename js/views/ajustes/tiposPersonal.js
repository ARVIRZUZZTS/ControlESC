import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";

export async function tiposPersonalView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>TIPOS DE PERSONAL</h2>
        </div>
        <button id="newTipoPersonalBtn"><img src="img/plus.svg" alt="Nuevo"> Tipo Personal</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newTipoPersonalBtn").addEventListener("click", () => newTipoPersonalModal(null, tiposPersonalView));

    try {
        const res = await fetch("php/views/tiposPersonal.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbTiposPersonal">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Nombre Tipo Personal</th>
                        <th class="th t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(t => {
            html += `
                <tr>
                    <td class="pb t5">${t.id_te}</td>
                    <td class="pb pm t10">${t.nombre_tipo_personal}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${t.id_te}"><img src="img/edit.svg" alt="editar"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${t.id_te}"><img src="img/trash.svg" alt="eliminar"></button></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(data.map(t => [String(t.id_te), t]));

        document.querySelectorAll("#tbTiposPersonal .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newTipoPersonalModal(byId.get(btn.dataset.id), tiposPersonalView));
        });
        document.querySelectorAll("#tbTiposPersonal .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarTipoPersonal(btn.dataset.id));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando tipos de personal</p>";
        console.error(error);
    }
}

function newTipoPersonalModal(tipo, onSave) {
    const editando = !!tipo;

    const contenidoHTML = `
        <form id="formTipoPersonal">
            <div class="modal-fila">
                <label>Nombre Tipo Personal:</label>
                <input type="text" name="nombre_tipo_personal" value="${editando ? tipo.nombre_tipo_personal : ""}" maxlength="50" placeholder="Ej: Chofer Principal" required>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR TIPO DE PERSONAL" : "NUEVO TIPO DE PERSONAL",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formTipoPersonal");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formTipoPersonal");
    const inpNombre = form.querySelector('input[name="nombre_tipo_personal"]');
    inpNombre.addEventListener("keydown", comillasFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = inpNombre.value.trim();
        if (!nombre) {
            abrirAlert({ mensaje: "El nombre del tipo de personal es obligatorio." });
            return;
        }

        const payload = { nombre_tipo_personal: nombre };
        if (editando) payload.id_te = tipo.id_te;

        const url = editando ? "php/api/store/tipoPersonalEditar/route.php" : "php/api/store/tipoPersonal/route.php";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.status === "success") {
                resultado.cerrar();
                onSave();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al guardar el tipo de personal." });
        }
    });
}

function eliminarTipoPersonal(id_te) {
    abrirEliminar({
        titulo: "Eliminar Tipo de Personal",
        mensaje: "Esta seguro que quiere eliminar este tipo de personal?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/tipoPersonalEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_te: parseInt(id_te) })
            });
            const result = await res.json();
            if (result.status === "success") {
                tiposPersonalView();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}