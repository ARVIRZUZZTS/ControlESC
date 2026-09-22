import { gastosView } from "./gastos.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter, decimalFilter } from "../../utils.js";

export async function gastoDetalleView(id_gasto_estimado) {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando Gasto...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>GASTO #${id_gasto_estimado}</h2>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", gastosView);

    try {
        const res = await fetch(`php/api/get/gastoEstimadoInfo/route.php?id_gasto_estimado=${id_gasto_estimado}`);
        const response = await res.json();

        if (response.status === "error") {
            cont.innerHTML = `<p>${response.message}</p>`;
            console.error(response.message);
            return;
        }

        const gasto = response.data || response;
        const detalles = response.detalles || [];

        let html = `
            <table id="tbGastoCabecera">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t20">Titulo</th>
                        <th class="thr t8">Gasto Generico Bs.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb pm t5">${gasto.id_gasto_estimado}</td>
                        <td class="pb pm t20">${gasto.titulo}</td>
                        <td class="pb pm t8">${gasto.gasto_generico}</td>
                    </tr>
                </tbody>
            </table>
        `;

        html += `
            <hr class="loteSeparador">
            <div class="flotaRuedasHeader">
                <h3>Detalles del Gasto</h3>
                <button id="agregarDetallesGastoBtn" class="btnAddDetalle">Añadir Detalle</button>
            </div>
            <table id="tbDetallesGasto">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t15">Detalle</th>
                        <th class="th t8">Gasto Particular Bs.</th>
                        <th class="th t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (detalles.length === 0) {
            html += `
                <tr>
                    <td class="pb pm t5">-</td>
                    <td class="pb pm t15">Sin detalles aun</td>
                    <td class="pb pm t8">-</td>
                    <td class="pb pm t3">-</td>
                    <td class="pb t3">-</td>
                </tr>
            `;
        } else {
            detalles.forEach(d => {
                html += `
                    <tr>
                        <td class="pb t5">${d.id_detalle_estimado}</td>
                        <td class="pb pm t15">${d.detalle}</td>
                        <td class="pb pm t8">${d.gasto_particular}</td>
                        <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${d.id_detalle_estimado}"><img src="img/edit.svg" alt="editar"></button></td>
                        <td class="pb t3"><button class="btnEliminar listBtn" data-id="${d.id_detalle_estimado}"><img src="img/trash.svg" alt="eliminar"></button></td>
                    </tr>
                `;
            });
        }

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        document.getElementById("agregarDetallesGastoBtn").addEventListener("click", () => abrirDetalleEstimadoModal(id_gasto_estimado));

        const byId = new Map(detalles.map(d => [String(d.id_detalle_estimado), d]));

        document.querySelectorAll("#tbDetallesGasto .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => editarDetalleEstimadoModal(byId.get(btn.dataset.id), () => gastoDetalleView(id_gasto_estimado)));
        });
        document.querySelectorAll("#tbDetallesGasto .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarDetalleEstimado(btn.dataset.id, () => gastoDetalleView(id_gasto_estimado)));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando el gasto</p>";
        console.error(error);
    }
}

function abrirDetalleEstimadoModal(id_gasto_estimado, onSave) {
    const contenidoHTML = `
        <form id="formDetallesGasto">
            <div class="modal-fila modal-fila-aviso">
                <label>Detalles:</label>
                <span class="avisoDetalles">Escriba los detalles del gasto. Una fila por detalle.</span>
            </div>
            <div id="gastoDetallesGenerativo"></div>
            <div class="modal-fila">
                <button type="button" id="addDetalleGastoFila"><img src="img/plus.svg" alt="Nuevo"> Agregar Detalle</button>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: "AGREGAR DETALLES AL GASTO",
        contenidoHTML: contenidoHTML,
        generativo: true,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formDetallesGasto");
            if (form) form.requestSubmit();
        }
    });

    const overlay = resultado.overlay;
    const contDetalles = overlay.querySelector("#gastoDetallesGenerativo");

    let filas = [];

    function renumFila() {
        const filasDom = contDetalles.querySelectorAll(".loteGenerativoFila");
        filasDom.forEach((f, i) => {
            const label = f.querySelector(".loteGenerativoHeader label");
            if (label) label.textContent = `Detalle ${i + 1}`;
        });
    }

    function quitarFila(fila) {
        fila.remove();
        filas = filas.filter(f => f.fila !== fila);
        renumFila();
    }

    function agregarFila() {
        const fila = document.createElement("div");
        fila.className = "loteGenerativoFila";
        const esPrimera = filas.length === 0;
        fila.innerHTML = `
            <div class="loteGenerativoHeader">
                ${esPrimera ? "" : `<button type="button" class="btnQuitarMarca btnQuitarFila">×</button>`}
                <label>Detalle ${filas.length + 1}:</label>
            </div>
            <div class="loteGenerativoCol">
                <input type="text" name="detalle_al[]" maxlength="255" placeholder="Ej: Cambio de rines" />
                <div class="lotegenerativoMarca">
                    <input type="number" step="0.01" name="gasto_particular_al[]" placeholder="Gasto Particular Bs." min="0" />
                </div>
            </div>
        `;
        contDetalles.appendChild(fila);

        const detalle = fila.querySelector('input[name="detalle_al[]"]');
        const gastoParticular = fila.querySelector('input[name="gasto_particular_al[]"]');

        filas.push({ fila, detalle, gastoParticular });

        detalle.addEventListener("keydown", comillasFilter);
        gastoParticular.addEventListener("keydown", decimalFilter);

        if (!esPrimera) {
            fila.querySelector(".btnQuitarFila").addEventListener("click", () => quitarFila(fila));
        }
    }

    overlay.querySelector("#addDetalleGastoFila").addEventListener("click", agregarFila);

    agregarFila();

    const form = overlay.querySelector("#formDetallesGasto");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (filas.length < 1) {
            abrirAlert({ mensaje: "Agrega al menos un detalle." });
            return;
        }
        const sinDetalle = filas.filter(f => !f.detalle.value.trim());
        if (sinDetalle.length > 0) {
            abrirAlert({ mensaje: "Debes colocar el detalle de cada fila." });
            return;
        }

        const detalles = filas.map(f => ({
            detalle: f.detalle.value.trim(),
            gasto_particular: f.gastoParticular.value.trim() === "" ? null : parseFloat(f.gastoParticular.value)
        }));

        const payload = {
            id_gasto_estimado: parseInt(id_gasto_estimado),
            detalles
        };

        try {
            const res = await fetch("php/api/store/detalleEstimado/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.status === "success") {
                resultado.cerrar();
                if (onSave) onSave();
                else gastoDetalleView(id_gasto_estimado);
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al guardar los detalles." });
        }
    });
}

function editarDetalleEstimadoModal(detalle, onSave) {
    const contenidoHTML = `
        <form id="formEditarDetalleGasto">
            <div class="modal-fila">
                <label>Detalle:</label>
                <input type="text" name="detalle" maxlength="255" value="${detalle.detalle}" required>
            </div>
            <div class="modal-fila">
                <label>Gasto Particular Bs.:</label>
                <input type="number" name="gasto_particular" step="0.01" min="0" placeholder="0.00" value="${detalle.gasto_particular !== null && detalle.gasto_particular !== undefined ? detalle.gasto_particular : ""}">
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: "EDITAR DETALLE",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formEditarDetalleGasto");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formEditarDetalleGasto");

    form.querySelector('input[name="detalle"]').addEventListener("keydown", comillasFilter);
    form.querySelector('input[name="gasto_particular"]').addEventListener("keydown", decimalFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const texto = form.querySelector('input[name="detalle"]').value.trim();
        if (!texto) {
            abrirAlert({ mensaje: "El detalle es obligatorio." });
            return;
        }

        const gastoParticular = form.querySelector('input[name="gasto_particular"]').value.trim() === "" ? null : parseFloat(form.querySelector('input[name="gasto_particular"]').value);

        const payload = {
            id_detalle_estimado: detalle.id_detalle_estimado,
            detalle: texto,
            gasto_particular: gastoParticular
        };

        try {
            const res = await fetch("php/api/store/detalleEstimadoEditar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.status === "success") {
                resultado.cerrar();
                if (onSave) onSave();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al editar el detalle." });
        }
    });
}

function eliminarDetalleEstimado(id_detalle_estimado, onSave) {
    abrirEliminar({
        titulo: "Eliminar Detalle",
        mensaje: "Esta seguro que quiere eliminar este detalle del gasto?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/detalleEstimadoEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_detalle_estimado: parseInt(id_detalle_estimado) })
            });
            const result = await res.json();
            if (result.status === "success") {
                if (onSave) onSave();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}