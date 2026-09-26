import { fechaDMYToISO } from "../utils.js";

const DIAS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

const LIMITES = {
    dia: { min: 1, max: 31 },
    mes: { min: 1, max: 12 },
    anio: { min: 2000, max: 2100 }
};

export function diaDeFechaISO(iso) {
    if (!iso) return "-";
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return "-";
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return DIAS[dt.getDay()];
}

function partes(iso) {
    if (!iso) return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return { dia: parseInt(m[3], 10), mes: parseInt(m[2], 10), anio: parseInt(m[1], 10) };
}

function formatoDMY(d, m, a) {
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${a}`;
}

/* Campo de fecha con 3 inputs (dia / mes / anio) y botones + / - en cada uno */
export function crearCampoFecha(valorISO) {
    const el = document.createElement("div");
    el.className = "fechaCampo";

    const p = partes(valorISO);
    const inputs = {};

    const mkParte = (parte, etiqueta) => {
        const cont = document.createElement("div");
        cont.className = "fechaParte";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.className = "fechaBtn";
        menos.textContent = "−";
        menos.title = `Restar 1 a ${etiqueta}`;

        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "fechaInp";
        inp.inputMode = "numeric";
        inp.maxLength = String(parte === "anio" ? 4 : 2);
        inp.placeholder = etiqueta.toUpperCase();
        inp.dataset.parte = parte;
        inp.setAttribute("aria-label", etiqueta);

        const mas = document.createElement("button");
        mas.type = "button";
        mas.className = "fechaBtn";
        mas.textContent = "+";
        mas.title = `Sumar 1 a ${etiqueta}`;

        const sep = () => {
            const d = leerNum("dia");
            const m = leerNum("mes");
            const a = leerNum("anio");
            const dentro = d >= 1 && d <= 31 && m >= 1 && m <= 12 && a >= LIMITES.anio.min && a <= LIMITES.anio.max;
            if (dentro && d <= diasDelMes(m, a)) {
                inp.value = String(d).padStart(2, "0");
            }
        };

        const ajustar = (delta) => {
            const lim = LIMITES[parte];
            const actual = leerNum(parte);
            const base = actual === null ? (delta > 0 ? lim.min - delta : lim.max - delta) : actual;
            let v = base + delta;
            if (v < lim.min) v = lim.min;
            if (v > lim.max) v = lim.max;
            inp.value = String(v).padStart(parte === "anio" ? 4 : 2, "0");
            sep();
            el.dispatchEvent(new Event("fechaCambio", { bubbles: true }));
        };

        menos.addEventListener("click", () => ajustar(-1));
        mas.addEventListener("click", () => ajustar(1));
        inp.addEventListener("input", () => {
            inp.value = inp.value.replace(/\D/g, "").slice(0, inp.maxLength);
            sep();
            el.dispatchEvent(new Event("fechaCambio", { bubbles: true }));
        });
        inp.addEventListener("blur", () => {
            const v = leerNum(parte);
            if (v === null) return;
            const lim = LIMITES[parte];
            let n = v;
            if (n < lim.min) n = lim.min;
            if (n > lim.max) n = lim.max;
            inp.value = String(n).padStart(parte === "anio" ? 4 : 2, "0");
            sep();
        });

        cont.appendChild(menos);
        cont.appendChild(inp);
        cont.appendChild(mas);

        inputs[parte] = inp;
        return cont;
    };

    const leerNum = (parte) => {
        const v = inputs[parte].value.replace(/\D/g, "");
        return v === "" ? null : parseInt(v, 10);
    };

    el.appendChild(mkParte("dia", "Dia"));
    const sep1 = document.createElement("span");
    sep1.className = "fechaSep";
    sep1.textContent = "/";
    el.appendChild(sep1);
    el.appendChild(mkParte("mes", "Mes"));
    const sep2 = document.createElement("span");
    sep2.className = "fechaSep";
    sep2.textContent = "/";
    el.appendChild(sep2);
    el.appendChild(mkParte("anio", "Anio"));

    if (p) {
        inputs.dia.value = String(p.dia).padStart(2, "0");
        inputs.mes.value = String(p.mes).padStart(2, "0");
        inputs.anio.value = String(p.anio);
    }

    el.getDMY = () => {
        const d = leerNum("dia");
        const m = leerNum("mes");
        const a = leerNum("anio");
        if (d === null || m === null || a === null) return "";
        if (d < 1 || d > 31 || m < 1 || m > 12) return "";
        if (d > diasDelMes(m, a)) return "";
        return formatoDMY(d, m, a);
    };

    el.getISO = () => fechaDMYToISO(el.getDMY());
    el.getDia = () => diaDeFechaISO(el.getISO());

    return el;
}

function diasDelMes(mes, anio) {
    return new Date(anio, mes, 0).getDate();
}

export function mostrarFechaCampo(cont, valorISO) {
    cont.innerHTML = "";
    const campo = crearCampoFecha(valorISO);
    cont.appendChild(campo);
    return campo;
}
