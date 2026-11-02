/* Modulo generico de impresion ("lienzo"). No sabe nada del dominio: solo abre
   la ventana emergente, escribe HTML, espera la hoja de estilos, lanza print()
   y cierra la ventana al terminar. Los sistemas que imprimen solo aportan la
   "pintura" (HTML + CSS + datos).

   Reglas que SIEMPRE deben respetarse:
   - abrirHojaImpresion debe llamarse dentro del mismo clic/gesto del usuario,
     antes de cualquier fetch, para que el navegador no bloquee el popup.
   - Si devuelve null, el popup fue bloqueado: mostrar instruccion al usuario
     y NO bloquear la app. */

const PRESETS = {
    a4: { ancho: 1000, alto: 1300 },
    termica80: { ancho: 320, alto: 900 },
    termica58: { ancho: 240, alto: 900 },
};

export function esc(v) {
    if (v === null || v === undefined) return "";
    return String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function num(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}

export function fmt(v) {
    const n = num(v);
    return (n === null ? 0 : n).toFixed(2);
}

export function fmtSigno(v) {
    const n = num(v) || 0;
    return (n < 0 ? "-" : "") + Math.abs(n).toFixed(2);
}

export function abrirHojaImpresion({ preset = "a4", ancho, alto, titulo = "Cargando..." } = {}) {
    const p = PRESETS[preset] || PRESETS.a4;
    const w = ancho || p.ancho;
    const h = alto || p.alto;
    const win = window.open("", "_blank", `width=${w},height=${h}`);
    if (!win) return null;
    win.document.open();
    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${esc(titulo)}</title></head>
<body style="font-family:'Times New Roman',Times,serif;font-size:12pt;padding:1cm;">Cargando...</body>
</html>`);
    win.document.close();
    return win;
}

/* Dibuja la hoja y lanza la impresion. Si win es null, abre una nueva.
   Opciones:
     win         ventana ya abierta (para respetar el gesto del usuario) o null
     titulo      titulo del documento
     cssHref     ruta a la hoja de estilos (opcional)
     cssCritico  CSS inline de respaldo si no carga la hoja
     html        cuerpo HTML a imprimir
     cssCriticoSiFalla (bool) inyecta cssCritico solo si la hoja no cargo */
export function imprimirHTML({ win: winAbierta = null, titulo = "Impresion", cssHref = null, cssCritico = "", html = "" } = {}) {
    const win = winAbierta || abrirHojaImpresion({ titulo });
    if (!win) return null;

    const linkTag = cssHref ? `<link rel="stylesheet" href="${cssHref}">` : "";
    const doc = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(titulo)}</title>
${linkTag}
</head>
<body>
${html}
</body>
</html>`;

    win.document.open();
    win.document.write(doc);
    win.document.close();

    const link = cssHref ? win.document.querySelector('link[rel="stylesheet"]') : null;
    let impreso = false;

    const lanzar = () => {
        if (impreso) return;
        impreso = true;
        try {
            if (link && !link.sheet && cssCritico) {
                const critico = win.document.createElement("style");
                critico.textContent = cssCritico;
                win.document.head.appendChild(critico);
            }
            win.focus();
            win.addEventListener("afterprint", () => {
                try { win.close(); } catch (e) { }
            }, { once: true });
            win.print();
        } catch (e) {
            console.error(e);
        }
    };

    const esperar = () => setTimeout(lanzar, 120);

    if (link) {
        link.addEventListener("load", esperar, { once: true });
        link.addEventListener("error", esperar, { once: true });
    } else {
        esperar();
    }
    /* red de seguridad */
    setTimeout(lanzar, 3000);

    return win;
}
