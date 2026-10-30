import { flotasListView } from "../flotasListView.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { validarPlaca, validarPropietario, placaFilter, estadoAceiteClase, flotaGradiente, colorTextoFlota } from "../../utils.js";
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

        const h2Flota = title.querySelector("h2");
        if (h2Flota) {
            h2Flota.classList.add("titulo-placa");
            h2Flota.innerHTML = `DETALLE de FLOTA <span class="placa-badge placa-badge-titulo" style="background:${flotaGradiente(dt.color1, dt.color2)};color:${colorTextoFlota(dt.color1, dt.color2, dt.color_texto)}">${dt.placa}</span>`;
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
                        <td class="pb t8"><span class="placa-badge" style="background:${flotaGradiente(dt.color1, dt.color2)};color:${colorTextoFlota(dt.color1, dt.color2, dt.color_texto)}">${dt.placa}</span></td>
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
                <p>ACEITE:</p>
                <p>Capacidad Maxima: ${dt.capacidad_aceite} lt</p>
                <p>Aceite Actual ${dt.aceite_actual} lt</p>
                <div class="aceite-viajes-row">
                    <label class="estadoAceite ${estadoAceiteClase(dt.viajes_aceite)}">${dt.viajes_aceite}v.</label>
                    <button class="btnEditarAceite listBtn" data-placa="${dt.placa}" title="Editar aceite"><img src="img/edit.svg" alt="editar"></button>
                </div>
            </div>
            <hr>
            <div id="seccionRuedasFlota"></div>
        `;
        cont.innerHTML = html;

        cargarSeccionRuedasFlota(placa);

        document.querySelector("#tbFlotaEnt .btnEditar").addEventListener("click", function() {
            editarFlota(this.dataset.id);
        });

        const btnAceite = document.querySelector(".btnEditarAceite");
        if (btnAceite) {
            btnAceite.addEventListener("click", () => editarAceiteFlota(dt.placa, dt));
        }

    } catch (error) {
        cont.innerHTML = "<p>Error al Cargar Flotas</p>";
        console.error(error);
    }
}

async function editarFlota(placa) {

    const [resFlota, resEmp1, resEmp2, resUbi, resEst] = await Promise.all([
        fetch(`php/api/get/flotaEnt/route.php?placa=${encodeURIComponent(placa)}`),
        fetch(`php/api/get/personalTipo/route.php?tipo=1`),
        fetch(`php/api/get/personalTipo/route.php?tipo=2`),
        fetch(`php/api/get/destinos/route.php`),
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
        <div class="modal-fila">
            <label>Color 1:</label>
            <input type="color" id="edColor1" value="${dt.color1 || '#6366f1'}">
        </div>
        <div class="modal-fila">
            <label>Color 2 (opcional):</label>
            <input type="color" id="edColor2" value="${dt.color2 || dt.color1 || '#6366f1'}">
        </div>
        <div class="modal-fila">
            <label><input type="checkbox" id="edColorTextoAuto" ${dt.color_texto ? '' : 'checked'}> Color de texto automático</label>
        </div>
        <div class="modal-fila" id="edColorTextoWrap" style="display:${dt.color_texto ? 'flex' : 'none'};">
            <label>Color texto:</label>
            <input type="color" id="edColorTexto" value="${dt.color_texto || '#ffffff'}">
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
                id_u: u.tocado ? (Number(u.id) || 0) : origUbi,
                color1: document.getElementById("edColor1").value,
                color2: (document.getElementById("edColor2").value === document.getElementById("edColor1").value) ? '' : document.getElementById("edColor2").value,
                color_texto: document.getElementById("edColorTextoAuto").checked ? null : document.getElementById("edColorTexto").value
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
        opciones: emp1.map(e => ({ id: e.id_personal, label: e.nombre_apellido })),
        valorActual: dt.chofer1_nombre,
        onCambio: null
    });

    acChofer2 = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#edChofer2"),
        opciones: emp2.map(e => ({ id: e.id_personal, label: e.nombre_apellido })),
        valorActual: dt.chofer2_nombre === 'Sin Asignar' ? "" : dt.chofer2_nombre,
        onCambio: null
    });

    acUbi = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#edUbicacion"),
        opciones: ubicaciones.map(u => ({ id: u.id, label: u.nombre_destino })),
        valorActual: dt.ubicacion === 'Sin ubicacion' ? "" : dt.ubicacion,
        onCambio: null
    });
    const autoCbEd = resultado.overlay.querySelector("#edColorTextoAuto");
    const wrapEd = resultado.overlay.querySelector("#edColorTextoWrap");
    if (autoCbEd && wrapEd) {
        autoCbEd.addEventListener("change", () => {
            wrapEd.style.display = autoCbEd.checked ? "none" : "flex";
        });
    }
}

async function editarAceiteFlota(placa, dt) {
    const contenido = `
        <div class="modal-fila">
            <label>Capacidad maxima (lt):</label>
            <input type="number" id="edCapacidadAceite" value="${dt.capacidad_aceite}" step="0.001" min="0">
        </div>
        <div class="modal-fila">
            <label>Viajes desde cambio:</label>
            <input type="number" id="edViajesAceite" value="${dt.viajes_aceite}" step="1" min="0">
        </div>
        <div class="modal-fila">
            <label>Aceite actual (lt):</label>
            <input type="text" id="edAceiteActual" value="${dt.aceite_actual}" readonly>
        </div>
    `;

    const resultado = abrirModal({
        titulo: `EDITAR ACEITE ${placa}`,
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const capacidad = parseFloat(document.getElementById("edCapacidadAceite").value);
            const viajes = parseInt(document.getElementById("edViajesAceite").value, 10);

            if (isNaN(capacidad) || capacidad < 0) {
                abrirAlert({ mensaje: "Capacidad invalida." });
                return;
            }
            if (isNaN(viajes) || viajes < 0) {
                abrirAlert({ mensaje: "Viajes invalidos." });
                return;
            }

            const res = await fetch("php/api/store/flotaAceiteEditar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    placa: placa,
                    capacidad_aceite: capacidad,
                    viajes_aceite: viajes
                })
            });

            const result = await res.json();
            if (result.status === "success") {
                cerrar();
                flota(placa);
            } else {
                abrirAlert({ mensaje: "Error al guardar: " + result.message });
            }
        }
    });

    const capInput = resultado.overlay.querySelector("#edCapacidadAceite");
    const viajesInput = resultado.overlay.querySelector("#edViajesAceite");
    const actualInput = resultado.overlay.querySelector("#edAceiteActual");

    const recalcular = () => {
        const cap = parseFloat(capInput.value) || 0;
        const v = parseInt(viajesInput.value, 10) || 0;
        const lpv = cap > 0 ? cap / 17 : 0;
        let actual = cap - (lpv * v);
        if (actual < 0) actual = 0;
        if (actual > cap) actual = cap;
        actualInput.value = Number(actual.toFixed(3));
    };

    if (capInput && viajesInput && actualInput) {
        capInput.addEventListener("input", recalcular);
        viajesInput.addEventListener("input", recalcular);
        recalcular();
    }
}



