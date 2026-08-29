import { flotasListView } from "../flotasListView.js";
import { abrirModal } from "../../components/modal.js";
import { validarPlaca, validarPropietario, placaFilter } from "../../utils.js";

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
        `;
        cont.innerHTML = html;

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

    const optEmp1 = emp1.map(e => `<option value="${e.empleado}"></option>`).join("");
    const optEmp2 = emp2.map(e => `<option value="${e.empleado}"></option>`).join("");
    const optUbi = ubicaciones.map(u => `<option value="${u.nombre_ubicacion}"></option>`).join("");
    const optEst = estados.map(es => `<option value="${es.id_fe}" ${Number(es.id_fe) === Number(dt.id_fe) ? "selected" : ""}>${es.nombre_estado_flota}</option>`).join("");

    const contenido = `
        <datalist id="datalistEmp1">${optEmp1}</datalist>
        <datalist id="datalistEmp2">${optEmp2}</datalist>
        <datalist id="datalistUbi">${optUbi}</datalist>
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
            <input type="text" id="edChofer1" list="datalistEmp1" value="${dt.chofer1_nombre}" autocomplete="off">
        </div>
        <div class="modal-fila">
            <label>Chofer 2:</label>
            <input type="text" id="edChofer2" list="datalistEmp2" value="${dt.chofer2_nombre === 'Sin Asignar' ? '' : dt.chofer2_nombre}" autocomplete="off">
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
            <input type="text" id="edUbicacion" list="datalistUbi" value="${dt.ubicacion === 'Sin ubicacion' ? '' : dt.ubicacion}" autocomplete="off">
        </div>
    `;

    window.exePlacaFilter = (event) => placaFilter(event);

    abrirModal({
        titulo: `EDITAR FLOTA ${placa}`,
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nPlaca = document.getElementById("edPlaca").value.trim().toUpperCase();
            const nPropietario = document.getElementById("edPropietario").value.trim();
            const nChofer1 = document.getElementById("edChofer1").value.trim();
            const nChofer2 = document.getElementById("edChofer2").value.trim();
            const nEstado = document.getElementById("edEstado").value;
            const nUbicacion = document.getElementById("edUbicacion").value.trim();

            if (!validarPlaca(nPlaca)) {
                alert("Placa invalida. Formato: 3-5 numeros, guion y 3 letras (ej: 3056-EAY)");
                return;
            }
            if (!validarPropietario(nPropietario)) {
                alert("Propietario invalido. Solo letras, maximo 100 caracteres.");
                return;
            }

            const mapear = (nombre, lista) => {
                if (!nombre) return 0;
                const encontrado = lista.find(x => x.empleado === nombre);
                return encontrado ? Number(encontrado.id_empleado) : 0;
            };
            const mapearUbi = (nombre, lista) => {
                if (!nombre) return 0;
                const encontrado = lista.find(x => x.nombre_ubicacion === nombre);
                return encontrado ? Number(encontrado.id_u) : 0;
            };

            const payload = {
                placa: nPlaca,
                propietario: nPropietario,
                chofer1: mapear(nChofer1, emp1),
                chofer2: mapear(nChofer2, emp2),
                id_fe: Number(nEstado),
                id_u: mapearUbi(nUbicacion, ubicaciones)
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
                alert("Error al guardar: " + result.message);
            }
        }
    });
}
