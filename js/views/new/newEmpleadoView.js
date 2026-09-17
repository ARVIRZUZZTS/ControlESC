import { empleadosListView } from "../empleadosListView.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { decimalFilter, comillasFilter } from "../../utils.js";

export async function newEmpleadoView() {

    const resTipos = await fetch("php/api/get/tipoEmpleado/route.php");
    const tipos = (await resTipos.json()).data || [];

    const hoy = new Date().toISOString().split("T")[0];

    const contenido = `
        <div class="modal-fila">
            <label>Nombre Empleado:</label>
            <input type="text" id="neNombre" value="" maxlength="150" placeholder="Nombre y Apellido">
        </div>
        <div class="modal-fila">
            <label>Tipo Empleado:</label>
            <input type="text" id="neTipo" value="" autocomplete="off" placeholder="Seleccione o escriba">
        </div>
        <div class="modal-fila">
            <label>Mensual Bs. (opcional):</label>
            <input type="number" id="neMensual" value="0.00" min="0" step="0.01">
        </div>
        <div class="modal-fila">
            <label>Fecha Contrato:</label>
            <input type="date" id="neFecha" value="${hoy}">
        </div>
    `;

    let acTipo = null;

    const resultado = abrirModal({
        titulo: "NUEVO EMPLEADO",
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nNombre = document.getElementById("neNombre").value.trim();
            const nMensual = document.getElementById("neMensual").value;
            const nFecha = document.getElementById("neFecha").value;

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
                empleados: [{
                    nombre: nNombre,
                    id_te: Number(t.id),
                    mensual,
                    fecha_contrato: nFecha || null
                }]
            };

            try {
                const res = await fetch("php/api/store/empleadoNuevo/route.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status !== "success") {
                    abrirAlert({ mensaje: "Error al guardar: " + result.message });
                    return;
                }
                cerrar();
                empleadosListView();
            } catch (error) {
                abrirAlert({ mensaje: "Error al guardar el empleado." });
            }
        }
    });

    acTipo = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#neTipo"),
        opciones: tipos.map(t2 => ({ id: t2.id_te, label: t2.tipo_empleado })),
        valorActual: "",
        onCambio: null
    });

    const inpNombre = resultado.overlay.querySelector("#neNombre");
    if (inpNombre) inpNombre.addEventListener("keydown", comillasFilter);

    const inpTipo = resultado.overlay.querySelector("#neTipo");
    if (inpTipo) inpTipo.addEventListener("keydown", comillasFilter);

    const inpMensual = resultado.overlay.querySelector("#neMensual");
    if (inpMensual) inpMensual.addEventListener("keydown", decimalFilter);
}