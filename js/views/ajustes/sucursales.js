import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";
import { obtenerSesion } from "../../sesion.js";
import { showToast } from "../../toast.js";

export async function sucursalesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");

    const usuario = await obtenerSesion();
    const esAdmin = !!usuario && usuario.rol === "admin";

    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>SUCURSALES</h2>
        </div>
        <div class="btnsTitle">
            <button id="newSucursalBtn"><img src="img/plus.svg" alt="Nuevo"> Sucursal</button>
        </div>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newSucursalBtn").addEventListener("click", () => newSucursalModal(null, sucursalesView));

    cont.innerHTML = `<p>Cargando sucursales...</p>`;

    try {
        const res = await fetch("php/views/sucursal.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        const lista = data.sucursales || (Array.isArray(data) ? data : []);

        let html = `
            <table id="tbSucursales">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t10">Nombre Sucursal</th>
                        <th class="t3">Editar</th>
                        ${esAdmin ? `<th class="thr t3">Eliminar</th>` : ""}
                    </tr>
                </thead>
                <tbody>
        `;
        lista.forEach(s => {
            html += `
                <tr>
                    <td class="pb t5">${s.id_sucursal}</td>
                    <td class="pb pm t10">${s.nombre}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${s.id_sucursal}"><img src="img/edit.svg" alt="editar"></button></td>
                    ${esAdmin ? `<td class="pb t3"><button class="btnEliminar listBtn" data-id="${s.id_sucursal}"><img src="img/trash.svg" alt="eliminar"></button></td>` : ""}
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(lista.map(s => [String(s.id_sucursal), s]));

        document.querySelectorAll("#tbSucursales .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newSucursalModal(byId.get(btn.dataset.id), sucursalesView));
        });
        document.querySelectorAll("#tbSucursales .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarSucursal(btn.dataset.id));
        });

    } catch (error) {
        cont.innerHTML = `<p class="offlineAviso">Sin conexion a internet. No se puede gestionar esta seccion.</p>`;
        console.error(error);
    }
}

function newSucursalModal(sucursal, onSave) {
    const editando = !!sucursal;

    const contenidoHTML = `
        <form id="formSucursal">
            <div class="modal-fila">
                <label>Nombre Sucursal:</label>
                <input type="text" name="nombre" value="${editando ? sucursal.nombre : ""}" maxlength="50" placeholder="Ej: Sucursal Cbba." required>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR SUCURSAL" : "NUEVA SUCURSAL",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formSucursal");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formSucursal");
    const inpNombre = form.querySelector('input[name="nombre"]');
    inpNombre.addEventListener("keydown", comillasFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = inpNombre.value.trim();
        if (!nombre) {
            showToast({ type: "error", title: "Error", description: "El nombre de la sucursal es obligatorio." });
            return;
        }

        const payload = { nombre };
        if (editando) payload.id_sucursal = sucursal.id_sucursal;

        const url = editando ? "php/api/store/sucursalEditar/route.php" : "php/api/store/sucursal/route.php";

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
            showToast({ type: "error", title: "Error", description: "Error al guardar la sucursal." });
        }
    });
}

function eliminarSucursal(id_sucursal) {
    abrirEliminar({
        titulo: "Eliminar Sucursal",
        mensaje: "Esta seguro que quiere eliminar esta sucursal?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/sucursalEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_sucursal: id_sucursal })
            });
            const result = await res.json();
            if (result.status === "success") {
                showToast({ type: "success", title: "Eliminado", description: result.message });
                sucursalesView();
            } else {
                showToast({ type: "error", title: "Error", description: result.message });
            }
        }
    });
}