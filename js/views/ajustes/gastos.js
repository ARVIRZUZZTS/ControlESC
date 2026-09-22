import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { comillasFilter, decimalFilter } from "../../utils.js";
import { gastoDetalleView } from "./gastoDetalle.js";

export async function gastosView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>GASTOS</h2>
        </div>
        <button id="newGastoBtn"><img src="img/plus.svg" alt="Nuevo"> Gasto</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newGastoBtn").addEventListener("click", () => newGastoModal(null, gastosView));

    try {
        const res = await fetch("php/views/gastos.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbGastos">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th20">Titulo</th>
                        <th class="th t8">Gasto Generico Bs.</th>
                        <th class="th t5">N° Detalles</th>
                        <th class="th t3">Editar</th>
                        <th class="th t3">Eliminar</th>
                        <th class="thr t3">Info</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(g => {
            html += `
                <tr>
                    <td class="pb t5">${g.id_gasto_estimado}</td>
                    <td class="pb pm t20">${g.titulo}</td>
                    <td class="pb pm t8">${g.gasto_generico}</td>
                    <td class="pb pm t5">${g.cant_detalles}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${g.id_gasto_estimado}"><img src="img/edit.svg" alt="editar"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${g.id_gasto_estimado}"><img src="img/trash.svg" alt="eliminar"></button></td>
                    <td class="pb t3"><button class="btnInfo listBtn" data-id="${g.id_gasto_estimado}"><img src="img/info.svg" alt="info"></button></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(data.map(g => [String(g.id_gasto_estimado), g]));

        document.querySelectorAll("#tbGastos .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newGastoModal(byId.get(btn.dataset.id), gastosView));
        });
        document.querySelectorAll("#tbGastos .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarGasto(btn.dataset.id));
        });
        document.querySelectorAll("#tbGastos .btnInfo").forEach(btn => {
            btn.addEventListener("click", () => gastoDetalleView(parseInt(btn.dataset.id)));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando gastos</p>";
        console.error(error);
    }
}

function newGastoModal(gasto, onSave) {
    const editando = !!gasto;

    const contenidoHTML = `
        <form id="formGasto">
            <div class="modal-fila">
                <label>Titulo:</label>
                <input type="text" name="titulo" value="${editando ? gasto.titulo : ""}" maxlength="100" placeholder="Ej: Mecanico" required>
            </div>
            <div class="modal-fila">
                <label>Gasto Generico Bs.:</label>
                <input type="number" name="gasto_generico" step="0.01" min="0" placeholder="0.00" value="${editando && gasto.gasto_generico !== null ? gasto.gasto_generico : ""}">
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR GASTO" : "NUEVO GASTO",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formGasto");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formGasto");
    const inpTitulo = form.querySelector('input[name="titulo"]');
    const inpGasto = form.querySelector('input[name="gasto_generico"]');

    inpTitulo.addEventListener("keydown", comillasFilter);
    inpGasto.addEventListener("keydown", decimalFilter);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const titulo = inpTitulo.value.trim();
        if (!titulo) {
            abrirAlert({ mensaje: "El titulo del gasto es obligatorio." });
            return;
        }

        const gastoGenerico = inpGasto.value.trim() === "" ? null : parseFloat(inpGasto.value);

        const payload = {
            titulo: titulo,
            gasto_generico: gastoGenerico
        };
        if (editando) payload.id_gasto_estimado = gasto.id_gasto_estimado;

        const url = editando ? "php/api/store/gastoEstimadoEditar/route.php" : "php/api/store/gastoEstimado/route.php";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.status === "success") {
                resultado.cerrar();
                if (editando) {
                    onSave();
                } else {
                    gastoDetalleView(result.id);
                }
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al guardar el gasto." });
        }
    });
}

function eliminarGasto(id_gasto_estimado) {
    abrirEliminar({
        titulo: "Eliminar Gasto",
        mensaje: "Esta seguro que quiere eliminar este gasto y todos sus detalles?",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/gastoEstimadoEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_gasto_estimado: parseInt(id_gasto_estimado) })
            });
            const result = await res.json();
            if (result.status === "success") {
                gastosView();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}