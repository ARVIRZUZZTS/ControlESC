# Metodo de impresion (lienzo + pintura)

## Resumen

La impresion se hace en **dos capas**:

1. **Lienzo generico** — `js/print/imprimirHoja.js`. Abre la ventana emergente, escribe el HTML, espera la hoja de estilos, lanza `print()` y cierra la ventana tras `afterprint`. No conoce el dominio.
2. **Pintura (dominio)** — `js/views/reporte/imprimirReporte.js`. Arma el HTML del "Parte de llegadas" y delega la impresion al lienzo.

Regla critica (popup blocker): `abrirHojaImpresion` debe llamarse **dentro del mismo clic del usuario y antes de cualquier `fetch`**. Si devuelve `null`, el navegador bloqueo el popup: mostrar instruccion para permitir ventanas emergentes y no bloquear la app.

## API del lienzo (`js/print/imprimirHoja.js`)

### `abrirHojaImpresion({ preset, ancho, alto, titulo } = {})`
- Abre `window.open("", "_blank", ...)` y escribe un placeholder.
- Devuelve `Window` o `null` si el popup fue bloqueado.
- Presets de papel: `a4` (default, 1000x1300), `termica80` (320x900), `termica58` (240x900). O pasar `ancho`/`alto` libres (px).

### `imprimirHTML({ win, titulo, cssHref, cssCritico, html } = {})`
- Si `win` es null abre una nueva ventana.
- Escribe el documento con `titulo`, hoja de estilos opcional (`cssHref`) y `html`.
- Espera `load`/`error` del CSS (o 3s de seguridad), inyecta `cssCritico` si la hoja no cargo.
- Llama `win.print()` y cierra la ventana en `afterprint`.
- Devuelve la ventana usada o `null`.

### Helpers exportados
- `esc(v)` — escape HTML (XSS) para template strings.
- `num(v)` — parse float o null.
- `fmt(v)` — numero a 2 decimales (0 si null).
- `fmtSigno(v)` — numero con signo negativo.

## Contrato de datos (pintura reporte)

`imprimirParte(datos, winAbierta)` espera:

```
{
  placa,
  partida:  { lugar, fecha, dia },
  retorno:  { lugar, fecha, dia },
  llegada:  { lugar, fecha, dia },
  llegada_cbba,
  ingresos: [{ texto, monto }],
  egresos:  [{ texto, monto }],
  otros_ingresos,
  total_ingresos, total_egresos, balance,
  viajes_aceite
}
```

`datosDesdeReporte(rep, gastos, anomalias, viajesAceite)` adapta un reporte ya guardado a este contrato.

## Callers actuales

- `reporteInfo.js`: `imprimirParte(datosParaImprimir())` — desde el editor, sin guardar.
- `reporteFinalizadoView.js`: abre ventana en el clic, luego `imprimirParte(datos.paraImprimir, win)`.
- `historialReporte.js`: abre ventana en el clic, hace fetch, luego `imprimirParte(datosDesdeReporte(...), win)`; si falla cierra la ventana.

## Ejemplo generico para otros sistemas

```js
import { abrirHojaImpresion, imprimirHTML, esc } from "../print/imprimirHoja.js";

// dentro del handler de clic del usuario:
const win = abrirHojaImpresion({ preset: "termica80", titulo: "Ticket" });
if (!win) { alert("Permite las ventanas emergentes e intenta de nuevo."); return; }

const html = `<h1>${esc(titulo)}</h1><p>${esc(detalle)}</p>`;
imprimirHTML({ win, titulo: "Ticket", cssHref: "css/ticket.css", cssCritico: "@page{margin:0}", html });
```

## Notas

- La ventana se cierra sola tras imprimir o cancelar (evento `afterprint`).
- El CSS critico (`@page { margin: 0.5cm; }`) garantiza margenes si la hoja no carga.
- No se bloquea la UI principal: el usuario puede seguir usando el sistema mientras imprime.
