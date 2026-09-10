import { flotasListView } from "../flotasListView.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { validarPlaca, validarPropietario, placaFilter } from "../../utils.js";
import { cargarSeccionRuedasFlota } from "./ruedasFlota.js";

export async function flota(placa) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>DETALLE de FLOTA ${placa}</h2>
        </div>
    `;
    title.innerHTML = titleHtml;
    document.getElementById("backBtn").addEventListener("click", flotasListView);

    try {
        const res = await fetch(`php/api/get/flotaEnt/route.php?placa=${encodeURIComponent(placa)}`);
        const data = await res.json();
        const dt = data.data;
        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbFlotaEnt">
                <thead>
                    <tr>
                        <th class="thl t8">Placa</th>
                        <th class="t10">Propietario</th>
                        <th class="t10">Chofer 1</th>
                        <th class="t10">Chofer 2</th>
                        <th class="t5">Estado</th>
                        <th class="t10">Ubicacion</th>
                        <th class="t5">Viajes</th>
                        <th class="thr t3">Editar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pb t8">${dt.placa}</td>
                        <td class="pb pm t10">${dt.propietario}</td>
                        <td class="pb pm t10">${dt.chofer1_nombre}</td>
                        <td class="pb pm t10">${dt.chofer2_nombre}</td>
                        <td class="pb pm t5">${dt.estado}</td>
                        <td class="pb pm t10">${dt.ubicacion}</td>
                        <td class="pb pm t5">${dt.viajes}</td>
                        <td class="pb t3"><button class="btnEditar listBtn" data-id="${dt.placa}"><img src="img/edit.svg" alt="editar"></button></td>
                    </tr>
                </tbody>
            </table>
            <hr>
            <div class="highlight">
                <p>Aceite:</p>
                <label id="estadoAceite">${dt.aceite}</label>
            </div>
            <hr>
            <div id="seccionRuedasFlota"></div>
        `;
        cont.innerHTML = html;

        cargarSeccionRuedasFlota(placa);

        document.querySelector("#tbFlotaEnt .btnEditar").addEventListener("click", function() {
            editarFlota(this.dataset.id);
        });

    } catch (error) {
        cont.innerHTML = "<p>Error al Cargar Flotas</p>";
        console.error(error);
    }
}

async function editarFlota(placa) {

    const [resFlota, resEmp1, resEmp2, resUbi, resEst] = await Promise.all([
        fetch(`php/api/get/flotaEnt/route.php?placa=${encodeURIComponent(placa)}`),
        fetch(`php/api/get/empleadosTipo/route.php?tipo=1`),
        fetch(`php/api/get/empleadosTipo/route.php?tipo=2`),
        fetch(`php/api/get/ubicaciones/route.php`),
        fetch(`php/api/get/flotaEstados/route.php`)
    ]);

    const dataFlota = await resFlota.json();
    const dt = dataFlota.data;

    const emp1 = (await resEmp1.json()).data || [];
    const emp2 = (await resEmp2.json()).data || [];
    const ubicaciones = (await resUbi.json()).data || [];
    const estados = (await resEst.json()).data || [];

    const optEst = estados.map(es => `<option value="${es.id_fe}" ${Number(es.id_fe) === Number(dt.id_fe) ? "selected" : ""}>${es.nombre_estado_flota}</option>`).join("");

    const contenido = `
        <div class="modal-fila">
            <label>Placa:</label>
            <input type="text" id="edPlaca" value="${dt.placa}" maxlength="10" placeholder="0000-AAA"
                onkeydown="event.isTrusted && exePlacaFilter(event)">
        </div>
        <div class="modal-fila">
            <label>Propietario:</label>
            <input type="text" id="edPropietario" value="${dt.propietario}" maxlength="100">
        </div>
        <div class="modal-fila">
            <label>Chofer 1:</label>
            <input type="text" id="edChofer1" value="" autocomplete="off" placeholder="${dt.chofer1_nombre}">
        </div>
        <div class="modal-fila">
            <label>Chofer 2:</label>
            <input type="text" id="edChofer2" value="" autocomplete="off" placeholder="${dt.chofer2_nombre === 'Sin Asignar' ? '' : dt.chofer2_nombre}">
        </div>
        <div class="modal-fila">
            <label>Estado:</label>
            <select id="edEstado">
                <option value="0">Sin estado</option>
                ${optEst}
            </select>
        </div>
        <div class="modal-fila">
            <label>Ubicacion:</label>
            <input type="text" id="edUbicacion" value="" autocomplete="off" placeholder="${dt.ubicacion === 'Sin ubicacion' ? '' : dt.ubicacion}">
        </div>
    `;

    window.exePlacaFilter = (event) => placaFilter(event);

    const origChofer1 = Number(dt.chofer1) || 0;
    const origChofer2 = Number(dt.chofer2) || 0;
    const origUbi = Number(dt.id_u) || 0;

    let acChofer1 = null;
    let acChofer2 = null;
    let acUbi = null;

    const resultado = abrirModal({
        titulo: `EDITAR FLOTA ${placa}`,
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nPlaca = document.getElementById("edPlaca").value.trim().toUpperCase();
            const nPropietario = document.getElementById("edPropietario").value.trim();
            const nEstado = document.getElementById("edEstado").value;

            const c1 = acChofer1 ? acChofer1.obtener() : { id: 0, label: "" };
            const c2 = acChofer2 ? acChofer2.obtener() : { id: 0, label: "" };
            const u = acUbi ? acUbi.obtener() : { id: 0, label: "" };

            if (!validarPlaca(nPlaca)) {
                abrirAlert({ mensaje: "Placa invalida. Formato: 3-5 numeros, guion y 3 letras (ej: 3056-EAY)" });
                return;
            }
            if (!validarPropietario(nPropietario)) {
                abrirAlert({ mensaje: "Propietario invalido. Solo letras, maximo 100 caracteres." });
                return;
            }

            const payload = {
                placa: nPlaca,
                propietario: nPropietario,
                chofer1: c1.tocado ? (Number(c1.id) || 0) : origChofer1,
                chofer2: c2.tocado ? (Number(c2.id) || 0) : origChofer2,
                id_fe: Number(nEstado),
                id_u: u.tocado ? (Number(u.id) || 0) : origUbi
            };

            const res = await fetch("php/api/store/flotaEditar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.status === "success") {
                cerrar();
                flota(nPlaca);
            } else {
                abrirAlert({ mensaje: "Error al guardar: " + result.message });
            }
        }
    });

    acChofer1 = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#edChofer1"),
        opciones: emp1.map(e => ({ id: e.id_empleado, label: e.empleado })),
        valorActual: dt.chofer1_nombre,
        onCambio: null
    });

    acChofer2 = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#edChofer2"),
        opciones: emp2.map(e => ({ id: e.id_empleado, label: e.empleado })),
        valorActual: dt.chofer2_nombre === 'Sin Asignar' ? "" : dt.chofer2_nombre,
        onCambio: null
    });

    acUbi = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#edUbicacion"),
        opciones: ubicaciones.map(u => ({ id: u.id_u, label: u.nombre_ubicacion })),
        valorActual: dt.ubicacion === 'Sin ubicacion' ? "" : dt.ubicacion,
        onCambio: null
    });
}
