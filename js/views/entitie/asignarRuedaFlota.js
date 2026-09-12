import { abrirModal, abrirAlert, abrirConfirmation } from "../../components/modal.js";

const IMG_FLOTA = "img/flotaPloteada.png";
const IMG_SOLO = "img/w_solo.svg";
const IMG_DOBLE = "img/w_doble.svg";

function nombreBase(nombre) {
    return String(nombre || "").replace(/\s(D\.[EI]|Ex|In)$/, "");
}
function ladoRueda(nombre) {
    const m = /^(.*)\s(D\.[EI]|Ex|In)$/.exec(String(nombre || ""));
    if (!m) return "";
    if (m[2] === "D.E") return "Ex";
    if (m[2] === "D.I") return "In";
    return m[2];
}
function labelPosicion(nombre) {
    const lado = ladoRueda(nombre);
    return lado ? `${nombreBase(nombre)} (${lado})` : nombreBase(nombre);
}

export async function asignarRuedaAFlota({ placa, id_rd, codigo, estado, onSuccess }) {
    if (!placa || !id_rd) return;

    let data;
    try {
        const res = await fetch(`php/api/get/flotaRuedas/route.php?placa=${encodeURIComponent(placa)}`);
        const response = await res.json();
        if (response.status === "error") throw new Error(response.message);
        data = response.data;
    } catch (error) {
        abrirAlert({ mensaje: "Error: " + error.message });
        return;
    }

    const posiciones = data.posiciones || [];

    if (posiciones.length === 0) {
        abrirConfirmation({
            titulo: "Flota sin Posiciones",
            mensaje: "Esta flota no tiene Posiciones creadas, Quiere crearlas?",
            botonAceptar: "SI",
            onAceptar: async () => {
                const { flota } = await import("./flota.js");
                flota(placa);
            }
        });
        return;
    }

    const accion = estado === "Operativa" ? "mover" : "instalar";

    const grupos = [];
    const indice = new Map();
    posiciones.forEach(p => {
        const m = /^(.*)\s(D\.[EI]|Ex|In)$/.exec(p.nombre_posicion || "");
        if (p.tipo === "doble" && m) {
            const base = m[1];
            if (!indice.has(base)) {
                indice.set(base, grupos.length);
                grupos.push([]);
            }
            grupos[indice.get(base)].push(p);
        } else {
            grupos.push([p]);
        }
    });

    const marcadores = grupos.map(items => {
        const xs = items.map(p => parseFloat(p.posicion_x));
        const left = items.length > 1 ? xs.reduce((a, b) => a + b, 0) / items.length : xs[0];
        return `<button type="button" class="rueda-btn" data-id-prs="${items.map(p => p.id_pr).join(",")}" style="left:${left}%;top:${items[0].posicion_y}%" aria-label="${items.map(p => labelPosicion(p.nombre_posicion)).join(", ")}" title="${items.map(p => labelPosicion(p.nombre_posicion)).join(", ")}"><img src="${items[0].tipo === "doble" ? IMG_DOBLE : IMG_SOLO}" alt=""></button>`;
    }).join("");

    const botonesPos = posiciones.map(p => {
        const ocupada = p.id_rd != null;
        return `<button type="button" class="posSelBtn${ocupada ? " ocupada" : ""}" data-id-pr="${p.id_pr}" data-ocupada="${ocupada ? 1 : 0}" data-rd-ocup="${p.id_rd || ""}" data-cod-ocup="${p.codigo || ""}" data-posicion="${p.nombre_posicion}">${labelPosicion(p.nombre_posicion)}${ocupada ? ` <span class="posOcupadaInfo">Rueda ${p.id_rd} - ${p.codigo}</span>` : ""}</button>`;
    }).join("");

    const resultado = abrirModal({
        titulo: `Instalar Rueda ${id_rd} - ${codigo}`,
        sinFooter: true,
        panelClase: "modal-panel-selecPos",
        contenidoHTML: `
            <div class="diagrama-img-wrap" id="diagramaSelPos">
                <img src="${IMG_FLOTA}" alt="Flota">
                ${marcadores}
            </div>
            <div class="posCol">
                <h3 class="loteTitulo">Posiciones</h3>
                <div class="posLista">${botonesPos}</div>
            </div>
        `
    });

    resultado.overlay.querySelectorAll("#diagramaSelPos .rueda-btn").forEach(marcador => {
        marcador.addEventListener("click", () => {
            const ids = String(marcador.dataset.idPrs || "").split(",").map(Number);
            resultado.overlay.querySelectorAll(".posSelBtn").forEach(b => {
                b.classList.toggle("iluminado", ids.includes(Number(b.dataset.idPr)));
            });
        });
    });

    resultado.overlay.querySelectorAll(".posSelBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id_pr = Number(btn.dataset.idPr);
            const ocupada = btn.dataset.ocupada === "1";
            const posicion = btn.dataset.posicion;

            if (ocupada) {
                const rdOcup = btn.dataset.rdOcup;
                const codOcup = btn.dataset.codOcup;
                abrirConfirmation({
                    titulo: `Posicion ${labelPosicion(posicion)}`,
                    mensaje: `Esta seguro de Instalar esta Rueda ${rdOcup} de codigo ${codOcup}, este pertenece a ${placa} en la posicion ${posicion}, si lo cambia esta rueda ya no figurara en la flota ${placa}`,
                    botonAceptar: "SI",
                    onAceptar: () => ejecutar(id_pr)
                });
                return;
            }

            abrirConfirmation({
                titulo: `Posicion ${labelPosicion(posicion)}`,
                mensaje: `Esta seguro de Instalar esta Rueda ${id_rd} de codigo ${codigo} en la posicion ${labelPosicion(posicion)}?`,
                botonAceptar: "SI",
                onAceptar: () => ejecutar(id_pr)
            });
        });
    });

    function ejecutar(id_pr) {
        fetch("php/api/features/ruedaFlota/route.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion, id_rd: Number(id_rd), placa, id_pr })
        })
        .then(r => r.json())
        .then(response => {
            if (response.status === "success") {
                resultado.cerrar();
                if (onSuccess) onSuccess();
            } else {
                abrirAlert({ mensaje: "Error: " + response.message });
            }
        })
        .catch(error => abrirAlert({ mensaje: "Error de conexion: " + error.message }));
    }
}