import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";

export async function asignarAceiteModal({ id_ad, unidad, conversion, disponible, onSuccess = null } = {}) {

    const placasRes = await fetch("php/api/get/placasList/route.php");
    const placasResponse = await placasRes.json();
    const placas = placasResponse.data || placasResponse;
    const placasOptions = placas.map(p => ({ id: p.placa, label: p.placa }));

    const porc = [0.25, 0.5, 0.75, 1];

    const contenido = `
        <div class="modal-fila">
            <label>Flota (Placa):</label>
            <input type="text" id="asPlaca" value="" autocomplete="off" placeholder="Seleccione o escriba">
        </div>
        <div class="modal-fila" id="asCapacidadWrap">
            <label>Capacidad:</label>
            <span id="asCapacidad">-- litros disponibles</span>
        </div>
        <div class="modal-fila">
            <label>Porcentaje:</label>
            <div class="asPorc">
                ${porc.map(p => `<button type="button" class="btnAsPorc" data-p="${p}">${Math.round(p * 100)}%</button>`).join("")}
            </div>
        </div>
        <div class="modal-fila">
            <label>Cantidad:</label>
            <input type="number" id="asCantidad" step="0.001" min="0" placeholder="0" autocomplete="off">
            <label class="asUnidad">${unidad}</label>
        </div>
    `;

    const resultado = abrirModal({
        titulo: "Asignar Aceite a Flota",
        contenidoHTML: contenido,
        onSubmit: async (cerrar) => {
            const placaInput = document.getElementById("asPlaca").value.trim().toUpperCase();
            const cantidad = parseFloat(document.getElementById("asCantidad").value);

            if (!placaInput) {
                abrirAlert({ mensaje: "Debe elegir una flota (placa)." });
                return;
            }
            if (!cantidad || cantidad <= 0) {
                abrirAlert({ mensaje: "Debe colocar una cantidad mayor a cero." });
                return;
            }

            const res = await fetch("php/api/features/aceiteFlota/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_ad, placa: placaInput, cantidad })
            });

            const result = await res.json();
            if (result.status === "success") {
                cerrar();
                if (onSuccess) onSuccess();
            } else {
                abrirAlert({ mensaje: "Error: " + result.message });
            }
        }
    });

    const inpPlaca = resultado.overlay.querySelector("#asPlaca");
    const inpCantidad = resultado.overlay.querySelector("#asCantidad");
    const capSpan = resultado.overlay.querySelector("#asCapacidad");

    const ac = autocompleteSeleccion({
        input: inpPlaca,
        opciones: placasOptions,
        valorActual: "",
        onCambio: async ({ tocado }) => {
            if (!tocado) return;
            const placa = inpPlaca.value.trim().toUpperCase();
            if (!placa) return;
            const res = await fetch(`php/api/get/flotaCapacidad/route.php?placa=${encodeURIComponent(placa)}`);
            const data = await res.json();
            if (data.status === "success") {
                capSpan.textContent = `${data.data.disponible_aceite} litros disponibles de ${data.data.capacidad_aceite}`;
            } else {
                capSpan.textContent = "--";
            }
        }
    });

    resultado.overlay.querySelectorAll(".btnAsPorc").forEach(btn => {
        btn.addEventListener("click", () => {
            const p = parseFloat(btn.dataset.p);
            const cantidad = disponible * p;
            inpCantidad.value = (Math.round(cantidad * 1000) / 1000).toString();
        });
    });

    return { resultado, ac };
}