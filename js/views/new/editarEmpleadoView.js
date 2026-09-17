import { empleado } from "../entitie/empleado.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { decimalFilter, comillasFilter } from "../../utils.js";
import { strFecha } from "../../utils.js";

export async function editarEmpleado(id_empleado) {

    const resEnt = await fetch(`php/api/get/empleadoEnt/route.php?id_empleado=${encodeURIComponent(id_empleado)}`);
    const ent = await resEnt.json();
    const dt = ent.data;

    if (ent.status === "error" || !dt) {
        abrirAlert({ mensaje: ent.message || "No se encontro el empleado." });
        return;
    }

    const resTipos = await fetch("php/api/get/tipoEmpleado/route.php");
    const tipos = (await resTipos.json()).data || [];

    const hoy = strFecha();
    const fechaContrato = dt.fecha_contrato || hoy;

    const contenido = `
        <div class="modal-fila">
            <label>Nombre Empleado:</label>
            <input type="text" id="eeNombre" value="${dt.empleado}" maxlength="150" placeholder="Nombre y Apellido">
        </div>
        <div class="modal-fila">
            <label>Tipo Empleado:</label>
            <input type="text" id="eeTipo" value="" autocomplete="off" placeholder="${dt.tipo_empleado || 'Seleccione o escriba'}">
        </div>
        <div class="modal-fila">
            <label>Mensual Bs. (opcional):</label>
            <input type="number" id="eeMensual" value="${Number(dt.mensual).toFixed(2)}" min="0" step="0.01">
        </div>
        <div class="modal-fila">
            <label>Fecha Contrato:</label>
            <input type="date" id="eeFecha" value="${fechaContrato}">
        </div>
        <div class="modal-fila">
            <label>Estado:</label>
            <select id="eeEstado">
                <option value="Activo" ${dt.estado === "Activo" ? "selected" : ""}>Activo</option>
                <option value="Baja" ${dt.estado === "Baja" ? "selected" : ""}>Baja</option>
            </select>
        </div>
    `;

    let acTipo = null;

    const resultado = abrirModal({
        titulo: "EDITAR EMPLEADO",
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nNombre = document.getElementById("eeNombre").value.trim();
            const nMensual = document.getElementById("eeMensual").value;
            const nFecha = document.getElementById("eeFecha").value;
            const nEstado = document.getElementById("eeEstado").value;

            const t = acTipo ? acTipo.obtener() : { id: null, label: "" };

            if (!nNombre) {
                abrirAlert({ mensaje: "El nombre del empleado es obligatorio." });
                return;
            }
            if (!t.id) {
                abrirAlert({ mensaje: "Seleccione un tipo de empleado valido." });
                return;
            }
            const mensual = nMensual.trim() === "" ? 0.00 : parseFloat(nMensual);
            if (isNaN(mensual) || mensual < 0) {
                abrirAlert({ mensaje: "Mensual debe ser un numero mayor o igual a 0." });
                return;
            }

            const payload = {
                id_empleado: Number(id_empleado),
                nombre: nNombre,
                id_te: Number(t.id),
                mensual,
                fecha_contrato: nFecha || null,
                estado: nEstado
            };

            try {
                const res = await fetch("php/api/store/empleadoEditar/route.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status !== "success") {
                    abrirAlert({ mensaje: "Error al actualizar: " + result.message });
                    return;
                }
                cerrar();
                empleado(id_empleado);
            } catch (error) {
                abrirAlert({ mensaje: "Error al actualizar el empleado." });
            }
        }
    });

    acTipo = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#eeTipo"),
        opciones: tipos.map(t => ({ id: t.id_te, label: t.tipo_empleado })),
        valorActual: dt.tipo_empleado || "",
        onCambio: null
    });

    const inpNombre = resultado.overlay.querySelector("#eeNombre");
    if (inpNombre) inpNombre.addEventListener("keydown", comillasFilter);

    const inpTipo = resultado.overlay.querySelector("#eeTipo");
    if (inpTipo) inpTipo.addEventListener("keydown", comillasFilter);

    const inpMensual = resultado.overlay.querySelector("#eeMensual");
    if (inpMensual) inpMensual.addEventListener("keydown", decimalFilter);
}