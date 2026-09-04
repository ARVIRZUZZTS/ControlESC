import { flotasListView } from "../flotasListView.js";
import { abrirModal, abrirAlert, abrirConfirmation } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { validarPlaca, validarPropietario, placaFilter } from "../../utils.js";

export async function newFlotaView() {

    const [resEmp1, resEmp2, resUbi, resEst] = await Promise.all([
        fetch("php/api/get/empleadosTipo/route.php?tipo=1"),
        fetch("php/api/get/empleadosTipo/route.php?tipo=2"),
        fetch("php/api/get/ubicaciones/route.php"),
        fetch("php/api/get/flotaEstados/route.php")
    ]);

    const emp1 = (await resEmp1.json()).data || [];
    const emp2 = (await resEmp2.json()).data || [];
    const ubicaciones = (await resUbi.json()).data || [];
    const estados = (await resEst.json()).data || [];

    const optEst = estados.map(es => `<option value="${es.id_fe}">${es.nombre_estado_flota}</option>`).join("");

    const contenido = `
        <div class="modal-fila">
            <label>Placa:</label>
            <input type="text" id="nuPlaca" value="" maxlength="10" placeholder="0000-AAA"
                onkeydown="event.isTrusted && exePlacaFilter(event)">
        </div>
        <div class="modal-fila">
            <label>Propietario:</label>
            <input type="text" id="nuPropietario" value="" maxlength="100" placeholder="Nombre y Apellido">
        </div>
        <div class="modal-fila">
            <label>Chofer 1:</label>
            <input type="text" id="nuChofer1" value="" autocomplete="off" placeholder="Seleccione o escriba">
        </div>
        <div class="modal-fila">
            <label>Chofer 2:</label>
            <input type="text" id="nuChofer2" value="" autocomplete="off" placeholder="Seleccione o escriba">
        </div>
        <div class="modal-fila">
            <label>Estado:</label>
            <select id="nuEstado">
                <option value="0">Sin estado</option>
                ${optEst}
            </select>
        </div>
        <div class="modal-fila">
            <label>Ubicacion:</label>
            <input type="text" id="nuUbicacion" value="" autocomplete="off" placeholder="Seleccione o escriba">
        </div>
    `;

    window.exePlacaFilter = (event) => placaFilter(event);

    let acChofer1 = null;
    let acChofer2 = null;
    let acUbi = null;

    const resultado = abrirModal({
        titulo: "NUEVA FLOTA",
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nPlaca = document.getElementById("nuPlaca").value.trim().toUpperCase();
            const nPropietario = document.getElementById("nuPropietario").value.trim();
            const nEstado = document.getElementById("nuEstado").value;

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

            const pendientesCrear = [];
            const tipos = { chofer1: "Chofer Principal", chofer2: "Chofer Auxiliar" };

            const resolverChofer = (chofer, tipo) =>
                new Promise((resolve, reject) => {
                    if (!chofer.tocado || (chofer.id && Number(chofer.id) > 0)) {
                        resolve(chofer.id && Number(chofer.id) > 0 ? Number(chofer.id) : 0);
                    } else {
                        const nombreNuevo = chofer.label.trim();
                        const mensaje = `Seguro que quieres registrar a: ${nombreNuevo}? No esta registrado en ${tipos[tipo]}.`;
                        abrirConfirmation({
                            titulo: "Confirmar Empleado",
                            mensaje,
                            botonAceptar: "GUARDAR",
                            onAceptar: () => {
                                pendientesCrear.push({ nombre: nombreNuevo, id_te: tipo === "chofer1" ? 1 : 2 });
                                resolve(0);
                            },
                            onCancelar: () => {
                                reject("cancelado");
                            }
                        });
                    }
                });

            let chofer1Id;
            let chofer2Id;
            try {
                chofer1Id = await resolverChofer(c1, "chofer1");
                chofer2Id = await resolverChofer(c2, "chofer2");
            } catch (err) {
                if (err === "cancelado") return;
                return;
            }

            try {
                if (pendientesCrear.length > 0) {
                    const resEmp = await fetch("php/api/store/empleadoNuevo/route.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ empleados: pendientesCrear })
                    });
                    const empResult = await resEmp.json();
                    if (empResult.status !== "success") {
                        abrirAlert({ mensaje: "Error al registrar empleado: " + empResult.message });
                        return;
                    }
                    const idsCreados = empResult.empleados || [];
                    let idx = 0;
                    if (pendientesCrear[0].id_te === 1) chofer1Id = idsCreados[idx++].id_empleado;
                    if (pendientesCrear.length > 1 && pendientesCrear[1].id_te === 2) {
                        if (idx < idsCreados.length) chofer2Id = idsCreados[idx].id_empleado;
                    }
                }

                const payload = {
                    placa: nPlaca,
                    propietario: nPropietario,
                    chofer1: chofer1Id || 0,
                    chofer2: chofer2Id || 0,
                    id_fe: Number(nEstado),
                    id_u: u.tocado ? (Number(u.id) || 0) : 0
                };

                const res = await fetch("php/api/store/flotaNueva/route.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                if (result.status === "success") {
                    cerrar();
                    flotasListView();
                } else {
                    abrirAlert({ mensaje: "Error al guardar: " + result.message });
                }
            } catch (error) {
                abrirAlert({ mensaje: "Error al guardar la flota." });
            }
        }
    });

    acChofer1 = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#nuChofer1"),
        opciones: emp1.map(e => ({ id: e.id_empleado, label: e.empleado })),
        valorActual: "",
        onCambio: null
    });

    acChofer2 = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#nuChofer2"),
        opciones: emp2.map(e => ({ id: e.id_empleado, label: e.empleado })),
        valorActual: "",
        onCambio: null
    });

    acUbi = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#nuUbicacion"),
        opciones: ubicaciones.map(u2 => ({ id: u2.id_u, label: u2.nombre_ubicacion })),
        valorActual: "",
        onCambio: null
    });
}