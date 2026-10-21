import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";
import { obtenerSesion } from "../../sesion.js";
import { actualizarBadgeSuc, sincronizarAhora } from "../../sync.js";
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
        <div class="btnsTitle">
            <button id="actualizarDestinosBtn" class="btnSync">ACTUALIZAR DESDE SUPABASE</button>
            <button id="newDestinoBtn"><img src="img/plus.svg" alt="Nuevo"> Destino</button>
        </div>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newDestinoBtn").addEventListener("click", () => newDestinoModal(null, destinosView));

    try {
        /* 1) Carga instantanea: solo el espejo local */
        const resLoc = await fetch("php/api/get/destinoLocal/route.php");
        const dataLoc = await resLoc.json();

        if (dataLoc.status === "error") {
            cont.innerHTML = `<p>${dataLoc.message}</p>`;
            console.error(dataLoc.message);
            return;
        }

        const lista = dataLoc.data || [];

        /* 2) Panel de pendientes de subir */
        let syncPanel = "";
        try {
            const resSync = await fetch("php/api/sync/estado/route.php");
            const estadoSync = await resSync.json();
            if (estadoSync.status === "success") {
                const nPend = estadoSync.pendientes || 0;
                const nErr = estadoSync.errores || 0;
                if (nPend + nErr > 0) {
                    let errLista = "";
                    (estadoSync.detalle_errores || []).forEach(e => {
                        errLista += `<li>${e.tabla} (${e.operacion}): ${e.error || "sin detalle"}</li>`;
                    });
                    syncPanel = `
                        <div class="syncPanel">
                            <div class="syncPanelTop">
                                <span><strong>${nPend}</strong> pendiente(s) de subir${nErr > 0 ? ` &bull; <span class="syncErrCount">${nErr} con error</span>` : ""}</span>
                                <button id="syncAhoraBtn" class="btnSync">SINCRONIZAR AHORA</button>
                            </div>
                            ${errLista ? `<ul class="syncErrLista">${errLista}</ul>` : ""}
                        </div>
                    `;
                }
            }
        } catch (e) { /* sin informe de sync: se continua */ }

        let html = `
            ${syncPanel}
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
                        <th class="th t8">Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        lista.forEach(d => {
            const pendiente = Number(d.id) >= 1000;
            html += `
                <tr>
                    <td class="pb t5">${d.id}</td>
                    <td class="pb pm t15">${d.nombre_destino}${d.abrev ? ` [${d.abrev}]` : ""}${pendiente ? `<span class="badgePend">pendiente</span>` : ""}</td>
                    <td class="pb pm t5">${d.tiene_tramos ? "Si" : "No"}</td>
                    <td class="pb pm t5">${d.sucursal || "-"}</td>
                    <td class="pb pm t15">${d.informacion || "-"}</td>
                    <td class="pb pm t10">${d.telefono || "-"}</td>
                    <td class="pb pm t8">${d.precio_peaje !== null && d.precio_peaje !== undefined ? `Bs. ${d.precio_peaje}` : "-"}</td>
                    <td class="pb pm t8">
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

        document.getElementById("syncAhoraBtn")?.addEventListener("click", async () => {
            await sincronizarAhora();
            destinosView();
        });

        document.getElementById("actualizarDestinosBtn")?.addEventListener("click", async () => {
            const btn = document.getElementById("actualizarDestinosBtn");
            btn.disabled = true;
            btn.textContent = "ACTUALIZANDO...";
            try {
                const res = await fetch("php/api/get/destinosPull/route.php");
                const result = await res.json();
                if (result.status === "success") {
                    const r = result.resumen || {};
                    showToast({ type: "success", title: "Actualizado", description: `Se descargaron ${r.nuevos || 0} nuevo(s) y se actualizaron ${r.actualizados || 0}.` });
                    destinosView();
                } else {
                    showToast({ type: "error", title: "Error", description: result.message });
                }
            } catch (e) {
                showToast({ type: "error", title: "Sin conexion", description: "No se pudo actualizar." });
            } finally {
                btn.disabled = false;
                btn.textContent = "ACTUALIZAR DESDE SUPABASE";
            }
        });

        actualizarBadgeSuc();

        /* 3) Verificacion contra Supabase en segundo plano */
        verificarDestinos();

    } catch (error) {
        cont.innerHTML = "<p>Error cargando destinos</p>";
        console.error(error);
    }
}

async function verificarDestinos() {
    try {
        const res = await fetch("php/api/get/destinoVerificar/route.php");
        const data = await res.json();

        if (data.status === "error") throw new Error(data.message);

        if (data.offline) {
            showToast({ type: "error", title: "Sin conexion", description: "Datos locales." });
            return;
        }
        if (data.diferencias > 0) {
            showToast({ type: "info", title: "Servidor", description: `Hay ${data.diferencias} cambio(s) en el servidor. Usa ACTUALIZAR.` });
            return;
        }

        showToast({ type: "success", title: "Verificado", description: "Todo sincronizado con Supabase." });
    } catch (e) {
        showToast({ type: "error", title: "Error", description: "No se pudo verificar." });
    }
}

function newDestinoModal(destino, onSave) {
    const editando = !!destino;

    const sucursalesOpts = window._sucursalesCache || "";

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
                    ${sucursalesOpts}
                </select>
            </div>
            <div class="modal-fila">
                <label>Abreviacion (max 5):</label>
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

        const tiene_tramos = form.querySelector('input[name="tiene_tramos"]').checked;
        const sucursalVal = form.querySelector('select[name="sucursal"]').value;
        const sucursal = sucursalVal ? parseInt(sucursalVal) : null;
        const abrev = form.querySelector('input[name="abrev"]').value.trim();
        if (abrev && abrev.length > 3 && abrev !== "CBBA") {
            showToast({ type: "error", title: "Error", description: "La abreviacion debe tener maximo 3 caracteres (CBBA es excepcion)." });
            return;
        }
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
                if (result.pendiente) {
                    showToast({ type: "info", title: "Sin conexion", description: "Guardado en este equipo. Se subira a Supabase al reconectar." });
                }
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
                body: JSON.stringify({ id: parseInt(id) })
            });
            const result = await res.json();
            if (result.status === "success") {
                if (result.pendiente) {
                    showToast({ type: "info", title: "Sin conexion", description: "Eliminado en este equipo. Se aplicara en Supabase al reconectar." });
                }
                destinosView();
                actualizarBadgeSuc();
            } else {
                showToast({ type: "error", title: "Error", description: result.message });
            }
        }
    });
}




