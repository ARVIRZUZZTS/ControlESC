import { reportesView } from "../reportesView.js";
import { strFechaDMY, fechaISOToDMY, fechaDMYToISO, decimalFilter } from "../../utils.js";
import { crearCampoFecha } from "../../components/fechaCampo.js";
import { historialReporteView } from "./historialReporte.js";
import { imprimirParte } from "./imprimirReporte.js";
import { abrirAlert, abrirConfirmation } from "../../components/modal.js";

function num(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? null : n;
}

function esc(v) {
    return v === null || v === undefined ? "" : String(v);
}

function fmt(v, dec = 2) {
    const n = num(v);
    return n === null ? "0" : n.toFixed(dec);
}

/* Una ruta "A - B - C" son 2 viajes; "A - B - B - A" tambien (quedarse en la ciudad no es viaje) */
function contarTramos(ubicacion) {
    if (ubicacion === null || ubicacion === undefined || String(ubicacion).trim() === "") return 1;
    const lugares = String(ubicacion).split("-").map(s => s.trim()).filter(s => s !== "");
    if (lugares.length < 2) return 1;
    let n = 0;
    for (let i = 1; i < lugares.length; i++) {
        if (lugares[i].toLowerCase() !== lugares[i - 1].toLowerCase()) n++;
    }
    return n > 0 ? n : 1;
}

export async function reporteViaje(placa) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    cont.innerHTML = `<p>Cargando reporte...</p>`;
    title.innerHTML = ``;

    try {

        const [resRV, resUbi, resULL, resPeajes, resGastos, resPersonal] = await Promise.all([
            fetch(`php/api/get/reporteViaje/route.php?placa=${encodeURIComponent(placa)}`),
            fetch("php/api/get/ubicaciones/route.php"),
            fetch("php/api/get/ubicacionesLlegada/route.php"),
            fetch("php/api/get/peajes/route.php"),
            fetch("php/api/get/gastosConDetalles/route.php"),
            fetch("php/views/personal.php")
        ]);

        const data = await resRV.json();
        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        const flota = data.flota;
        const r = data.reporte;
        const ultimo = data.ultimo_finalizado;
        const gastosBD = data.gastos || [];
        const anomaliasBD = data.anomalias || [];
        const aceite = data.aceite || {};
        const CONFIG = data.config || {};
        const MAX_VIAJES = CONFIG.max_viajes_reporte || 3;

        const ubicaciones = (await resUbi.json()).data || [];
        const ubiLlegada = (await resULL.json()).data || [];
        const peajes = (await resPeajes.json()).data || [];
        const gastosEstimados = (await resGastos.json()).data || [];
        const personal = await resPersonal.json();

        const hoy = strFechaDMY();

        title.innerHTML = `
            <div class="backTitle">
                <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
                <h2>Reporte de ${flota.placa}</h2>
            </div>
            <div class="btnsTitle">
                <button id="imprimirReporteBtn"><img src="img/print.svg" alt="Imprimir">Imprimir</button>
                <button id="guardarReporteBtn"><img src="img/save.svg" alt="Guardar">Guardar</button>
                <button id="finalizarReporteBtn" class="btnFinalizar"><img src="img/end.svg" alt="Finalizar">Finalizar</button>
                <button id="historialReporteBtn"><img src="img/reportesList.svg" alt="Reportes"> Historial</button>
            </div>
        `;

        document.getElementById("backBtn").addEventListener("click", reportesView);
        document.getElementById("historialReporteBtn").addEventListener("click", () => {
            historialReporteView({ placa: flota.placa, onBack: () => reporteViaje(placa) });
        });
        document.getElementById("finalizarReporteBtn").addEventListener("click", finalizarReporte);

        const optPartida = ubicaciones.map(u =>
            `<option value="${esc(u.nombre_ubicacion)}" ${Number(u.id_ubicacion) === 1 ? "selected" : ""}>${esc(u.nombre_ubicacion)}</option>`
        ).join("");

        const retornoOptions = ubicaciones.filter(u => Number(u.id_ubicacion) !== Number(flota.id_u));
        const optRetorno = `<option value="">-</option>` +
            retornoOptions.map(u =>
                `<option value="${esc(u.nombre_ubicacion)}" ${esc(u.nombre_ubicacion) === esc(r?.ubicacion_retorno) ? "selected" : ""}>${esc(u.nombre_ubicacion)}</option>`
            ).join("");

        const valLlegada = esc(r?.ubicacion_llegada);
        const optLlegada = []
            .concat(
                ubicaciones.map(u => {
                    const sel = valLlegada === "" ? esc(u.nombre_ubicacion) === "Cochabamba" : esc(u.nombre_ubicacion) === valLlegada;
                    return `<option value="${esc(u.nombre_ubicacion)}" ${sel ? "selected" : ""}>${esc(u.nombre_ubicacion)}</option>`;
                }),
                ubiLlegada.map(u => {
                    const sel = valLlegada !== "" && esc(u.nombre_ubicaciones_llegada) === valLlegada;
                    return `<option value="${esc(u.nombre_ubicaciones_llegada)}" ${sel ? "selected" : ""}>${esc(u.nombre_ubicaciones_llegada)}</option>`;
                })
            )
            .join("");

        const optPeajes = peajes.map(p =>
            `<option value="${esc(p.precio_peaje)}" data-precio="${esc(p.precio_peaje)}">Bs. ${esc(p.precio_peaje)} - ${esc(p.nombre_ubicacion)}</option>`
        ).join("");
        const optPeajesIda = peajes.length > 0 ? `<option value="">-</option>${optPeajes}` : `<option value="">-</option>`;
        const optPeajesRetorno = `<option value="">-</option>${optPeajes}`;

        const optPasajesAux = `<option value="">-</option>` +
            ubicaciones.map(u => `<option value="${esc(u.nombre_ubicacion)}">${esc(u.nombre_ubicacion)}</option>`).join("");

        const optResponsable = `<option value="">Responsable...</option>` +
            personal.map(p => `<option value="${esc(p.id_personal)}">${esc(p.nombre_apellido)}</option>`).join("");

        const selGastos = gastosEstimados.map(g =>
            `<option value="${esc(g.id_gasto_estimado)}" data-generico="${esc(g.gasto_generico)}">${esc(g.titulo)}</option>`
        ).join("");

        const val = (campo, def = "") => (r && r[campo] !== null && r[campo] !== undefined ? r[campo] : def);

        let html = `
            <div class="rep-encabezado">
                <h4>LINEA DE BUSES EXPRESSO SANTA CRUZ</h4>
                <h4>PARTE DE LLEGADAS DE BUSES</h4>
            </div>

            <div class="rep-encabezado2">
                <div class="rep-linea">
                    <span>Partio de:</span>
                    <select id="selPartida">${optPartida}</select>
                    <span>Fecha:</span>
                    <span id="fechaPartida" class="fechaContenedor"></span>
                    <span>Dia:</span>
                    <span id="diaPartida" class="rep-dia">-</span>
                    <span>Llego a Cbba:</span>
                    <span id="lblLlegadaCbba">-</span>
                </div>
                <div class="rep-linea">
                    <span>Retorno de:</span>
                    <select id="selRetorno">${optRetorno}</select>
                    <span>Fecha:</span>
                    <span id="fechaRetorno" class="fechaContenedor"></span>
                    <span>Dia:</span>
                    <span id="diaRetorno" class="rep-dia">-</span>
                </div>
                <div class="rep-linea">
                    <span>Llego a:</span>
                    <select id="selLlegada">${optLlegada}</select>
                    <span>Fecha:</span>
                    <span id="fechaLlegada" class="fechaContenedor"></span>
                    <span>Dia:</span>
                    <span id="diaLlegada" class="rep-dia">-</span>
                    <span>Placa:</span>
                    <strong>${flota.placa}</strong>
                </div>
            </div>

            <div class="rep-cierre" id="repCierre"></div>

            <div class="estructuraReporteVista">
                <h2 class="rep-seccion">Ingresos</h2>

                <div class="sba">
                    <h4>Liquidacion de Pasajes: <span id="lblLiqPasajes">${val("ubicacion_retorno") ? val("ubicacion_retorno") : "-"}</span></h4>
                    <input type="number" class="repInput inpLiq" data-campo="liquidacion_pasajes" min="0" step="0.01" placeholder="0.00" value="${esc(val("liquidacion_pasajes"))}">
                </div>
                <div class="sba">
                    <h4>Liquidacion de Encomiendas: <span id="lblLiqEncomiendas">${val("ubicacion_retorno") ? val("ubicacion_retorno") : "-"}</span></h4>
                    <input type="number" class="repInput inpLiq" data-campo="liquidacion_encomiendas" min="0" step="0.01" placeholder="0.00" value="${esc(val("liquidacion_encomiendas"))}">
                </div>
                <div class="sba">
                    <h4>Liquidacion de Pasajes:
                        <span id="auxMontero" style="display:none;">Montero</span>
                        <select id="selPasajesAux" class="repSelectAux">${optPasajesAux}</select>
                    </h4>
                    <input type="number" class="repInput inpLiq" data-campo="liquidacion_pasajes_auxiliar" min="0" step="0.01" placeholder="0.00" value="${esc(val("liquidacion_pasajes_auxiliar"))}">
                </div>
                <div class="sba">
                    <div class="sba g2">
                        <h4 class="tal">Asignacion $ en:</h4>
                        <select id="selTipoPago">
                                <option value="efectivo">Efectivo</option>
                                <option value="qr">Qr</option>
                                <option value="ambos" selected>Ambos</option>
                        </select>
                        <div id="inputTipoPagos"></div>
                    </div>
                    <input type="number" class="repInput" id="sumaAsignacion" disabled placeholder="0.00">
                </div>

                <div class="sba rep-ingresosRow">
                    <div class="rep-nota">
                        <h4>Otros:</h4>
                        <input type="text" class="repInput" id="inpOtros" maxlength="300" placeholder="Detalle" value="${esc(val("otros"))}">
                    </div>
                </div>

                <div class="sba">
                    <h4>Total Efectivo:</h4>
                    <input type="number" class="repInput" id="totalEfectivo" disabled placeholder="0.00">
                </div>

                <h2 class="rep-seccion">Gastos</h2>

                <div class="sba">
                    <h4>Diesel de: Cochabamba <span>A:</span> <span id="lblDiesel1">${val("ubicacion_retorno") ? val("ubicacion_retorno") : "-"}</span></h4>
                    <div class="rep-derecha">
                        <label class="rep-check">Factura Ok <input type="checkbox" id="chkDieselPartida" ${val("factura_diesel_partida") ? "checked" : ""}></label>
                        <input type="number" class="repInput" id="inpDieselPartida" min="0" step="0.01" placeholder="0.00" value="${esc(val("diesel_partida"))}">
                    </div>
                </div>
                <div class="sba">
                    <h4>Diesel de: <span id="lblDiesel2">${val("ubicacion_retorno") ? val("ubicacion_retorno") : "-"}</span> a: Cochabamba</h4>
                    <div class="rep-derecha">
                        <label class="rep-check">Factura Ok <input type="checkbox" id="chkDieselRetorno" ${val("factura_diesel_retorno") ? "checked" : ""}></label>
                        <input type="number" class="repInput" id="inpDieselLlegada" min="0" step="0.01" placeholder="0.00" value="${esc(val("diesel_llegada"))}">
                    </div>
                </div>
                <div class="sba">
                    <h4>Peaje de: Cochabamba <span>a:</span> <span id="lblPeaje1">${val("ubicacion_retorno") ? val("ubicacion_retorno") : "-"}</span></h4>
                    <div class="rep-derecha">
                        <select id="selPeajeIda" class="repSelect">${optPeajesIda}</select>
                        <input type="number" class="repInput inpPeaje" id="inpPeajeIda" min="0" step="0.01" placeholder="0.00" value="${esc(val("peaje_ida"))}">
                    </div>
                </div>
                <div class="sba">
                    <h4>Peaje de: <span id="lblPeaje2">${val("ubicacion_retorno") ? val("ubicacion_retorno") : "-"}</span> a: Cochabamba</h4>
                    <div class="rep-derecha">
                        <select id="selPeajeRetorno" class="repSelect">${optPeajesRetorno}</select>
                        <input type="number" class="repInput inpPeaje" id="inpPeajeRetorno" min="0" step="0.01" placeholder="0.00" value="${esc(val("peaje_retorno"))}">
                    </div>
                </div>

                <div class="sba rep-otros">
                    <div class="rep-otros-left">
                        <div class="rep-otros-header">
                            <h2 class="rep-otros-titulo">Otros</h2>
                            <div class="rep-botones">
                                <button id="addGastoBtn" class="btnAddDetalle">Agregar Gasto</button>
                                <button id="addAnomaliaBtn" class="btnAddDetalle">Agregar Anomalia</button>
                            </div>
                        </div>
                        <div id="listaGastos"></div>
                        <div id="listaAnomalias"></div>
                    </div>
                </div>

                <div class="sba">
                    <h4>Gastos Totales:</h4>
                    <input type="number" class="repInput" id="totalGastosOtros" disabled placeholder="0.00" value="${esc(val("gastos_totales"))}">
                </div>

                <h2 class="rep-seccion">Balance</h2>

                <div class="sba">
                    <h4>Resultado (Ingresos - Gastos):</h4>
                    <input type="number" class="repInput" id="totalBalance" disabled placeholder="0.00">
                </div>
            </div>
        `;

        cont.innerHTML = html;

        const tipoPagos = document.getElementById("inputTipoPagos");

        const hoyISO = fechaDMYToISO(hoy);
        const campos = {
            partida: crearCampoFecha(val("fecha_partida") || hoyISO),
            retorno: crearCampoFecha(val("fecha_retorno") || hoyISO),
            llegada: crearCampoFecha(val("fecha_llegada") || hoyISO)
        };

        document.getElementById("fechaPartida").appendChild(campos.partida);
        document.getElementById("fechaRetorno").appendChild(campos.retorno);
        document.getElementById("fechaLlegada").appendChild(campos.llegada);

        const mostrarUltimoFinalizado = () => {
            if (!ultimo) return "";
            const f = fechaISOToDMY(ultimo.fecha_llegada) || "-";
            return `
                <div class="rep-cierreTag rep-cierreOk">
                    <strong>Reporte #${ultimo.id_reporte} finalizado</strong>
                    <span>Llegada: ${f} - ${ultimo.viajes} viaje(s) - ${fmt(ultimo.aceite_consumido, 2)} L de aceite</span>
                </div>
            `;
        };

        const selLlegada = document.getElementById("selLlegada");
        let viajesRep = r ? (parseInt(r.viajes, 10) || contarTramos(selLlegada.value)) : contarTramos(selLlegada.value);
        if (viajesRep < 1) viajesRep = 1;
        if (viajesRep > MAX_VIAJES) viajesRep = MAX_VIAJES;

        const ajustarViajes = (delta) => {
            let v = viajesRep + delta;
            if (v < 1) v = 1;
            if (v > MAX_VIAJES) v = MAX_VIAJES;
            viajesRep = v;
            actualizarResumenCierre();
        };

        const actualizarResumenCierre = () => {
            const cont = document.getElementById("repCierre");
            if (!cont) return;

            if (!r) {
                cont.innerHTML = mostrarUltimoFinalizado();
                return;
            }

            const lpv = num(aceite.litros_por_viaje) || 0;
            const consumo = lpv * viajesRep;
            const restante = (num(aceite.aceite_actual) || 0) - consumo;
            const capacidad = num(flota.capacidad_aceite) || 0;
            const viajes_aceite = parseInt(aceite.viajes_aceite, 10) || 0;
            const insuficiente = restante < lpv;

            cont.innerHTML = `
                ${mostrarUltimoFinalizado()}
                <div class="rep-cierreTag ${insuficiente ? "rep-cierreAlerta" : ""}">
                    <div class="rep-cierreItem">
                        <span class="rep-cierreLabel">Viajes del reporte</span>
                        <div class="fechaParte rep-viajes">
                            <button type="button" class="fechaBtn" id="viajesMenos">&minus;</button>
                            <input type="text" class="fechaInp" id="inpViajes" value="${viajesRep}" readonly>
                            <button type="button" class="fechaBtn" id="viajesMas">+</button>
                        </div>
                    </div>
                    <div class="rep-cierreItem">
                        <span class="rep-cierreLabel">Consumo de aceite</span>
                        <strong>${fmt(consumo, 2)} L</strong>
                    </div>
                    <div class="rep-cierreItem">
                        <span class="rep-cierreLabel">Por viaje</span>
                        <strong>${fmt(lpv, 3)} L</strong>
                    </div>
                    <div class="rep-cierreItem">
                        <span class="rep-cierreLabel">Aceite en flota</span>
                        <strong>${fmt(restante, 2)} / ${fmt(capacidad, 0)} L</strong>
                    </div>
                    <div class="rep-cierreItem">
                        <span class="rep-cierreLabel">Viajes desde el ultimo cambio</span>
                        <strong>${viajes_aceite}</strong>
                    </div>
                </div>
                ${insuficiente ? `<p class="rep-cierreAviso">No hay aceite suficiente para el siguiente viaje. Al finalizar quedara un aviso de recarga.</p>` : ""}
            `;

            const menos = document.getElementById("viajesMenos");
            const mas = document.getElementById("viajesMas");
            if (menos) menos.addEventListener("click", () => ajustarViajes(-1));
            if (mas) mas.addEventListener("click", () => ajustarViajes(1));
        };

        selLlegada.addEventListener("change", () => {
            viajesRep = contarTramos(selLlegada.value);
            if (viajesRep > MAX_VIAJES) viajesRep = MAX_VIAJES;
            actualizarResumenCierre();
        });

        const refrescarDias = () => {
            document.getElementById("diaPartida").textContent = campos.partida.getDia();
            document.getElementById("diaRetorno").textContent = campos.retorno.getDia();
            document.getElementById("diaLlegada").textContent = campos.llegada.getDia();
            document.getElementById("lblLlegadaCbba").textContent = campos.llegada.getDMY() || "-";
        };

        [campos.partida, campos.retorno, campos.llegada].forEach(c =>
            c.addEventListener("fechaCambio", refrescarDias)
        );

        refrescarDias();
        actualizarResumenCierre();

        function renderTipoPagos() {
            const t = document.getElementById("selTipoPago").value;
            let h = "";
            if (t === "efectivo" || t === "ambos") {
                h += `<label>Efectivo: <input type="number" class="repInput inpAsignacion" data-campo="efectivo" min="0" step="0.01" placeholder="0.00" value="${esc(val("asignacion_efectivo"))}"></label>`;
            }
            if (t === "qr" || t === "ambos") {
                h += `<label>Qr: <input type="number" class="repInput inpAsignacion" data-campo="qr" min="0" step="0.01" placeholder="0.00" value="${esc(val("asignacion_qr"))}"></label>`;
            }
            tipoPagos.innerHTML = h;
            tipoPagos.querySelectorAll(".inpAsignacion").forEach(inp => {
                inp.addEventListener("input", actualizarSumas);
                inp.addEventListener("keydown", decimalFilter);
            });
        }

        function actualizarSumas() {
            const liq = Array.from(document.querySelectorAll(".inpLiq")).reduce((acc, i) => acc + (num(i.value) || 0), 0);
            const asig = Array.from(document.querySelectorAll(".inpAsignacion")).reduce((acc, i) => acc + (num(i.value) || 0), 0);
            const totalIngresos = liq + asig;
            document.getElementById("sumaAsignacion").value = asig.toFixed(2);
            document.getElementById("totalEfectivo").value = totalIngresos.toFixed(2);
            actualizarBalance(totalIngresos);
        }

        function actualizarLabelsRetorno() {
            const valor = document.getElementById("selRetorno").value;
            const lbl = valor || "-";
            document.getElementById("lblLiqPasajes").textContent = lbl;
            document.getElementById("lblLiqEncomiendas").textContent = lbl;
            document.getElementById("lblDiesel1").textContent = lbl;
            document.getElementById("lblDiesel2").textContent = lbl;
            document.getElementById("lblPeaje1").textContent = lbl;
            document.getElementById("lblPeaje2").textContent = lbl;

            const auxMontero = document.getElementById("auxMontero");
            const selAux = document.getElementById("selPasajesAux");
            if (valor === "Santa Cruz") {
                auxMontero.style.display = "";
                selAux.style.display = "none";
            } else {
                auxMontero.style.display = "none";
                selAux.style.display = "";
            }
        }

        document.getElementById("selTipoPago").addEventListener("change", renderTipoPagos);
        renderTipoPagos();

        document.getElementById("selRetorno").addEventListener("change", actualizarLabelsRetorno);
        actualizarLabelsRetorno();

        document.querySelectorAll("input[type=number]:not(:disabled)").forEach(inp =>
            inp.addEventListener("keydown", decimalFilter)
        );

        document.querySelectorAll(".inpLiq").forEach(inp => inp.addEventListener("input", actualizarSumas));
        document.querySelectorAll(".inpAsignacion").forEach(inp => inp.addEventListener("input", actualizarSumas));
        actualizarSumas();

        function seleccionarPeaje(sel, inp, valorInicial) {
            sel.addEventListener("change", () => {
                inp.value = sel.value;
                actualizarTotalGastosOtros();
            });
            if (sel.value !== "") {
                inp.value = sel.value;
            } else if (valorInicial !== "" && valorInicial !== null && valorInicial !== undefined) {
                inp.value = valorInicial;
            }
        }

        const peajeIdaSel = document.getElementById("selPeajeIda");
        const peajeRetornoSel = document.getElementById("selPeajeRetorno");
        seleccionarPeaje(peajeIdaSel, document.getElementById("inpPeajeIda"), val("peaje_ida"));
        seleccionarPeaje(peajeRetornoSel, document.getElementById("inpPeajeRetorno"), val("peaje_retorno"));

        if (peajes.length > 0) {
            if (peajeIdaSel.value === "") peajeIdaSel.value = peajes[0].precio_peaje;
            if (peajeRetornoSel.value === "") peajeRetornoSel.value = peajes[0].precio_peaje;
            document.getElementById("inpPeajeIda").value = peajeIdaSel.value;
            document.getElementById("inpPeajeRetorno").value = peajeRetornoSel.value;
        }

        document.querySelectorAll("#inpDieselPartida, #inpDieselLlegada, .inpPeaje")
            .forEach(inp => inp.addEventListener("input", actualizarTotalGastosOtros));

        const mapaDetalles = new Map(gastosEstimados.filter(g => (g.detalles || []).length > 0)
            .map(g => [String(g.id_gasto_estimado), g.detalles]));

        function actualizarBalance(totalIngresos) {
            const el = document.getElementById("totalBalance");
            if (!el) return;
            const total = totalIngresos === undefined
                ? (num(document.getElementById("totalEfectivo").value) || 0)
                : totalIngresos;
            el.value = (total - calcularTotalGastos()).toFixed(2);
        }

        function calcularTotalGastos() {
            const diesel = (num(document.getElementById("inpDieselPartida").value) || 0)
                + (num(document.getElementById("inpDieselLlegada").value) || 0);
            const peajes = (num(document.getElementById("inpPeajeIda").value) || 0)
                + (num(document.getElementById("inpPeajeRetorno").value) || 0);
            const otros = Array.from(document.querySelectorAll(".inpPrecio, .inpMontoAnomalia"))
                .reduce((acc, i) => acc + (num(i.value) || 0), 0);
            return diesel + peajes + otros;
        }

        function actualizarTotalGastosOtros() {
            const el = document.getElementById("totalGastosOtros");
            if (el) el.value = calcularTotalGastos().toFixed(2);
            actualizarBalance();
        }

        function construirFilaGasto(datos) {
            const fila = document.createElement("div");
            fila.className = "filaGasto";

            fila.innerHTML = `
                <div class="filaGasto-top">
                    <select class="selGasto">
                        <option value="">Gasto...</option>
                        ${selGastos}
                    </select>
                    <select class="selDetalle" style="display:none;">
                        <option value="">Detalle...</option>
                    </select>
                    <input type="number" class="repInput inpPrecio" min="0" step="0.01" placeholder="0.00">
                </div>
                <div class="filaGasto-bottom">
                    <select class="selResponsable">${optResponsable}</select>
                    <button class="btnQuitarFila" type="button" title="Eliminar"><img src="img/trash.svg" alt="eliminar"></button>
                </div>
            `;

            const selG = fila.querySelector(".selGasto");
            const selD = fila.querySelector(".selDetalle");
            const inpP = fila.querySelector(".inpPrecio");
            const selR = fila.querySelector(".selResponsable");

            function aplicarGasto() {
                const id = selG.value;
                selD.innerHTML = `<option value="">Detalle...</option>`;
                selD.style.display = "none";
                inpP.value = "";
                if (id === "") return;

                const opt = selG.options[selG.selectedIndex];
                const generico = opt.dataset.generico;

                const detalles = mapaDetalles.get(id);
                if (detalles && detalles.length > 0) {
                    selD.innerHTML = `<option value="">Detalle...</option>` +
                        detalles.map(d => `<option value="${esc(d.gasto_particular)}">${esc(d.detalle)}</option>`).join("");
                    selD.style.display = "";
                    selD.value = "";
                    inpP.value = generico || "";
                } else {
                    inpP.value = generico || "";
                }
            }

            selG.addEventListener("change", aplicarGasto);
            selD.addEventListener("change", () => {
                inpP.value = selD.value;
            });
            inpP.addEventListener("keydown", decimalFilter);
            inpP.addEventListener("input", actualizarTotalGastosOtros);
            fila.querySelector(".btnQuitarFila").addEventListener("click", () => {
                fila.remove();
                actualizarTotalGastosOtros();
            });

            if (datos) {
                const matchG = Array.from(selG.options).find(o => o.text === datos.titulo);
                if (matchG) {
                    selG.value = matchG.value;
                    aplicarGasto();
                    if (datos.gasto_generico !== null && datos.gasto_generico !== undefined) inpP.value = datos.gasto_generico;
                } else {
                    inpP.value = datos.gasto_generico || "";
                }
                if (datos.id_personal) {
                    const inPersonal = Array.from(selR.options).some(o => o.value === String(datos.id_personal));
                    if (inPersonal) selR.value = String(datos.id_personal);
                }
            }

            return fila;
        }

        function construirFilaAnomalia(datos) {
            const fila = document.createElement("div");
            fila.className = "filaAnomalia";
            fila.innerHTML = `
                <input type="text" class="inpDetAnomalia" maxlength="150" placeholder="Detalle anomalia">
                <input type="number" class="repInput inpMontoAnomalia" min="0" step="0.01" placeholder="0.00">
                <button class="btnQuitarFila" type="button" title="Eliminar"><img src="img/trash.svg" alt="eliminar"></button>
            `;
            if (datos) {
                fila.querySelector(".inpDetAnomalia").value = esc(datos.detalle_anomalia);
                fila.querySelector(".inpMontoAnomalia").value = esc(datos.gasto_subanomalia);
            }
            fila.querySelector(".inpMontoAnomalia").addEventListener("keydown", decimalFilter);
            fila.querySelector(".inpMontoAnomalia").addEventListener("input", actualizarTotalGastosOtros);
            fila.querySelector(".btnQuitarFila").addEventListener("click", () => {
                fila.remove();
                actualizarTotalGastosOtros();
            });
            return fila;
        }

        document.getElementById("addGastoBtn").addEventListener("click", () => {
            document.getElementById("listaGastos").appendChild(construirFilaGasto(null));
            actualizarTotalGastosOtros();
        });
        document.getElementById("addAnomaliaBtn").addEventListener("click", () => {
            document.getElementById("listaAnomalias").appendChild(construirFilaAnomalia(null));
            actualizarTotalGastosOtros();
        });

        gastosBD.forEach(g => document.getElementById("listaGastos").appendChild(construirFilaGasto(g)));
        anomaliasBD.forEach(a => document.getElementById("listaAnomalias").appendChild(construirFilaAnomalia(a)));
        actualizarTotalGastosOtros();

        document.getElementById("guardarReporteBtn").addEventListener("click", guardarReporte);
        document.getElementById("imprimirReporteBtn").addEventListener("click", () => imprimirParte(datosParaImprimir()));

        function datoInput(sel) {
            return num(document.querySelector(sel)?.value) || 0;
        }

        function textoSel(sel) {
            const el = document.querySelector(sel);
            if (!el || el.value === "") return "";
            return el.options[el.selectedIndex].text;
        }

        function opcionSel(sel, indice) {
            const el = document.querySelector(sel);
            if (!el) return "";
            return el.selectedIndex > indice ? el.options[el.selectedIndex].text : "";
        }

        function facturaOk(sel) {
            return document.querySelector(sel).checked ? " (Factura Ok)" : "";
        }

        /* Arma la hoja con el estado actual del formulario, sin necesidad de guardar */
        function datosParaImprimir() {
            const retorno = textoSel("#selRetorno") || "-";
            const llegada = textoSel("#selLlegada") || "-";
            const auxTexto = retorno === "Santa Cruz" ? "Montero" : (document.getElementById("selPasajesAux").value || "-");
            const tipoPago = { efectivo: "Efectivo", qr: "Qr", ambos: "Ambos" }[document.getElementById("selTipoPago").value] || "";
            const hayMasDeUnPago = document.querySelectorAll(".inpAsignacion").length > 1;

            const ingresos = [
                { texto: `Liquidacion de pasajes: ${retorno}`, monto: datoInput('.inpLiq[data-campo="liquidacion_pasajes"]') },
                { texto: `Liquidacion de encomiendas: ${retorno}`, monto: datoInput('.inpLiq[data-campo="liquidacion_encomiendas"]') },
                { texto: `Liquidacion de pasajes: ${auxTexto}`, monto: datoInput('.inpLiq[data-campo="liquidacion_pasajes_auxiliar"]') }
            ];

            document.querySelectorAll(".inpAsignacion").forEach(inp => {
                const etiqueta = inp.dataset.campo === "qr" ? "Qr" : "Efectivo";
                ingresos.push({
                    texto: `Asignacion $ en: ${hayMasDeUnPago ? tipoPago + " - " + etiqueta : etiqueta}`,
                    monto: num(inp.value) || 0
                });
            });

            const egresos = [
                { texto: `Diesel de: Cochabamba a: ${retorno}${facturaOk("#chkDieselPartida")}`, monto: datoInput("#inpDieselPartida") },
                { texto: `Diesel de: ${retorno} a: Cochabamba${facturaOk("#chkDieselRetorno")}`, monto: datoInput("#inpDieselLlegada") },
                { texto: `Peaje de: Cochabamba a: ${retorno}`, monto: datoInput("#inpPeajeIda") },
                { texto: `Peaje de: ${retorno} a: Cochabamba`, monto: datoInput("#inpPeajeRetorno") }
            ];

            document.querySelectorAll(".filaGasto").forEach(f => {
                const monto = num(f.querySelector(".inpPrecio").value);
                const titulo = opcionSel(f.querySelector(".selGasto"), 0);
                const detalle = opcionSel(f.querySelector(".selDetalle"), 0);
                const responsable = opcionSel(f.querySelector(".selResponsable"), 0);
                if (titulo === "" && detalle === "" && monto === null) return;
                egresos.push({
                    texto: [titulo, detalle, responsable].filter(Boolean).join(" - "),
                    monto: monto || 0
                });
            });

            document.querySelectorAll(".filaAnomalia").forEach(f => {
                const detalle = f.querySelector(".inpDetAnomalia").value.trim();
                const monto = num(f.querySelector(".inpMontoAnomalia").value);
                if (detalle === "" && monto === null) return;
                egresos.push({
                    texto: detalle === "" ? "Anomalia" : `Anomalia - ${detalle}`,
                    monto: monto || 0
                });
            });

            const totalIngresos = ingresos.reduce((a, i) => a + i.monto, 0);
            const totalEgresos = egresos.reduce((a, e) => a + e.monto, 0);

            const fechaDe = (c) => ({ fecha: c.getDMY() || "-", dia: c.getDia() || "-" });

            return {
                placa: flota.placa,
                partida: Object.assign({ lugar: textoSel("#selPartida") || "-" }, fechaDe(campos.partida)),
                retorno: Object.assign({ lugar: retorno }, fechaDe(campos.retorno)),
                llegada: Object.assign({ lugar: llegada }, fechaDe(campos.llegada)),
                llegada_cbba: campos.llegada.getDMY() || "-",
                ingresos: ingresos,
                egresos: egresos,
                otros_ingresos: document.getElementById("inpOtros").value.trim(),
                total_ingresos: totalIngresos,
                total_egresos: totalEgresos,
                balance: totalIngresos - totalEgresos
            };
        }

        function construirPayload() {
            const gastos = Array.from(document.querySelectorAll(".filaGasto")).map(fila => {
                const selG = fila.querySelector(".selGasto");
                const selR = fila.querySelector(".selResponsable");
                const titulo = selG.selectedIndex > 0 ? selG.options[selG.selectedIndex].text : "";
                const precio = num(fila.querySelector(".inpPrecio").value);
                if (titulo === "" && precio === null) return null;
                return {
                    titulo: titulo,
                    gasto_generico: precio,
                    id_personal: selR.value ? parseInt(selR.value) : 0
                };
            }).filter(Boolean);

            const anomalias = Array.from(document.querySelectorAll(".filaAnomalia")).map(fila => {
                const detalle = fila.querySelector(".inpDetAnomalia").value.trim();
                const monto = num(fila.querySelector(".inpMontoAnomalia").value);
                if (detalle === "" && monto === null) return null;
                return { detalle_anomalia: detalle, gasto_subanomalia: monto };
            }).filter(Boolean);

            const totalOtros = Array.from(document.querySelectorAll(".inpPrecio, .inpMontoAnomalia"))
                .reduce((acc, i) => acc + (num(i.value) || 0), 0);

            return {
                placa: flota.placa,
                fecha_partida: campos.partida.getISO(),
                fecha_retorno: campos.retorno.getISO(),
                fecha_llegada: campos.llegada.getISO(),
                liquidacion_pasajes: num(document.querySelector('.inpLiq[data-campo="liquidacion_pasajes"]').value),
                liquidacion_encomiendas: num(document.querySelector('.inpLiq[data-campo="liquidacion_encomiendas"]').value),
                liquidacion_pasajes_auxiliar: num(document.querySelector('.inpLiq[data-campo="liquidacion_pasajes_auxiliar"]').value),
                diesel_partida: num(document.getElementById("inpDieselPartida").value),
                diesel_llegada: num(document.getElementById("inpDieselLlegada").value),
                factura_diesel_partida: document.getElementById("chkDieselPartida").checked,
                factura_diesel_retorno: document.getElementById("chkDieselRetorno").checked,
                peaje_ida: num(document.getElementById("inpPeajeIda").value),
                peaje_retorno: num(document.getElementById("inpPeajeRetorno").value),
                otros: document.getElementById("inpOtros").value.trim() || null,
                gasto_otros: totalOtros,
                gastos_totales: calcularTotalGastos(),
                ubicacion_retorno: document.getElementById("selRetorno").value || null,
                ubicacion_llegada: selLlegada.value || null,
                asignacion_efectivo: num(Array.from(document.querySelectorAll('.inpAsignacion[data-campo="efectivo"]'))[0]?.value),
                asignacion_qr: num(Array.from(document.querySelectorAll('.inpAsignacion[data-campo="qr"]'))[0]?.value),
                gastos: gastos,
                anomalias: anomalias,
                viajes: viajesRep
            };
        }

        function guardarReporte() {
            const payload = construirPayload();
            const esNuevo = !r;
            if (!esNuevo) payload.id_reporte = r.id_reporte;
            const url = esNuevo ? "php/api/store/reporte/route.php" : "php/api/store/reporteEditar/route.php";

            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(resp => resp.json())
            .then(result => {
                if (result.status === "success") {
                    reporteViaje(flota.placa);
                } else {
                    abrirAlert({ mensaje: result.message });
                }
            })
            .catch(error => {
                abrirAlert({ mensaje: "Error al guardar el reporte." });
                console.error(error);
            });
        }

        function finalizarReporte() {
            if (!r) {
                abrirAlert({ mensaje: "No hay ningun reporte abierto para finalizar." });
                return;
            }

            const payload = construirPayload();
            payload.id_reporte = r.id_reporte;

            if (!payload.fecha_llegada) {
                abrirAlert({ mensaje: "Completa el dia, mes y anio de la fecha de llegada antes de finalizar." });
                return;
            }

            const viajes = viajesRep;

            abrirConfirmation({
                titulo: "Finalizar Reporte",
                mensaje: `Se guardara el reporte y ya no podras editarlo. Al finalizar se sumaran <strong>${viajes} viaje(s)</strong> a la flota y a sus ruedas, y se descontaran <strong>${fmt((num(aceite.litros_por_viaje) || 0) * viajes, 2)} L</strong> de aceite.`,
                botonAceptar: "FINALIZAR",
                onAceptar: () => {
                    fetch("php/api/store/reporteFinalizar/route.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    })
                    .then(resp => resp.json())
                    .then(result => {
                        if (result.status !== "success") {
                            abrirAlert({ mensaje: result.message });
                            return;
                        }
                        const btn = document.getElementById("finalizarReporteBtn");
                        if (btn) btn.disabled = true;
                        abrirConfirmation({
                            titulo: "Reporte finalizado",
                            mensaje: `Reporte <strong>#${result.id}</strong> finalizado.<br><br>
                                      Viajes sumados: <strong>${result.viajes}</strong><br>
                                      Aceite consumido: <strong>${fmt(result.aceite_consumido, 2)} L</strong><br>
                                      Aceite restante: <strong>${fmt(result.aceite_restante, 2)} L</strong><br>
                                      Ruedas actualizadas: <strong>${result.ruedas_afectadas}</strong>`,
                            botonAceptar: "IR A REPORTES",
                            onAceptar: () => reportesView()
                        });
                    })
                    .catch(error => {
                        abrirAlert({ mensaje: "Error al finalizar el reporte." });
                        console.error(error);
                    });
                }
            });
        }

    } catch (error) {
        cont.innerHTML = "<p>Error al cargar el reporte</p>";
        console.error(error);
    }
}
