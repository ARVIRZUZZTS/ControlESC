import { personal } from "../entitie/personal.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { decimalFilter, comillasFilter } from "../../utils.js";
import { strFecha } from "../../utils.js";

export async function editarPersonal(id_personal) {

    const resEnt = await fetch(`php/api/get/personalEnt/route.php?id_personal=${encodeURIComponent(id_personal)}`);
    const ent = await resEnt.json();
    const dt = ent.data;

    if (ent.status === "error" || !dt) {
        abrirAlert({ mensaje: ent.message || "No se encontro el personal." });
        return;
    }

    const resTipos = await fetch("php/api/get/tipoPersonal/route.php");
    const tipos = (await resTipos.json()).data || [];

    const hoy = strFecha();
    const fechaContrato = dt.fecha_contrato || hoy;

    const contenido = `
        <div class="modal-fila">
            <label>Nombre Personal:</label>
            <input type="text" id="eeNombre" value="${dt.nombre_apellido}" maxlength="150" placeholder="Nombre y Apellido">
        </div>
        <div class="modal-fila">
            <label>Tipo Personal:</label>
            <input type="text" id="eeTipo" value="" autocomplete="off" placeholder="${dt.tipo_personal || 'Seleccione o escriba'}">
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
        titulo: "EDITAR PERSONAL",
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nNombre = document.getElementById("eeNombre").value.trim();
            const nMensual = document.getElementById("eeMensual").value;
            const nFecha = document.getElementById("eeFecha").value;
            const nEstado = document.getElementById("eeEstado").value;

            const t = acTipo ? acTipo.obtener() : { id: null, label: "" };

            if (!nNombre) {
                abrirAlert({ mensaje: "El nombre del personal es obligatorio." });
                return;
            }
            if (!t.id) {
                abrirAlert({ mensaje: "Seleccione un tipo de personal valido." });
                return;
            }
            const mensual = nMensual.trim() === "" ? 0.00 : parseFloat(nMensual);
            if (isNaN(mensual) || mensual < 0) {
                abrirAlert({ mensaje: "Mensual debe ser un numero mayor o igual a 0." });
                return;
            }

            const payload = {
                id_personal: Number(id_personal),
                nombre: nNombre,
                id_te: Number(t.id),
                mensual,
                fecha_contrato: nFecha || null,
                estado: nEstado
            };

            try {
                const res = await fetch("php/api/store/personalEditar/route.php", {
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
                personal(id_personal);
            } catch (error) {
                abrirAlert({ mensaje: "Error al actualizar el personal." });
            }
        }
    });

    acTipo = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#eeTipo"),
        opciones: tipos.map(t => ({ id: t.id_te, label: t.nombre_tipo_personal })),
        valorActual: dt.tipo_personal || "",
        onCambio: null
    });

    const inpNombre = resultado.overlay.querySelector("#eeNombre");
    if (inpNombre) inpNombre.addEventListener("keydown", comillasFilter);

    const inpTipo = resultado.overlay.querySelector("#eeTipo");
    if (inpTipo) inpTipo.addEventListener("keydown", comillasFilter);

    const inpMensual = resultado.overlay.querySelector("#eeMensual");
    if (inpMensual) inpMensual.addEventListener("keydown", decimalFilter);
}