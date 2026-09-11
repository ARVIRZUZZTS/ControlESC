import { abrirModal, abrirAlert, abrirConfirmation } from "../../components/modal.js";
import { autocompleteSeleccion } from "../../components/autocomplete.js";

const IMG_FLOTA = "img/flotaPloteada.png";
const IMG_SOLO = "img/w_solo.svg";
const IMG_DOBLE = "img/w_doble.svg";
const OFFSET_DOBLE_X = 5;

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

export async function cargarSeccionRuedasFlota(placa) {
    const seccion = document.getElementById("seccionRuedasFlota");
    if (!seccion) return;
    seccion.innerHTML = `<p>Cargando ruedas de la flota...</p>`;

    try {
        const res = await fetch(`php/api/get/flotaRuedas/route.php?placa=${encodeURIComponent(placa)}`);
        const data = await res.json();
        if (data.status === "error") {
            seccion.innerHTML = `<p>${data.message}</p>`;
            return;
        }
        renderSeccion(placa, data.data, seccion);
    } catch (error) {
        seccion.innerHTML = `<p>Error cargando ruedas de la flota.</p>`;
        console.error(error);
    }
}

function renderSeccion(placa, data, seccion) {
    if (data.posiciones.length === 0) {
        seccion.innerHTML = `
            <div class="ruedasFlotaVacio">
                <button id="btnConfigurarRuedas" class="btnConfigRuedas">CONFIGURAR RUEDAS DE FLOTA</button>
            </div>
        `;
        document.getElementById("btnConfigurarRuedas").addEventListener("click", () => {
            configurarRuedasFlota(placa, data);
        });
        return;
    }

    seccion.innerHTML = `
        <div class="flotaRuedasHeader">
            <h3>Ruedas de la Flota</h3>
            <button id="btnEditarRuedas" class="listBtn" title="Editar posiciones"><img src="img/edit.svg" alt="Editar"></button>
        </div>
        <div class="flotaRuedasLayout">
            <div id="diagrama">
                <div class="diagrama-img-wrap diagrama-static" id="diagramaStatic">
                    <img src="${IMG_FLOTA}" alt="Flota">
                </div>
            </div>
            <div id="informacionFLotaRuedas">
                <table id="tbRuedasFlota">
                    <thead>
                        <tr>
                            <th class="thl t10">Posicion</th>
                            <th class="t10">Rueda</th>
                            <th class="t8">Viajes Hechos</th>
                            <th class="t8">Viajes Totales</th>
                            <th class="thr t3">Info.</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("btnEditarRuedas").addEventListener("click", () => {
        configurarRuedasFlota(placa, data);
    });

    const wrap = document.getElementById("diagramaStatic");
    const tbody = document.querySelector("#tbRuedasFlota tbody");

    data.posiciones.forEach(p => {
        const hayRueda = p.id_rd != null;

        const tr = document.createElement("tr");
        tr.dataset.idPr = p.id_pr;

        const tdNombre = document.createElement("td");
        tdNombre.className = "pb pm t10";
        tdNombre.textContent = nombreBase(p.nombre_posicion);
        if (p.tipo === "doble") {
            const badge = document.createElement("span");
            badge.className = "badgeDoble";
            badge.textContent = ladoRueda(p.nombre_posicion) || "D";
            badge.title = "Rueda doble";
            tdNombre.appendChild(badge);
        }

        const actualLabel = hayRueda ? `Lote: ${p.id_rl}; Cod: ${p.codigo}` : "";

        const tdRueda = document.createElement("td");
        tdRueda.className = "pb pm t10";
        tdRueda.innerHTML = `
            <div class="accionesRuedaPos">
                <div class="rdActualLabel">${hayRueda ? actualLabel : "Sin rueda asignada"}</div>
                <div class="accionesRuedaBtns">
                    <button type="button" class="btnInstalarRueda listBtn" title="Instalar rueda"><img src="img/instalar.svg" alt="instalar"></button>
                    ${hayRueda ? `<button type="button" class="btnQuitarRueda listBtn" title="Quitar rueda"><img src="img/trash.svg" alt="quitar"></button>` : ""}
                </div>
            </div>
        `;

        const tdVf = document.createElement("td");
        tdVf.className = "pb pm t8";
        tdVf.textContent = hayRueda ? (p.viajes_flota ?? 0) : "-";

        const tdVt = document.createElement("td");
        tdVt.className = "pb pm t8";
        tdVt.textContent = hayRueda ? (p.viajes_total ?? 0) : "-";

        const tdInfo = document.createElement("td");
        tdInfo.className = "pb t3";
        const bInfo = document.createElement("button");
        bInfo.className = "btnInfo listBtn";
        bInfo.dataset.id_rd = p.id_rd || "";
        bInfo.innerHTML = `<img src="img/info.svg" alt="info">`;
        tdInfo.appendChild(bInfo);

        tr.appendChild(tdNombre);
        tr.appendChild(tdRueda);
        tr.appendChild(tdVf);
        tr.appendChild(tdVt);
        tr.appendChild(tdInfo);
        tbody.appendChild(tr);

        const bInstalar = tdRueda.querySelector(".btnInstalarRueda");
        bInstalar.addEventListener("click", () => {
            abrirSeleccionRueda({
                placa,
                id_pr: Number(p.id_pr),
                nombrePosicion: labelPosicion(p.nombre_posicion),
                idRuedaActual: hayRueda ? Number(p.id_rd) : null
            });
        });

        const bQuitar = tdRueda.querySelector(".btnQuitarRueda");
        if (bQuitar) {
            bQuitar.addEventListener("click", () => {
                abrirConfirmation({
                    titulo: `Posicion ${labelPosicion(p.nombre_posicion)}`,
                    mensaje: `Esta seguro de quitar la rueda "Rueda: ${p.id_rd} - ${p.codigo}" de la posicion ${labelPosicion(p.nombre_posicion)} y dejarla en almacen?`,
                    botonAceptar: "SI",
                    onAceptar: () => ejecutarCambio({
                        accion: "quitar",
                        id_rd: Number(p.id_rd),
                        placa,
                        id_pr: Number(p.id_pr)
                    })
                });
            });
        }

        bInfo.addEventListener("click", () => {
            abrirAlert({
                titulo: "Info. Rueda",
                mensaje: `El detalle de la rueda ${p.id_rd} esta pendiente de implementacion.`
            });
        });
    });

    const grupos = [];
    const indice = new Map();
    data.posiciones.forEach(p => {
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

    grupos.forEach(items => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rueda-btn";
        const xs = items.map(p => parseFloat(p.posicion_x));
        btn.style.left = (items.length > 1 ? xs.reduce((a, b) => a + b, 0) / items.length : xs[0]) + "%";
        btn.style.top = items[0].posicion_y + "%";
        btn.dataset.idPrs = items.map(p => p.id_pr).join(",");
        btn.setAttribute("aria-label", items.map(p => labelPosicion(p.nombre_posicion)).join(", "));
        const imgW = document.createElement("img");
        imgW.src = items[0].tipo === "doble" ? IMG_DOBLE : IMG_SOLO;
        btn.appendChild(imgW);
        wrap.appendChild(btn);
    });

    wrap.querySelectorAll(".rueda-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const ids = btn.dataset.idPrs.split(",");
            tbody.querySelectorAll("tr").forEach(r => r.classList.remove("fila-resaltada"));
            ids.forEach(id => {
                const tr = document.querySelector(`#tbRuedasFlota tbody tr[data-id-pr="${id}"]`);
                if (tr) tr.classList.add("fila-resaltada");
            });
            const primera = document.querySelector(`#tbRuedasFlota tbody tr[data-id-pr="${ids[0]}"]`);
            if (primera) primera.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
}

async function ejecutarCambio(payload) {
    try {
        const res = await fetch("php/api/features/ruedaFlota/route.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.status === "success") {
            const placa = payload.placa;
            cargarSeccionRuedasFlota(placa);
        } else {
            abrirAlert({ mensaje: "Error: " + result.message });
        }
    } catch (error) {
        abrirAlert({ mensaje: "Error de conexion: " + error.message });
    }
}

let catalogoRuedas = null;

async function obtenerCatalogoRuedas() {
    if (catalogoRuedas) return catalogoRuedas;
    const res = await fetch("php/api/get/ruedasInstalacion/route.php");
    const data = await res.json();
    if (data.status === "error") throw new Error(data.message);
    catalogoRuedas = data.data;
    return catalogoRuedas;
}

function abrirSeleccionRueda({ placa, id_pr, nombrePosicion, idRuedaActual }) {
    const resultado = abrirModal({
        titulo: "Seleccione rueda a Instalar",
        headerDerechaHTML: `
            <div id="filtrosRuedasModal">
                <button type="button" class="btnFiltroRueda activo" data-filtro="Disponible">Disponible</button>
                <button type="button" class="btnFiltroRueda" data-filtro="Operativa">Operativa</button>
                <button type="button" class="btnFiltroRueda" data-filtro="Baja">Baja</button>
            </div>
        `,
        sinFooter: true,
        panelClase: "modal-panel-ruedasinstalar",
        contenidoHTML: `
            <table id="tbDetalleLote">
                <thead>
                    <tr>
                        <th class="thl t8">Placa</th>
                        <th class="th t15">Codigo</th>
                        <th class="th t10">Marca</th>
                        <th class="th t10">Precio Rueda Bs.</th>
                        <th class="th t8">Viajes Hechos</th>
                        <th class="th t8">Estado</th>
                        <th class="thr t5">Instalar</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `
    });
    const overlay = resultado.overlay;
    const tbody = overlay.querySelector("#tbDetalleLote tbody");

    function renderFiltradas() {
        const activo = overlay.querySelector(".btnFiltroRueda.activo");
        const filtro = activo ? activo.dataset.filtro : "Disponible";
        const filtradas = catalogoRuedas.filter(r => r.estado === filtro && Number(r.id_rd) !== idRuedaActual);
        tbody.innerHTML = "";
        filtradas.forEach(r => {
            const tr = document.createElement("tr");
            const celdas = [
                r.placa_op || "-",
                r.codigo,
                r.nombre_marca_rueda,
                (r.precio_rueda ?? 0) + " Bs.",
                r.viajes_hechos ?? 0,
                r.estado
            ];
            celdas.forEach(texto => {
                const td = document.createElement("td");
                td.className = "pb pm";
                td.textContent = texto;
                tr.appendChild(td);
            });
            const tdInst = document.createElement("td");
            tdInst.className = "pb pm";
            const bInst = document.createElement("button");
            bInst.className = "btnInstalarRueda listBtn";
            bInst.title = "Instalar en la posicion seleccionada";
            bInst.innerHTML = `<img src="img/instalar.svg" alt="instalar">`;
            bInst.addEventListener("click", () => confirmarInstalacion(r));
            tdInst.appendChild(bInst);
            tr.appendChild(tdInst);
            tbody.appendChild(tr);
        });
    }

    function confirmarInstalacion(r) {
        let mensaje;
        if (r.estado === "Operativa") {
            mensaje = `Esta seguro de Instalar esta Rueda ${r.id_rd} de codigo ${r.codigo}, este pertenece a ${r.placa_op} en la posicion ${r.posicion_op || "-"}, si lo cambia esta rueda ya no figurara en la flota ${r.placa_op}`;
        } else if (r.estado === "Baja") {
            mensaje = "Esta seguro de querer instalar una rueda que fue dada de baja? Esta Rueda se instalara en la flota pero seguira de baja en almacen.";
        } else {
            mensaje = `Esta seguro de Instalar esta Rueda ${r.id_rd} de codigo ${r.codigo} en la posicion ${nombrePosicion}?`;
        }
        abrirConfirmation({
            titulo: `Posicion ${nombrePosicion}`,
            mensaje,
            botonAceptar: "SI",
            onAceptar: () => ejecutarCambio({
                accion: "instalar",
                id_rd: Number(r.id_rd),
                placa,
                id_pr
            })
        });
    }

    overlay.querySelectorAll(".btnFiltroRueda").forEach(btn => {
        btn.addEventListener("click", () => {
            overlay.querySelectorAll(".btnFiltroRueda").forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");
            renderFiltradas();
        });
    });

    obtenerCatalogoRuedas()
        .then(() => renderFiltradas())
        .catch(err => {
            abrirAlert({ mensaje: "Error cargando ruedas: " + err.message });
            resultado.cerrar();
        });
}

export async function configurarRuedasFlota(placa, data) {
    const puestos = (data.posiciones || []).map(p => {
        const m = String(p.nombre_posicion).match(/^(.*)\s(D\.[EI]|Ex|In)$/);
        return {
            x: parseFloat(p.posicion_x),
            y: parseFloat(p.posicion_y),
            tipo: p.tipo,
            nombre: p.nombre_posicion,
            grupo: m ? m[1] : undefined
        };
    });
    let modo = null;

    const nombresOptions = (data.nombres || []).map(n => ({
        id: null,
        label: n.nombre_posicion
    }));

    const contenidoHTML = `
        <div class="diagramaBody">
            <div class="diagrama-sidebar">
                <button type="button" id="diagModoSimple" class="diagModoBtn">1 Rueda</button>
                <button type="button" id="diagModoDoble" class="diagModoBtn">2 Ruedas</button>
                <button type="button" id="diagDeshacer" class="diagModoBtn diagModoAccion">Deshacer</button>
            </div>
            <div class="diagrama-img-wrap" id="diagramaImgWrap">
                <img src="${IMG_FLOTA}" alt="Flota">
            </div>
        </div>
    `;

    const resultado = abrirModal({
        titulo: `CONFIGURAR RUEDAS DE ${placa}`,
        contenidoHTML,
        panelClase: "modal-panel-diagrama",
        botonGuardar: "GUARDAR",
        onSubmit: async (cerrar) => {
            if (puestos.length === 0) {
                abrirAlert({ mensaje: "Debe colocar al menos una rueda en el diagrama." });
                return;
            }
            const posiciones = puestos.map(p => ({
                nombre_posicion: p.nombre,
                posicion_x: Math.round(p.x * 100) / 100,
                posicion_y: Math.round(p.y * 100) / 100,
                tipo: p.tipo
            }));

            const res = await fetch("php/api/store/ruedaPosicion/route.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ placa, posiciones })
            });
            const result = await res.json();
            if (result.status === "success") {
                cerrar();
                cargarSeccionRuedasFlota(placa);
            } else {
                abrirAlert({ mensaje: "Error al guardar: " + result.message });
            }
        }
    });

    const wrap = resultado.overlay.querySelector("#diagramaImgWrap");

    function dibujar() {
        wrap.querySelectorAll(".rueda-btn").forEach(b => b.remove());
        const grupos = [];
        const indice = new Map();
        puestos.forEach(p => {
            const m = /^(.*)\s(D\.[EI]|Ex|In)$/.exec(p.nombre || "");
            if (p.tipo === "doble" && (p.grupo || m)) {
                const base = p.grupo || m[1];
                if (!indice.has(base)) {
                    indice.set(base, grupos.length);
                    grupos.push([]);
                }
                grupos[indice.get(base)].push(p);
            } else {
                grupos.push([p]);
            }
        });
        grupos.forEach(items => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "rueda-btn";
            const xs = items.map(p => p.x);
            btn.style.left = (items.length > 1 ? xs.reduce((a, b) => a + b, 0) / items.length : xs[0]) + "%";
            btn.style.top = items[0].y + "%";
            const imgW = document.createElement("img");
            imgW.src = items[0].tipo === "doble" ? IMG_DOBLE : IMG_SOLO;
            btn.appendChild(imgW);
            wrap.appendChild(btn);
        });
    }

    function marcarModo(btnSel, tipo) {
        resultado.overlay.querySelectorAll(".diagModoBtn").forEach(b => b.classList.remove("diagModoActivo"));
        if (btnSel) btnSel.classList.add("diagModoActivo");
        modo = tipo;
    }

    resultado.overlay.querySelector("#diagModoSimple").addEventListener("click", (e) => {
        marcarModo(e.currentTarget, "simple");
    });
    resultado.overlay.querySelector("#diagModoDoble").addEventListener("click", (e) => {
        marcarModo(e.currentTarget, "doble");
    });
    resultado.overlay.querySelector("#diagDeshacer").addEventListener("click", () => {
        const ultimo = puestos[puestos.length - 1];
        if (!ultimo) return;
        if (ultimo.grupo) {
            while (puestos.length && puestos[puestos.length - 1].grupo === ultimo.grupo) puestos.pop();
        } else {
            puestos.pop();
        }
        dibujar();
    });

    wrap.addEventListener("click", (e) => {
        if (!modo) {
            abrirAlert({ mensaje: "Seleccione primero '1 Rueda' o '2 Ruedas'." });
            return;
        }
        if (e.target.closest(".rueda-btn")) return;
        const rect = wrap.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        pedirNombre(x, y);
    });

    function pedirNombre(x, y) {
        const tipo = modo;
        const mensaje = tipo === "doble"
            ? "Ingrese el Nombre de esta Posicion de las Ruedas DOBLES"
            : "Ingrese el Nombre de esta Posicion de la Rueda SIMPLE";

        const conf = abrirConfirmation({
            titulo: "Nombre de la Posicion",
            mensaje,
            contenidoHTML: `
                <div class="modal-fila confNomRow">
                    <input type="text" id="confNomRueda" maxlength="50" autocomplete="off" placeholder="Nombre de la posicion">
                </div>
            `,
            botonAceptar: "ACEPTAR",
            onAceptar: () => {
                const input = conf.overlay.querySelector("#confNomRueda");
                const nombre = input.value.trim();
                if (!nombre) {
                    abrirAlert({ mensaje: "El nombre de la posicion no puede estar vacio." });
                    return false;
                }
                if (tipo === "doble") {
                    puestos.push({ x: x + OFFSET_DOBLE_X, y, tipo, nombre: `${nombre} Ex`, grupo: nombre });
                    puestos.push({ x: x - OFFSET_DOBLE_X, y, tipo, nombre: `${nombre} In`, grupo: nombre });
                } else {
                    puestos.push({ x, y, tipo, nombre });
                }
                dibujar();
            }
        });

        const input = conf.overlay.querySelector("#confNomRueda");
        autocompleteSeleccion({
            input,
            opciones: nombresOptions,
            valorActual: "",
            placeholder: "Escriba o seleccione un nombre",
            modoBuscador: true
        });

        setTimeout(() => input.focus(), 50);
    }

    dibujar();
}