import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter } from "../../utils.js";
import { obtenerSesion } from "../../sesion.js";
import { actualizarBadgeSuc, sincronizarAhora } from "../../sync.js";
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
            <button id="actualizarSucursalesBtn" class="btnSync">ACTUALIZAR DESDE SUPABASE</button>
            <button id="newSucursalBtn"><img src="img/plus.svg" alt="Nuevo"> Sucursal</button>
        </div>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newSucursalBtn").addEventListener("click", () => newSucursalModal(null, sucursalesView));
    document.getElementById("actualizarSucursalesBtn")?.addEventListener("click", async () => {
        const btn = document.getElementById("actualizarSucursalesBtn");
        btn.disabled = true; btn.textContent = "ACTUALIZANDO...";
        try {
            const res = await fetch("php/api/sync/procesar/route.php", { method: "POST" });
            const result = await res.json();
            if (result.status === "success") {
                const r = result.resumen || {};
                showToast({ type: "success", title: "Sincronizado", description: `Se subieron ${r.subidas || 0} pendiente(s).` });
                sucursalesView();
            } else {
                showToast({ type: "error", title: "Error", description: result.message });
            }
        } catch (e) {
            showToast({ type: "error", title: "Sin conexion", description: "No se pudo sincronizar." });
        } finally {
            btn.disabled = false; btn.textContent = "ACTUALIZAR DESDE SUPABASE";
        }
    });

    try {
        /* 1) Carga instantanea: solo el espejo local */
        const resLoc = await fetch("php/api/get/sucursalLocal/route.php");
        const dataLoc = await resLoc.json();

        if (dataLoc.status === "error") {
            cont.innerHTML = `<p>${dataLoc.message}</p>`;
            console.error(dataLoc.message);
            return;
        }

        const lista = dataLoc.data || [];

        /* 2) Panel de pendientes de subir (tambien local) */
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
            const pendiente = Number(s.id_sucursal) >= 1000;
            html += `
                <tr>
                    <td class="pb t5">${s.id_sucursal}</td>
                    <td class="pb pm t10">${s.nombre}${pendiente ? `<span class="badgePend">pendiente</span>` : ""}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${s.id_sucursal}"><img src="img/edit.svg" alt="editar"></button></td>
                    ${esAdmin ? `<td class="pb t3"><button class="btnEliminar listBtn" data-id="${s.id_sucursal}"><img src="img/trash.svg" alt="eliminar"></button></td>` : ""}
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
            <div id="syncLineaSuc" class="syncLinea"><span class="spinner"></span> Verificando con Supabase&hellip;</div>
        `;

        cont.innerHTML = html;

        const byId = new Map(lista.map(s => [String(s.id_sucursal), s]));

        document.querySelectorAll("#tbSucursales .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newSucursalModal(byId.get(btn.dataset.id), sucursalesView));
        });
        document.querySelectorAll("#tbSucursales .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarSucursal(btn.dataset.id));
        });

        document.getElementById("syncAhoraBtn")?.addEventListener("click", async () => {
            await sincronizarAhora();
            sucursalesView();
        });

        actualizarBadgeSuc();

        /* 3) Verificacion contra Supabase en segundo plano (solo lectura) */
        verificarSucursales();

    } catch (error) {
        cont.innerHTML = "<p>Error cargando sucursales</p>";
        console.error(error);
    }
}

/* Lee Supabase y actualiza la linea bajo la tabla. No escribe nada. */
async function verificarSucursales() {
    const linea = document.getElementById("syncLineaSuc");
    if (!linea) return; /* el usuario ya salio de la vista */

    try {
        const res = await fetch("php/api/get/sucursalVerificar/route.php");
        const data = await res.json();
        if (!document.getElementById("syncLineaSuc")) return;

        if (data.status === "error") throw new Error(data.message);

        if (data.offline) {
            linea.classList.add("off");
            linea.innerHTML = "Sin conexion &mdash; datos locales";
            return;
        }
        if (data.diferencias > 0) {
            linea.classList.add("diff");
            linea.innerHTML = `Hay ${data.diferencias} diferencia(s) con la nube`;
            return;
        }

        linea.classList.add("ok");
        linea.innerHTML = "Verificado con Supabase &#10003;";
        setTimeout(() => {
            if (document.getElementById("syncLineaSuc")) linea.classList.add("syncLinea-desvanece");
        }, 2500);
    } catch (e) {
        if (!document.getElementById("syncLineaSuc")) return;
        linea.classList.add("off");
        linea.innerHTML = "No se pudo verificar &mdash; datos locales";
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
            abrirAlert({ mensaje: "El nombre de la sucursal es obligatorio." });
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
                if (result.pendiente) {
                    abrirAlert({ mensaje: "Guardado en este equipo. Se subira a Supabase al reconectar.", titulo: "Sin conexion" });
                }
                onSave();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al guardar la sucursal." });
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
                body: JSON.stringify({ id_sucursal: parseInt(id_sucursal) })
            });
            const result = await res.json();
            if (result.status === "success") {
                if (result.pendiente) {
                    abrirAlert({ mensaje: "Eliminado en este equipo. Se aplicara en Supabase al reconectar.", titulo: "Sin conexion" });
                }
                sucursalesView();
                actualizarBadgeSuc();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}

