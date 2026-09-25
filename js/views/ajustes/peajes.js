import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirEliminar } from "../../components/modal.js";
import { decimalFilter, strFechaDMY, fechaISOToDMY, fechaDMYToISO, fechaFilter, fechaMask } from "../../utils.js";

export async function peajesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>PEAJE</h2>
        </div>
        <button id="newPeajeBtn" class="aic"><img src="img/plus.svg" alt="Nuevo"> Peaje</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newPeajeBtn").addEventListener("click", () => newPeajeModal(null, peajesView));

    try {
        const res = await fetch("php/views/peajes.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbPeajes">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="th t8">Precio Subpeaje Bs.</th>
                        <th class="th t8">Fecha Registro</th>
                        <th class="th t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(p => {
            html += `
                <tr>
                    <td class="pb t5">${p.id_subpeaje}</td>
                    <td class="pb pm t8">${p.precio_subpeaje}</td>
                    <td class="pb pm t8">${fechaISOToDMY(p.fecha_registro) || "-"}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${p.id_subpeaje}"><img src="img/edit.svg" alt="editar"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${p.id_subpeaje}"><img src="img/trash.svg" alt="eliminar"></button></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        const byId = new Map(data.map(p => [String(p.id_subpeaje), p]));

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
    const hoy = strFechaDMY();

    const contenidoHTML = `
        <form id="formPeaje">
            <div class="modal-fila">
                <label>Precio Subpeaje Bs.:</label>
                <input type="number" name="precio_subpeaje" step="0.01" min="0" placeholder="0.00" required value="${editando ? peaje.precio_subpeaje : ""}">
            </div>
            <div class="modal-fila">
                <label>Fecha Registro:</label>
                <input type="text" name="fecha_registro" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" value="${editando ? (fechaISOToDMY(peaje.fecha_registro) || hoy) : hoy}" required>
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
    const inPrecio = form.querySelector('input[name="precio_subpeaje"]');
    const inFecha = form.querySelector('input[name="fecha_registro"]');

    inPrecio.addEventListener("keydown", decimalFilter);
    inFecha.addEventListener("keydown", fechaFilter);
    inFecha.addEventListener("input", fechaMask);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const precio = parseFloat(inPrecio.value);
        if (isNaN(precio) || precio < 0) {
            abrirAlert({ mensaje: "El precio del peaje es obligatorio." });
            return;
        }

        const payload = {
            precio_subpeaje: precio,
            fecha_registro: fechaDMYToISO(inFecha.value) || null
        };
        if (editando) payload.id_subpeaje = peaje.id_subpeaje;

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
                onSave();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        } catch (error) {
            abrirAlert({ mensaje: "Error al guardar el peaje." });
        }
    });
}

function eliminarPeaje(id_subpeaje) {
    abrirEliminar({
        titulo: "Eliminar Peaje",
        mensaje: "Esta seguro que quiere eliminar este registro de peaje?",
        botonEliminar: "ELIMINAR",
        onConfirmar: async () => {
            const res = await fetch("php/api/store/peajeEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_subpeaje: parseInt(id_subpeaje) })
            });
            const result = await res.json();
            if (result.status === "success") {
                peajesView();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });
}