import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";
import { showToast } from "../../toast.js";

export async function peajesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>PEAJES</h2>
        </div>
        <button id="newPeajeBtn"><img src="img/plus.svg" alt="Nuevo"> Peaje</button>
    `;
    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newPeajeBtn").addEventListener("click", () => newPeajeModal(null, peajesView));

    cont.innerHTML = `<p>Cargando peajes...</p>`;

    try {
        const res = await fetch("php/api/get/peajes/route.php");
        const data = await res.json();
        const lista = data.data || [];

        let html = `
            <table id="tbPeajes">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t15">Nombre Peaje</th>
                        <th class="th t8">Peaje Bs.</th>
                        <th class="thr t3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        lista.forEach(p => {
            html += `
                <tr>
                    <td class="pb t5">${p.id_peaje}</td>
                    <td class="pb pm t15">${p.nombre_peaje}</td>
                    <td class="pb pm t8">${Number(p.peaje).toFixed(2)}</td>
                    <td class="pb t3">
                        <button class="btnEditar listBtn" data-id="${p.id_peaje}"><img src="img/edit.svg" alt="editar"></button>
                        <button class="btnEliminar listBtn" data-id="${p.id_peaje}"><img src="img/trash.svg" alt="eliminar"></button>
                    </td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;
        cont.innerHTML = html;

        const byId = new Map(lista.map(p => [String(p.id_peaje), p]));
        document.querySelectorAll("#tbPeajes .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newPeajeModal(byId.get(btn.dataset.id), peajesView));
        });
        document.querySelectorAll("#tbPeajes .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarPeaje(btn.dataset.id));
        });
    } catch (error) {
        cont.innerHTML = "<p>Error cargando peajes</p>";
        console.error(error);
    }
}

function newPeajeModal(peaje, onSave) {
    const editando = !!peaje;
    const contenidoHTML = `
        <form id="formPeaje">
            <div class="modal-fila">
                <label>Nombre Peaje:</label>
                <input type="text" name="nombre_peaje" value="${editando ? peaje.nombre_peaje : ""}" maxlength="20" placeholder="Ej: Cliza" required>
            </div>
            <div class="modal-fila">
                <label>Peaje Bs.:</label>
                <input type="number" name="peaje" step="0.01" min="0" placeholder="0.00" value="${editando ? peaje.peaje : ""}" required>
            </div>
        </form>
    `;
    const resultado = abrirModal({
        titulo: editando ? "EDITAR PEAJE" : "NUEVO PEAJE",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formPeaje");
            if (form) form.requestSubmit();
        }
    });
    const form = resultado.overlay.querySelector("#formPeaje");
    const inpNombre = form.querySelector('input[name="nombre_peaje"]');
    inpNombre.addEventListener("keydown", comillasFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = inpNombre.value.trim();
        const peajeVal = form.querySelector('input[name="peaje"]').value.trim();
        if (!nombre) {
            showToast({ type: "error", title: "Error", description: "El nombre del peaje es obligatorio." });
            return;
        }
        if (peajeVal === "") {
            showToast({ type: "error", title: "Error", description: "El peaje es obligatorio." });
            return;
        }
        const payload = {
            nombre_peaje: nombre,
            peaje: parseFloat(peajeVal)
        };
        if (editando) payload.id_peaje = peaje.id_peaje;

        const url = editando ? "php/api/store/peajeEditar/route.php" : "php/api/store/peaje/route.php";
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.status === "success") {
                resultado.cerrar();
                showToast({ type: "success", title: "Guardado", description: result.message });
                onSave();
            } else {
                showToast({ type: "error", title: "Error", description: result.message });
            }
        } catch (error) {
            showToast({ type: "error", title: "Error", description: "Error al guardar el peaje." });
        }
    });
}

function eliminarPeaje(id) {
    abrirEliminar({
        titulo: "Eliminar Peaje",
        mensaje: "Esta seguro que quiere eliminar este peaje?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/peajeEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_peaje: id })
            });
            const result = await res.json();
            if (result.status === "success") {
                showToast({ type: "success", title: "Eliminado", description: result.message });
                peajesView();
            } else {
                showToast({ type: "error", title: "Error", description: result.message });
            }
        }
    });
}
