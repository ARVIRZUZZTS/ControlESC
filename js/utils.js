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