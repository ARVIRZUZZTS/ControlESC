import { personalListView } from "../personalListView.js";
import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";
import { decimalFilter, comillasFilter, strFechaDMY, fechaDMYToISO, fechaFilter, fechaMask } from "../../utils.js";

export async function newPersonalView() {

    const resTipos = await fetch("php/api/get/tipoPersonal/route.php");
    const tipos = (await resTipos.json()).data || [];

    const resSucursales = await fetch("php/api/get/sucursal/route.php");
    const sucursales = (await resSucursales.json()).data || [];

    const hoy = strFechaDMY();

    const sucursalOptions = sucursales.map(s =>
        `<option value="${s.id_sucursal}">${s.nombre}</option>`
    ).join("");

    const contenido = `
        <div class="modal-fila">
            <label>Nombre Personal:</label>
            <input type="text" id="neNombre" value="" maxlength="150" placeholder="Nombre y Apellido">
        </div>
        <div class="modal-fila">
            <label>Tipo Personal:</label>
            <input type="text" id="neTipo" value="" autocomplete="off" placeholder="Seleccione o escriba">
        </div>
        <div class="modal-fila" id="neSucursalWrap" style="display:none;">
            <label>Sucursal:</label>
            <select id="neSucursal">
                <option value="">-- Seleccione --</option>
                ${sucursalOptions}
            </select>
        </div>
        <div class="modal-fila">
            <label>Contraseña:</label>
            <input type="text" id="neContrasena" value="" maxlength="20" placeholder="Contraseña">
        </div>
        <div class="modal-fila">
            <label>Mensual Bs. (opcional):</label>
            <input type="number" id="neMensual" value="0.00" min="0" step="0.01">
        </div>
        <div class="modal-fila">
            <label>Fecha Contrato:</label>
            <input type="text" id="neFecha" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" value="${hoy}">
        </div>
    `;

    let acTipo = null;
    let tipoSeleccionado = null;

    function buscarTipo(id) {
        return tipos.find(x => String(x.id_te) === String(id)) || null;
    }

    function requiereSucursal(tipo) {
        return !!tipo && Number(tipo.sucursal) === 1;
    }

    function mostrarSucursal(tipo) {
        const wrap = resultado.overlay.querySelector("#neSucursalWrap");
        if (wrap) {
            wrap.style.display = requiereSucursal(tipo) ? "flex" : "none";
        }
    }

    const resultado = abrirModal({
        titulo: "NUEVO PERSONAL",
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const nNombre = document.getElementById("neNombre").value.trim();
            const nMensual = document.getElementById("neMensual").value;
            const nFecha = document.getElementById("neFecha").value;
            const nContrasena = document.getElementById("neContrasena").value.trim();

            const t = acTipo ? acTipo.obtener() : { id: null, label: "" };
            const tipo = buscarTipo(t.id);

            if (!nNombre) {
                abrirAlert({ mensaje: "El nombre del personal es obligatorio." });
                return;
            }
            if (!t.id || !tipo) {
                abrirAlert({ mensaje: "Seleccione un tipo de personal valido." });
                return;
            }
            if (!nContrasena) {
                abrirAlert({ mensaje: "La contraseña es obligatoria." });
                return;
            }

            let sucursal = null;
            if (requiereSucursal(tipo)) {
                const sucursalVal = document.getElementById("neSucursal").value;
                if (!sucursalVal) {
                    abrirAlert({ mensaje: "Seleccione una sucursal." });
                    return;
                }
                sucursal = parseInt(sucursalVal);
            }

            const mensual = nMensual.trim() === "" ? 0.00 : parseFloat(nMensual);
            if (isNaN(mensual) || mensual < 0) {
                abrirAlert({ mensaje: "Mensual debe ser un numero mayor o igual a 0." });
                return;
            }

            const payload = {
                personal: [{
                    nombre: nNombre,
                    id_te: Number(t.id),
                    mensual,
                    fecha_contrato: fechaDMYToISO(nFecha) || null,
                    sucursal,
                    contrasena: nContrasena
                }]
            };

            const btnAc = resultado.overlay.querySelector(".modal-accept");
            if(btnAc){ btnAc.disabled=true; btnAc.style.opacity=0.6; btnAc.style.cursor="not-allowed"; }
            try {
                const res = await fetch("php/api/store/personalNuevo/route.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status === "offline") {
                    if (btnAc) { btnAc.disabled = false; btnAc.style.opacity = ""; btnAc.style.cursor = ""; }
                    abrirAlert({ mensaje: "Necesita conexion a internet." });
                    return;
                }
                if (result.status !== "success") {
                    if(btnAc){ btnAc.disabled=false; btnAc.style.opacity=""; btnAc.style.cursor=""; }
                    abrirAlert({ mensaje: "Error al guardar: " + result.message });
                    return;
                }
                cerrar();
                personalListView();
            } catch (error) {
                if (btnAc) { btnAc.disabled = false; btnAc.style.opacity = ""; btnAc.style.cursor = ""; }
                abrirAlert({ mensaje: "Necesita conexion a internet." });
            }
        }
    });

    acTipo = autocompleteSeleccion({
        input: resultado.overlay.querySelector("#neTipo"),
        opciones: tipos.map(t2 => ({ id: t2.id_te, label: t2.nombre_tipo_personal })),
        valorActual: "",
        onCambio: ({ id }) => {
            tipoSeleccionado = buscarTipo(id);
            mostrarSucursal(tipoSeleccionado);
        }
    });

    const inpNombre = resultado.overlay.querySelector("#neNombre");
    if (inpNombre) inpNombre.addEventListener("keydown", comillasFilter);

    const inpTipo = resultado.overlay.querySelector("#neTipo");
    if (inpTipo) inpTipo.addEventListener("keydown", comillasFilter);

    const inpMensual = resultado.overlay.querySelector("#neMensual");
    if (inpMensual) inpMensual.addEventListener("keydown", decimalFilter);

    const inpFecha = resultado.overlay.querySelector("#neFecha");
    if (inpFecha) {
        inpFecha.addEventListener("keydown", fechaFilter);
        inpFecha.addEventListener("input", fechaMask);
    }
}