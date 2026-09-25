import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";

export async function ubicacionesLlegadaView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>UBICACIONES LLEGADA</h2>
        </div>
        <button id="newUbicacionLlegadaBtn" class="aic"><img src="img/plus.svg" alt="Nuevo"> Ubicacion Llegada</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newUbicacionLlegadaBtn").addEventListener("click", () => newUbicacionLlegadaModal(null, ubicacionesLlegadaView));

    try {
        const res = await fetch("php/views/ubicacionesLlegada.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbUbicacionesLlegada">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Nombre Ubicacion Llegada</th>
                        <th class="th t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(u => {
            html += `
                <tr>
                    <td class="pb t5">${u.id_ubicaciones_llegada}</td>
                    <td class="pb pm t10">${u.nombre_ubicaciones_llegada}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${u.id_ubicaciones_llegada}"><img src="img/edit.svg" alt="editar"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${u.id_ubicaciones_llegada}"><img src="img/trash.svg" alt="eliminar"></button></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(data.map(u => [String(u.id_ubicaciones_llegada), u]));

        document.querySelectorAll("#tbUbicacionesLlegada .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newUbicacionLlegadaModal(byId.get(btn.dataset.id), ubicacionesLlegadaView));
        });
        document.querySelectorAll("#tbUbicacionesLlegada .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarUbicacionLlegada(btn.dataset.id));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando ubicaciones de llegada</p>";
        console.error(error);
    }
}

function newUbicacionLlegadaModal(ubicacion, onSave) {
    const editando = !!ubicacion;

    const contenidoHTML = `
        <form id="formUbicacionLlegada">
            <div class="modal-fila">
                <label>Nombre Ubicacion Llegada:</label>
                <input type="text" name="nombre_ubicaciones_llegada" value="${editando ? ubicacion.nombre_ubicaciones_llegada : ""}" maxlength="50" placeholder="Ej: La Paz-Santa Cruz" required>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR UBICACION LLEGADA" : "NUEVA UBICACION LLEGADA",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formUbicacionLlegada");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formUbicacionLlegada");
    const inpNombre = form.querySelector('input[name="nombre_ubicaciones_llegada"]');
    inpNombre.addEventListener("keydown", comillasFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = inpNombre.value.trim();
        if (!nombre) {
            abrirAlert({ mensaje: "El nombre de la ubicacion de llegada es obligatorio." });
            return;
        }

        const payload = { nombre_ubicaciones_llegada: nombre };
        if (editando) payload.id_ubicaciones_llegada = ubicacion.id_ubicaciones_llegada;

        const url = editando ? "php/api/store/ubicacionLlegadaEditar/route.php" : "php/api/store/ubicacionLlegada/route.php";

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
            abrirAlert({ mensaje: "Error al guardar la ubicacion de llegada." });
        }
    });
}

function eliminarUbicacionLlegada(id_ubicaciones_llegada) {
    abrirEliminar({
        titulo: "Eliminar Ubicacion Llegada",
        mensaje: "Esta seguro que quiere eliminar esta ubicacion de llegada?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/ubicacionLlegadaEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_ubicaciones_llegada: parseInt(id_ubicaciones_llegada) })
            });
            const result = await res.json();
            if (result.status === "success") {
                ubicacionesLlegadaView();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}