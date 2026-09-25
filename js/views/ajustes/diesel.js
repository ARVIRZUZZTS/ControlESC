import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { decimalFilter, comillasFilter, strFechaDMY, fechaISOToDMY, fechaDMYToISO, fechaFilter, fechaMask } from "../../utils.js";

export async function dieselView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>DIESEL</h2>
        </div>
        <button id="newDieselBtn"><img src="img/plus.svg" alt="Nuevo"> Diesel</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newDieselBtn").addEventListener("click", () => newDieselModal(null, dieselView));

    try {
        const res = await fetch("php/views/diesel.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbDiesel">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t8">Precio x Litro Bs.</th>
                        <th class="th t8">Fecha Guardado</th>
                        <th class="th t8">Litros Comprados</th>
                        <th class="th t8">Precio Total Pagado Bs.</th>
                        <th class="th t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(d => {
            html += `
                <tr>
                    <td class="pb t5">${d.id_diesel}</td>
                    <td class="pb pm t8">${d.precio_x_litro}</td>
                    <td class="pb pm t8">${fechaISOToDMY(d.fecha_guardado) || "-"}</td>
                    <td class="pb pm t8">${d.litros_comprados_totales}</td>
                    <td class="pb pm t8">${d.precio_total_pagado}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${d.id_diesel}"><img src="img/edit.svg" alt="editar"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${d.id_diesel}"><img src="img/trash.svg" alt="eliminar"></button></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(data.map(d => [String(d.id_diesel), d]));

        document.querySelectorAll("#tbDiesel .btnEditar").forEach(btn => {
            btn.addEventListener("click", () => newDieselModal(byId.get(btn.dataset.id), dieselView));
        });
        document.querySelectorAll("#tbDiesel .btnEliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarDiesel(btn.dataset.id));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando diesel</p>";
        console.error(error);
    }
}

function newDieselModal(diesel, onSave) {
    const editando = !!diesel;
    const hoy = strFechaDMY();

    const contenidoHTML = `
        <form id="formDiesel">
            <div class="modal-fila">
                <label>Precio x Litro Bs.:</label>
                <input type="number" name="precio_x_litro" step="0.01" min="0" placeholder="0.00" required value="${editando ? diesel.precio_x_litro : ""}">
            </div>
            <div class="modal-fila">
                <label>Fecha Guardado:</label>
                <input type="text" name="fecha_guardado" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" value="${editando ? (fechaISOToDMY(diesel.fecha_guardado) || hoy) : hoy}" required>
            </div>
        </form>
    `;

    const resultado = abrirModal({
        titulo: editando ? "EDITAR DIESEL" : "NUEVO DIESEL",
        contenidoHTML: contenidoHTML,
        onSubmit: () => {
            const form = resultado.overlay.querySelector("#formDiesel");
            if (form) form.requestSubmit();
        }
    });

    const form = resultado.overlay.querySelector("#formDiesel");
    const inFechaGuardado = form.querySelector('input[name="fecha_guardado"]');

    form.querySelector('input[name="precio_x_litro"]').addEventListener("keydown", decimalFilter);
    inFechaGuardado.addEventListener("keydown", fechaFilter);
    inFechaGuardado.addEventListener("input", fechaMask);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            precio_x_litro: parseFloat(form.querySelector('input[name="precio_x_litro"]').value),
            fecha_guardado: fechaDMYToISO(inFechaGuardado.value) || null
        };
        if (editando) {
            payload.id_diesel = diesel.id_diesel;
            payload.estado = diesel.estado || 'activo';
        }

        const url = editando ? "php/api/store/dieselEditar/route.php" : "php/api/store/diesel/route.php";

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
            abrirAlert({ mensaje: "Error al guardar diesel." });
        }
    });
}

function eliminarDiesel(id_diesel) {
    abrirEliminar({
        titulo: "Eliminar Diesel",
        mensaje: "Esta seguro que quiere dar de baja este registro de diesel?",
        botonEliminar: "BAJA",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/dieselEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_diesel: parseInt(id_diesel) })
            });
            const result = await res.json();
            if (result.status === "success") {
                dieselView();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}