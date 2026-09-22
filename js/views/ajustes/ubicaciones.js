import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";

export async function ubicacionesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>UBICACIONES</h2>
        </div>
        <button id="newUbicacionBtn"><img src="img/plus.svg" alt="Nuevo"> Ubicacion</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newUbicacionBtn").addEventListener("click", () => newUbicacionModal(null, ubicacionesView));

    try {
        const res = await fetch("php/views/ubicaciones.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbUbicaciones">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Nombre Ubicacion</th>
                        <th class="th t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(u => {
            html += `
                <tr>
                    <td class="pb t5">${u.id_ubicacion}</td>
                    <td class="pb pm t10">${u.nombre_ubicacion}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${u.id_ubicacion}"><img src="img/edit.svg" alt="editar"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${u.id_ubicacion}"><img src="img/trash.svg" alt="eliminar"></button></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(data.map(u => [String(u.id_ubicacion), u]));

        document.querySelectorAll("#tbUbicaciones .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newUbicacionModal(byId.get(btn.dataset.id), ubicacionesView));
        });
        document.querySelectorAll("#tbUbicaciones .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarUbicacion(btn.dataset.id));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando ubicaciones</p>";
        console.error(error);
    }
}

function newUbicacionModal(ubicacion, onSave) {
    const editando = !!ubicacion;

    const contenidoHTML = `
        <form id="formUbicacion">
            <div class="modal-fila">
                <label>Nombre Ubicacion:</label>
                <input type="text" name="nombre_ubicacion" value="${editando ? ubicacion.nombre_ubicacion : ""}" maxlength="25" placeholder="Ej: Cochabamba" required>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR UBICACION" : "NUEVA UBICACION",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formUbicacion");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formUbicacion");
    const inpNombre = form.querySelector('input[name="nombre_ubicacion"]');
    inpNombre.addEventListener("keydown", comillasFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = inpNombre.value.trim();
        if (!nombre) {
            abrirAlert({ mensaje: "El nombre de la ubicacion es obligatorio." });
            return;
        }

        const payload = { nombre_ubicacion: nombre };
        if (editando) payload.id_ubicacion = ubicacion.id_ubicacion;

        const url = editando ? "php/api/store/ubicacionEditar/route.php" : "php/api/store/ubicacion/route.php";

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
            abrirAlert({ mensaje: "Error al guardar la ubicacion." });
        }
    });
}

function eliminarUbicacion(id_ubicacion) {
    abrirEliminar({
        titulo: "Eliminar Ubicacion",
        mensaje: "Esta seguro que quiere eliminar esta ubicacion?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/ubicacionEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_ubicacion: parseInt(id_ubicacion) })
            });
            const result = await res.json();
            if (result.status === "success") {
                ubicacionesView();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}