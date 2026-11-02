import { abrirAlert } from "../../components/modal.js";
import { fechaISOToDMY } from "../../utils.js";
import { diaDeFechaISO } from "../../components/fechaCampo.js";
import { abrirHojaImpresion as abrirVentana, imprimirHTML } from "../../print/imprimirHoja.js";

/* Si la hoja de estilos no llegara a cargar (por ejemplo si se abre el reporte
   desde otra carpeta), al menos se conservan los margenes de la hoja. */
const CSS_CRITICO = "@page { margin: 0.5cm; }";

const CSS_HOJA = "css/imprimirReporte.css";

function esc(v) {
    if (v === null || v === undefined) return "";
    return String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function num(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}

function fmt(v) {
    const n = num(v);
    return (n === null ? 0 : n).toFixed(2);
}

function fmtSigno(v) {
    const n = num(v) || 0;
    return (n < 0 ? "-" : "") + Math.abs(n).toFixed(2);
}

/* Cada campo es "Etiqueta: valor" con la linea punteada debajo, estirandose
   hasta el final del ancho de la hoja. El relleno es flex, asi que el punteado
   siempre llega al borde sin tener que calcular medidas. */
function campo(etiqueta, valor) {
    return `<span class="pg-campo"><span class="pg-eti">${esc(etiqueta)}</span> <span class="pg-val">${esc(valor)}</span><span class="pg-llena"></span></span>`;
}

function filaCampos(campos) {
    return `<div class="pg-fila">${campos.map(c => campo(c[0], c[1])).join("")}</div>`;
}

/* Las 4 columnas: texto | egresos | ingresos | subtotal */
function celda({ texto = "", egreso = null, ingreso = null, total = null }) {
    const der = (v) => (v === null || v === undefined ? "" : fmt(v));
    return `<tr>
        <td class="c1">${texto}</td>
        <td class="c2">${der(egreso)}</td>
        <td class="c3">${der(ingreso)}</td>
        <td class="c4">${total === null || total === undefined ? "" : fmtSigno(total)}</td>
    </tr>`;
}

/* Titulo de seccion: va en la columna de texto, no centrado en la hoja.
   El padding de arriba deja la separacion respecto de la fila anterior. */
function seccion(titulo) {
    return `<tr class="pg-sec-fila">
        <td class="c1 pg-sec">${esc(titulo)}</td>
        <td class="c2"></td>
        <td class="c3"></td>
        <td class="c4"></td>
    </tr>`;
}

function bloque(d) {

    const ingresos = (d.ingresos || []).map(i => celda({ texto: esc(i.texto), ingreso: i.monto }));
    if (d.otros_ingresos) ingresos.push(celda({ texto: `<span class="pg-nota">${esc(d.otros_ingresos)}</span>` }));
    ingresos.push(celda({ texto: `<span class="pg-tot">TOTAL INGRESOS</span>`, ingreso: d.total_ingresos }));

    const egresos = (d.egresos || []).map(e => celda({ texto: esc(e.texto), egreso: e.monto }));
    egresos.push(celda({ texto: `<span class="pg-tot">TOTAL EGRESOS</span>`, egreso: d.total_egresos }));

    return `
<div class="pg-tit">LINEA DE BUSES EXPRESSO SANTA CRUZ <span class="pg-badge-viajes">${esc(d.viajes_aceite ?? 0)}.</span></div>
<div class="pg-sub">PARTE DE LLEGADAS DE BUSES</div>

<div class="pg-cab">
    ${filaCampos([["Partio de:", d.partida.lugar]])}
    ${filaCampos([["Fecha:", d.partida.fecha], ["Dia:", d.partida.dia], ["Llego a Cbba:", d.llegada_cbba]])}
    ${filaCampos([["Retorno de:", d.retorno.lugar]])}
    ${filaCampos([["Fecha:", d.retorno.fecha], ["Dia:", d.retorno.dia]])}
    ${filaCampos([["Llego a:", d.llegada.lugar]])}
    ${filaCampos([["Fecha:", d.llegada.fecha], ["Dia:", d.llegada.dia], ["Placa:", d.placa]])}
</div>

<table class="pg-tbl">
    <colgroup><col class="w1"><col class="w2"><col class="w2"><col class="w2"></colgroup>
    <thead>
        <tr>
            <td class="c1 centro">Concepto</td>
            <td class="c2 centro">Egresos</td>
            <td class="c3 centro">Ingresos</td>
            <td class="c4 centro">Subtotal</td>
        </tr>
    </thead>
    <tbody>
        ${seccion("INGRESOS")}
        ${ingresos.join("")}
        ${seccion("EGRESOS")}
        ${egresos.join("")}
        ${seccion("BALANCE")}
        ${celda({ texto: `<span class="pg-tot">Resultado (Ingresos - Egresos)</span>`, total: d.balance })}
    </tbody>
</table>
`;
}

/* Arma los mismos datos que la hoja necesita, pero desde un reporte ya guardado
   en la base (historico). Lo que no se guarda al crear el reporte no se puede
   reimprimir: la ubicacion de la liquidacion auxiliar y el tipo de pago no
   quedan almacenados, asi que se deducen de los montos que si se guardaron. */
export function datosDesdeReporte(rep, gastos = [], anomalias = [], viajesAceite = null) {

    const d = (v) => num(v) || 0;
    const txt = (v) => (v === null || v === undefined || String(v).trim() === "" ? "-" : String(v).trim());
    const tiene = (v) => !(v === null || v === undefined || v === "");

    const retorno = txt(rep.ubicacion_retorno);
    const llegada = txt(rep.ubicacion_llegada);
    const auxTexto = rep.ubicacion_retorno === "Santa Cruz" ? "Montero" : "Auxiliar";

    const ingresos = [
        { texto: `Liquidacion de pasajes: ${retorno}`, monto: d(rep.liquidacion_pasajes) },
        { texto: `Liquidacion de encomiendas: ${retorno}`, monto: d(rep.liquidacion_encomiendas) },
        { texto: `Liquidacion de pasajes: ${auxTexto}`, monto: d(rep.liquidacion_pasajes_auxiliar) }
    ];

    const hayEf = tiene(rep.asignacion_efectivo);
    const hayQr = tiene(rep.asignacion_qr);
    const ambos = hayEf && hayQr;
    const etiquetaPago = (campo) => ambos ? `Ambos - ${campo}` : campo;
    if (hayEf) ingresos.push({ texto: `Asignacion $ en: ${etiquetaPago("Efectivo")}`, monto: d(rep.asignacion_efectivo) });
    if (hayQr) ingresos.push({ texto: `Asignacion $ en: ${etiquetaPago("Qr")}`, monto: d(rep.asignacion_qr) });

    const egresos = [
        { texto: `Diesel de: Cochabamba a: ${retorno}${rep.factura_diesel_partida ? " (Factura Ok)" : ""}`, monto: d(rep.diesel_partida) },
        { texto: `Diesel de: ${retorno} a: Cochabamba${rep.factura_diesel_retorno ? " (Factura Ok)" : ""}`, monto: d(rep.diesel_llegada) },
        { texto: `Peaje de: Cochabamba a: ${retorno}`, monto: d(rep.peaje_ida) },
        { texto: `Peaje de: ${retorno} a: Cochabamba`, monto: d(rep.peaje_retorno) }
    ];

    gastos.forEach(g => {
        const titulo = (g.titulo || "").trim();
        const responsable = (g.responsable || "").trim();
        const monto = num(g.gasto_generico);
        if (titulo === "" && monto === null) return;
        egresos.push({
            texto: [titulo, responsable].filter(Boolean).join(" - "),
            monto: monto || 0
        });
    });

    anomalias.forEach(a => {
        const detalle = (a.detalle_anomalia || "").trim();
        const monto = num(a.gasto_subanomalia);
        if (detalle === "" && monto === null) return;
        egresos.push({
            texto: detalle === "" ? "Anomalia" : `Anomalia - ${detalle}`,
            monto: monto || 0
        });
    });

    const totalIngresos = ingresos.reduce((a, i) => a + i.monto, 0);
    const totalEgresos = egresos.reduce((a, e) => a + e.monto, 0);

    const momento = (fechaISO) => ({ fecha: fechaISOToDMY(fechaISO) || "-", dia: diaDeFechaISO(fechaISO) });

    return {
        placa: rep.placa,
        partida: Object.assign({ lugar: txt(rep.ubicacion_partida) }, momento(rep.fecha_partida)),
        retorno: Object.assign({ lugar: retorno }, momento(rep.fecha_retorno)),
        llegada: Object.assign({ lugar: llegada }, momento(rep.fecha_llegada)),
        llegada_cbba: fechaISOToDMY(rep.fecha_llegada) || "-",
        ingresos: ingresos,
        egresos: egresos,
        otros_ingresos: (rep.otros || "").trim(),
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        balance: totalIngresos - totalEgresos,
        viajes_aceite: (viajesAceite === null || viajesAceite === undefined) ? (Number(rep.viajes_aceite) || 0) : (Number(viajesAceite) || 0)
    };
}

/* Abre la hoja en blanco. Delegado al modulo generico. */
export function abrirHojaImpresion() {
    return abrirVentana({ preset: "a4", titulo: "Cargando..." });
}

/* Dibuja la hoja y la manda a imprimir. Delegado al modulo generico. */
export function imprimirParte(datos, winAbierta = null) {
    return imprimirHTML({
        win: winAbierta,
        titulo: `Parte de llegadas - ${esc(datos.placa)}`,
        cssHref: CSS_HOJA,
        cssCritico: CSS_CRITICO,
        html: bloque(datos)
    });
}
