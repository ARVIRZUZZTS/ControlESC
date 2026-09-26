import { reportesView } from "../reportesView.js";
import { strFechaDMY, fechaISOToDMY, fechaDMYToISO, fechaFilter, fechaMask, decimalFilter } from "../../utils.js";
import { abrirAlert } from "../../components/modal.js";

const DIAS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

function diaDeFecha(f) {
    if (!f) return "-";
    const partes = f.split("/");
    if (partes.length !== 3) return "-";
    const dt = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    return DIAS[dt.getDay()];
}

function num(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? null : n;
}

function esc(v) {
    return v === null || v === undefined ? "" : String(v);
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
        const gastosBD = data.gastos || [];
        const anomaliasBD = data.anomalias || [];

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
                <button id="guardarReporteBtn"><img src="img/save.svg" alt="Guardar">Guardar</button>
                <button id="reportesListBtn"><img src="img/reportesList.svg" alt="Reportes"> Reportes ${flota.placa}</button>
            </div>
        `;

        document.getElementById("backBtn").addEventListener("click", reportesView);
        document.getElementById("reportesListBtn").addEventListener("click", reportesView);

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
                    <input type="text" id="fechaPartida" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" value="${esc(fechaISOToDMY(val("fecha_partida", hoy)))}">
                    <span>Dia:</span>
                    <span id="diaPartida" class="rep-dia">${diaDeFecha(fechaISOToDMY(val("fecha_partida", hoy)))}</span>
                    <span>Llego a Cbba:</span>
                    <span id="lblLlegadaCbba">${fechaISOToDMY(val("fecha_llegada")) || "-"}</span>
                </div>
                <div class="rep-linea">
                    <span>Retorno de:</span>
                    <select id="selRetorno">${optRetorno}</select>
                    <span>Fecha:</span>
                    <input type="text" id="fechaRetorno" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" value="${esc(fechaISOToDMY(val("fecha_retorno")))}">
                    <span>Dia:</span>
                    <span id="diaRetorno" class="rep-dia">${diaDeFecha(fechaISOToDMY(val("fecha_retorno")))}</span>
                </div>
                <div class="rep-linea">
                    <span>Llego a:</span>
                    <select id="selLlegada">${optLlegada}</select>
                    <span>Fecha:</span>
                    <input type="text" id="fechaLlegada" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" value="${esc(fechaISOToDMY(val("fecha_llegada")))}">
                    <span>Dia:</span>
                    <span id="diaLlegada" class="rep-dia">${diaDeFecha(fechaISOToDMY(val("fecha_llegada")))}</span>
                    <span>Placa:</span>
                    <strong>${flota.placa}</strong>
                </div>
            </div>

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

        document.getElementById("fechaPartida").addEventListener("input", (e) => {
            fechaMask(e);
            document.getElementById("diaPartida").textContent = diaDeFecha(e.target.value);
        });
        document.getElementById("fechaRetorno").addEventListener("input", (e) => {
            fechaMask(e);
            document.getElementById("diaRetorno").textContent = diaDeFecha(e.target.value);
        });
        document.getElementById("fechaLlegada").addEventListener("input", (e) => {
            fechaMask(e);
            const v = e.target.value;
            document.getElementById("diaLlegada").textContent = diaDeFecha(v);
            document.getElementById("lblLlegadaCbba").textContent = v ? v : "-";
        });

        document.querySelectorAll("#fechaPartida, #fechaRetorno, #fechaLlegada").forEach(inp =>
            inp.addEventListener("keydown", fechaFilter)
        );

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

        function guardarReporte() {
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

            const totalOtros = Array.from(document.querySelectorAll(".inpPrecio, .inpMontoAnomalia")).reduce((acc, i) => acc + (num(i.value) || 0), 0);
            const totalGastos = calcularTotalGastos();

            const payload = {
                placa: flota.placa,
                fecha_partida: fechaDMYToISO(document.getElementById("fechaPartida").value),
                fecha_retorno: fechaDMYToISO(document.getElementById("fechaRetorno").value),
                fecha_llegada: fechaDMYToISO(document.getElementById("fechaLlegada").value),
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
                gastos_totales: totalGastos,
                ubicacion_retorno: document.getElementById("selRetorno").value || null,
                ubicacion_llegada: document.getElementById("selLlegada").value || null,
                asignacion_efectivo: num(Array.from(document.querySelectorAll('.inpAsignacion[data-campo="efectivo"]'))[0]?.value),
                asignacion_qr: num(Array.from(document.querySelectorAll('.inpAsignacion[data-campo="qr"]'))[0]?.value),
                gastos: gastos,
                anomalias: anomalias
            };

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

    } catch (error) {
        cont.innerHTML = "<p>Error al cargar el reporte</p>";
        console.error(error);
    }
}