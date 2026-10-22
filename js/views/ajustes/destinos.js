import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";
import { obtenerSesion } from "../../sesion.js";
import { showToast } from "../../toast.js";

export async function destinosView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");

    const usuario = await obtenerSesion();
    const esAdmin = !!usuario && usuario.rol === "admin";

    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>DESTINOS</h2>
        </div>
        <button id="newDestinoBtn"><img src="img/plus.svg" alt="Nuevo"> Destino</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newDestinoBtn").addEventListener("click", () => newDestinoModal(null, destinosView));

    cont.innerHTML = `<p>Cargando destinos...</p>`;

    try {
        const res = await fetch("php/views/destinos.php");
        const data = await res.json();

        if (!Array.isArray(data)) {
            cont.innerHTML = `<p>${data.message || "Error al cargar destinos"}</p>`;
            console.error(data.message);
            return;
        }

        renderDestinos(data, cont, esAdmin);
    } catch (error) {
        cont.innerHTML = `<p class="offlineAviso">Sin conexion a internet. No se puede gestionar esta seccion.</p>`;
        console.error(error);
    }
}

function renderDestinos(lista, cont, esAdmin) {
    let html = `
        <table id="tbDestinos">
            <thead>
                <tr>
                    <th class="thl t5">ID</th>
                    <th class="th t15">Destino</th>
                    <th class="th t5">Tramos</th>
                    <th class="th t5">Sucursal</th>
                    <th class="th t15">Informacion</th>
                    <th class="th t10">Telefono</th>
                    <th class="th t8">Peaje</th>
                    <th class="thr t8">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    lista.forEach(d => {
        html += `
            <tr>
                <td class="pb t5">${d.id}</td>
                <td class="pb pm t15">${d.nombre_destino}${d.abrev ? ` [${d.abrev}]` : ""}</td>
                <td class="pb pm t5">${d.tiene_tramos ? "Si" : "No"}</td>
                <td class="pb pm t5">${d.sucursal || "-"}</td>
                <td class="pb pm t15">${d.informacion || "-"}</td>
                <td class="pb pm t10">${d.telefono || "-"}</td>
                <td class="pb pm t8">${d.precio_peaje !== null && d.precio_peaje !== undefined ? `Bs. ${d.precio_peaje}` : "-"}</td>
                <td class="pb t8">
                    <button class="btnEditar listBtn" data-id="${d.id}"><img src="img/edit.svg" alt="editar"></button>
                    ${esAdmin ? `<button class="btnEliminar listBtn" data-id="${d.id}"><img src="img/trash.svg" alt="eliminar"></button>` : ""}
                </td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
    `;

    cont.innerHTML = html;

    const byId = new Map(lista.map(d => [String(d.id), d]));

    document.querySelectorAll("#tbDestinos .btnEditar").forEach(btn => {
        btn.addEventListener("click", () => newDestinoModal(byId.get(btn.dataset.id), destinosView));
    });
    document.querySelectorAll("#tbDestinos .btnEliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarDestino(btn.dataset.id));
    });
}

function newDestinoModal(destino, onSave) {
    const editando = !!destino;

    const contenidoHTML = `
        <form id="formDestino">
            <div class="modal-fila">
                <label>Nombre Destino:</label>
                <input type="text" name="nombre_destino" value="${editando ? destino.nombre_destino : ""}" maxlength="50" placeholder="Ej: Cochabamba" required>
            </div>
            <div class="modal-fila">
                <label>Tiene Tramos:</label>
                <input type="checkbox" name="tiene_tramos" ${editando && destino.tiene_tramos ? "checked" : ""}>
            </div>
            <div class="modal-fila">
                <label>Sucursal:</label>
                <select name="sucursal">
                    <option value="">-- Seleccione --</option>
                </select>
            </div>
            <div class="modal-fila">
                <label>Abreviacion (max 4):</label>
                <input type="text" name="abrev" value="${editando ? (destino.abrev || "") : ""}" maxlength="4" placeholder="Ej: CBBA">
            </div>
            <div class="modal-fila">
                <label>Informacion:</label>
                <textarea name="informacion" rows="3" maxlength="255" placeholder="Direccion, terminal, etc.">${editando ? (destino.informacion || "") : ""}</textarea>
            </div>
            <div class="modal-fila">
                <label>Telefono:</label>
                <input type="text" name="telefono" value="${editando ? (destino.telefono || "") : ""}" maxlength="20" placeholder="Ej: 73794391">
            </div>
            <div class="modal-fila">
                <label>Precio Peaje Bs. (local):</label>
                <input type="number" name="precio_peaje" step="0.01" min="0" placeholder="0.00" value="${editando && destino.precio_peaje !== null && destino.precio_peaje !== undefined ? destino.precio_peaje : ""}">
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR DESTINO" : "NUEVO DESTINO",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formDestino");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formDestino");

    /* Cargar sucursales para el select */
    (async () => {
        try {
            const res = await fetch("php/api/get/sucursal/route.php");
            const data = await res.json();
            const sucs = data.data || data.sucursales || [];
            const sel = form.querySelector('select[name="sucursal"]');
            sucs.forEach(s => {
                const opt = document.createElement("option");
                opt.value = s.id_sucursal;
                opt.textContent = s.nombre;
                if (editando && Number(destino.sucursal) === Number(s.id_sucursal)) opt.selected = true;
                sel.appendChild(opt);
            });
        } catch (e) { /* sin sucursales */ }
    })();

    const inpNombre = form.querySelector('input[name="nombre_destino"]');
    inpNombre.addEventListener("keydown", comillasFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = inpNombre.value.trim();
        if (!nombre) {
            showToast({ type: "error", title: "Error", description: "El nombre del destino es obligatorio." });
            return;
        }

        const abrev = form.querySelector('input[name="abrev"]').value.trim();
        if (abrev && abrev.length > 4) {
            showToast({ type: "error", title: "Error", description: "La abreviacion debe tener maximo 4 caracteres." });
            return;
        }

        const tiene_tramos = form.querySelector('input[name="tiene_tramos"]').checked;
        const sucursalVal = form.querySelector('select[name="sucursal"]').value;
        const sucursal = sucursalVal ? parseInt(sucursalVal) : null;
        const informacion = form.querySelector('textarea[name="informacion"]').value.trim();
        const telefono = form.querySelector('input[name="telefono"]').value.trim();
        const precioRaw = form.querySelector('input[name="precio_peaje"]').value.trim();
        const precio_peaje = precioRaw !== "" ? parseFloat(precioRaw) : null;

        const payload = {
            nombre_destino: nombre,
            tiene_tramos,
            sucursal,
            abrev: abrev || null,
            informacion: informacion || null,
            telefono: telefono || null,
            precio_peaje
        };
        if (editando) payload.id = destino.id;

        const url = editando ? "php/api/store/destinoEditar/route.php" : "php/api/store/destino/route.php";

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
            showToast({ type: "error", title: "Error", description: "Error al guardar el destino." });
        }
    });
}

function eliminarDestino(id) {
    abrirEliminar({
        titulo: "Eliminar Destino",
        mensaje: "Esta seguro que quiere eliminar este destino?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/destinoEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id })
            });
            const result = await res.json();
            if (result.status === "success") {
                showToast({ type: "success", title: "Eliminado", description: result.message });
                destinosView();
            } else {
                showToast({ type: "error", title: "Error", description: result.message });
            }
        }
    });
}