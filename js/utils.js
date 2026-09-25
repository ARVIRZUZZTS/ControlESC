export function cargarFecha() {
    const fecha = document.getElementById("fecha");
    const hoy = new Date();

    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();

    fecha.textContent = `${dia}/${mes}/${anio}`;
}

export function strFecha() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();

    return `${anio}-${mes}-${dia}`; 
}

export function hardFilter(event) {
    const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    
    if (!teclasPermitidas.includes(event.key) && !/[0-9]/.test(event.key)) {
        event.preventDefault();
        console.warn(`[Seguridad] Carácter bloqueado en HardFilter: "${event.key}". Solo se permiten números.`);
    }
}

export function decimalFilter(event) {
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (teclasControl.includes(event.key)) return;
    if (event.key === '.') {
        if (event.target.value.includes('.')) {
            event.preventDefault();
            console.warn("[Seguridad] DecimalFilter: Intento de colocar un segundo punto decimal bloqueado.");
        }
        return;
    }
    if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        console.warn(`[Seguridad] Carácter bloqueado en DecimalFilter: "${event.key}".`);
    }
}

export function comillasFilter(event) {
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    
    if (teclasControl.includes(event.key)) return;

    const caracteresProhibidos = ["'", '"', '`'];

    // cambiar a modal
    if (caracteresProhibidos.includes(event.key)) {
        event.preventDefault();
        console.warn("Caracter no permitido: comillas bloqueadas por seguridad.");
    }
}

export function validarPlaca(texto) {
    return /^\d{3,5}-[A-Z]{3}$/.test(texto.trim());
}

export function placaFilter(event) {
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (teclasControl.includes(event.key)) return;
    if (!/[0-9A-Za-z-]/.test(event.key)) {
        event.preventDefault();
        console.warn(`[Seguridad] Carácter bloqueado en PlacaFilter: "${event.key}".`);
    }
}

export function validarPropietario(texto) {
    const limpio = texto.trim();
    if (limpio.length === 0) return false;
    if (limpio.length > 100) return false;
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(limpio);
}

export function strFechaDMY() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

export function fechaISOToDMY(f) {
    if (!f) return "";
    const m = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(f);
    return `${m[3]}/${m[2]}/${m[1]}`;
}

export function fechaDMYToISO(f) {
    if (!f) return null;
    const m = String(f).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function fechaFilter(event) {
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'];
    if (teclasControl.includes(event.key)) return;
    if (/^[0-9]$/.test(event.key)) return;
    event.preventDefault();
    console.warn(`[Seguridad] Carácter bloqueado en FechaFilter: "${event.key}". Formato DD/MM/AAAA.`);
}

export function fechaMask(event) {
    const el = event.target;
    const v = el.value.replace(/\D/g, "").slice(0, 8);
    let f = v;
    if (v.length > 4) {
        f = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
        f = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    el.value = f;
}