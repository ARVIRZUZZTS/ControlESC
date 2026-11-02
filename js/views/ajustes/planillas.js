import { ajustesView } from "../ajustes.js";
import { abrirModal, abrirAlert, abrirConfirmation } from "../../components/modal.js";
import { flotaGradiente, colorTextoFlota } from "../../utils.js";

export async function planillasView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>PLANILLAS</h2>
        </div>
        <button id="newPlanillaBtn"><img src="img/plus.svg" alt="Nuevo"> Nueva Planilla</button>
    `;

    document.getElementById("backBtn").addEventListener("click", ajustesView);
    document.getElementById("newPlanillaBtn").addEventListener("click", () => {
        abrirEditorPlanilla("", "n");
    });

    try {
        const res = await fetch("php/api/get/planillas/route.php");
        const data = await res.json();
        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        const nombres = data.data || [];

        let html = `<div class="planillasGrid" style="display:grid; grid-template-columns:1fr 1fr; gap:2vh; margin-top:2vh;">`;
        for (const nombre of nombres) {
            const imgName = nombre.replace(/\s+/g, "_") + ".webp";
            html += `
                <div class="planillaCard" style="border:1px solid #ccc; border-radius:8px; padding:1vh; text-align:center;">
                    <h4>${nombre}</h4>
                    <img src="img/planillas/${imgName}" alt="${nombre}" style="width:100%; max-height:20vh; object-fit:contain; background:#f5f5f5;" onerror="this.style.display='none'">
                    <div style="display:flex; gap:1vh; justify-content:center; margin-top:1vh;">
                        <button class="btnEditarPlanilla" data-nombre="${nombre}"><img src="img/edit.svg" alt="editar"></button>
                        <button class="btnCopiarPlanilla" data-nombre="${nombre}">
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
</button>
                        <button class="btnEliminarPlanilla" data-nombre="${nombre}"><img src="img/trash.svg" alt="eliminar"></button>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
        cont.innerHTML = html;

        document.querySelectorAll(".btnEditarPlanilla").forEach(btn => {
            btn.addEventListener("click", () => {
                abrirEditorPlanilla(btn.dataset.nombre, "e");
            });
        });
        document.querySelectorAll(".btnCopiarPlanilla").forEach(btn => {
            btn.addEventListener("click", () => {
                abrirEditorPlanilla(btn.dataset.nombre, "c");
            });
        });
        document.querySelectorAll(".btnEliminarPlanilla").forEach(btn => {
            btn.addEventListener("click", () => eliminarPlanilla(btn.dataset.nombre));
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando planillas</p>";
        console.error(error);
    }
}

async function verificarPassword(password) {
    const res = await fetch("php/api/auth/verificarContra/route.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });
    const data = await res.json();
    return data.status === "success";
}

function eliminarPlanilla(nombre) {
    const resultado = abrirModal({
        titulo: "ELIMINAR PLANILLA",
        contenidoHTML: `
            <div class="modal-fila">
                <label>Contrasena:</label>
                <input type="password" id="inpPassPlanilla" placeholder="Contrasena">
            </div>
        `,
        botonGuardar: "ELIMINAR",
        onSubmit: async (cerrar) => {
            const pass = document.getElementById("inpPassPlanilla").value;
            const ok = await verificarPassword(pass);
            if (!ok) {
                abrirAlert({ mensaje: "Contrasena incorrecta." });
                return;
            }
            const res = await fetch("php/api/store/planillaEliminar/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre })
            });
            const data = await res.json();
            if (data.status === "success") {
                cerrar();
                planillasView();
            } else {
                abrirAlert({ mensaje: data.message || "Error al eliminar." });
            }
        }
    });
    const panel = resultado.overlay.querySelector(".modal-panel");
    const btn = resultado.overlay.querySelector(".modal-accept");
    if (panel) panel.classList.add("modal-danger");
    if (btn) btn.classList.add("modal-danger-accept");
}

export function abrirEditorPlanilla(nombre, modo) {
    const titulo = modo === "e" ? "EDITAR PLANILLA" : (modo === "c" ? "COPIAR PLANILLA" : "NUEVA PLANILLA");
    window.__planillaEditorConfig = { nombre: nombre || "", modo: modo };
    window.__planillaEditorOnSave = () => {
        resultado.cerrar();
        limpiarEditorScript();
        planillasView();
    };

    const contenidoHTML = `
        <div class="editor-planilla">
            <div class="editor-left">
                <button id="asiento" class="btnAddDetalle editor-btn" type="button" onclick="agregarAsiento()"><span class="editor-icon">💺</span><span>Asiento</span></button>
                <button id="puerta" class="btnAddDetalle editor-btn" type="button" onclick="agregarElemento('puerta')"><span class="editor-icon">🚪</span><span>Puerta</span></button>
                <button id="banio" class="btnAddDetalle editor-btn" type="button" onclick="agregarElemento('baño')"><span class="editor-icon">🚽</span><span>Baño</span></button>
                <button id="tv" class="btnAddDetalle editor-btn" type="button" onclick="agregarElemento('tv')"><span class="editor-icon">📺</span><span>TV</span></button>
                <button id="piso2" class="btnAddDetalle editor-btn" type="button" onclick="agregarElemento('2do piso')"><span class="editor-icon">2°</span><span>Piso</span></button>
                
                <button id="del" class="btnAddDetalle editor-btn" type="button" onclick="activarModoEliminar()"><span class="editor-icon">🗑</span><span>Eliminar</span></button>
            </div>
            <div class="editor-center">
                <div id="bus"></div>
            </div>
            <div class="editor-right">
                <div class="editor-prefab">
                    <div class="editor-prefab-label">Filas de asientos</div>
                    <div class="butOps">
                        <button class="biAsi" onclick="asi(3)">3</button>
                        <button class="biAsi" onclick="asi(4)">4</button>
                    </div>
                </div>
                <div class="editor-prefab">
                    <div class="editor-prefab-label">Puertas</div>
                    <div class="butOps">
                        <button class="biPue" onclick="pue(1)">1</button>
                        <button class="biPue" onclick="pue(2)">2</button>
                        <button class="biPue" onclick="pue(3)">3</button>
                    </div>
                </div>
                <div class="editor-prefab">
                    <div class="editor-prefab-label">Baños</div>
                    <div class="butOps">
                        <button class="biBan" onclick="ban(1)">1</button>
                        <button class="biBan" onclick="ban(2)">2</button>
                    </div>
                </div>
                <div class="editor-prefab">
                    <div class="editor-prefab-label">TV</div>
                    <div class="butOps">
                        <button class="biTv" onclick="tv(1)">1</button>
                        <button class="biTv" onclick="tv(2)">2</button>
                        <button class="biTv" onclick="tv(3)">3</button>
                    </div>
                </div>
                <div class="editor-prefab">
                    <div class="editor-prefab-label">Nombre de planilla</div>
                    <input id="busName" type="text" placeholder="Ingrese el nombre de la PLANILLA">
                </div>
            </div>
        </div>
    `;

    const resultado = abrirModal({
        titulo: titulo,
        contenidoHTML: contenidoHTML,
        panelClase: "modal-panel-planillaEditor",
        botonGuardar: "GUARDAR",
        onSubmit: () => {
            if (typeof guardarPosiciones === "function") guardarPosiciones();
        }
    });

    if (!document.querySelector('link[href="css/planillaEditor.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "css/planillaEditor.css";
        document.head.appendChild(link);
    }

    window.__planillaEditorOnSave = () => {
        window.__planillaEditorOnSave = null;
        resultado.cerrar();
        planillasView();
    };

    const closeBtn = resultado.overlay.querySelector(".modal-close");
    const cancelBtn = resultado.overlay.querySelector(".modal-cancel");
    const cleanup = () => {
        window.__planillaEditorOnSave = null;
    };
    if (closeBtn) closeBtn.addEventListener("click", cleanup);
    if (cancelBtn) cancelBtn.addEventListener("click", cleanup);

    setTimeout(() => {
        if (window.__planillaEditorInit) window.__planillaEditorInit();
    }, 0);
}

