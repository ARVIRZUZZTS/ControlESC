import { abrirModal, abrirAlert } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";

export async function asignarAceiteModal({ id_ad, disponible, onSuccess = null } = {}) {

    const placasRes = await fetch("php/api/get/placasList/route.php");
    const placasResponse = await placasRes.json();
    const placas = placasResponse.data || placasResponse;
    const placasOptions = placas.map(p => ({ id: p.placa, label: p.placa }));

    const porc = [0.25, 0.5, 0.75, 1];
    const disponibleLote = parseFloat(disponible) || 0;
    let espacioLibre = disponibleLote;

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
            <label>Espacio:</label>
            <input type="range" id="asRange" min="0" step="0.001" value="0">
        </div>
        <div class="modal-fila">
            <label>Cantidad (Lt.):</label>
            <input type="number" id="asCantidad" step="0.001" min="0" placeholder="0.000" autocomplete="off">
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
    const inpRange = resultado.overlay.querySelector("#asRange");
    const capSpan = resultado.overlay.querySelector("#asCapacidad");

    const maxActual = () => Math.min(disponibleLote, espacioLibre);

    inpRange.max = maxActual();

    function setCantidad(valor) {
        const max = maxActual();
        const v = Math.max(0, Math.min(max, parseFloat(valor) || 0));
        const v3 = Math.round(v * 1000) / 1000;
        inpRange.value = v3;
        inpCantidad.value = v3.toString();
    }

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
                espacioLibre = parseFloat(data.data.disponible_aceite) || 0;
                inpRange.max = maxActual();
                setCantidad(0);
                capSpan.textContent = `${data.data.disponible_aceite} litros disponibles de ${data.data.capacidad_aceite}`;
            } else {
                capSpan.textContent = "--";
            }
        }
    });

    resultado.overlay.querySelectorAll(".btnAsPorc").forEach(btn => {
        btn.addEventListener("click", () => {
            const p = parseFloat(btn.dataset.p);
            setCantidad(Math.min(disponibleLote * p, espacioLibre));
        });
    });

    inpRange.addEventListener("input", () => {
        setCantidad(inpRange.value);
    });

    inpCantidad.addEventListener("input", () => {
        setCantidad(inpCantidad.value);
    });

    return { resultado, ac };
}