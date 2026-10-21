import { cargarFecha } from "./utils.js";
import { iniciarMenu, iniciarUsuario } from "./menu.js";
import { verificarSesion } from "./sesion.js";
import { iniciarAutoSync, actualizarBadgeSuc } from "./sync.js";
import { reportesView } from "./views/reportesView.js";

document.addEventListener("DOMContentLoaded", async () => {
    const usuario = await verificarSesion();
    if (!usuario) {
        window.location.replace("login.html");
        return;
    }
    cargarFecha();
    iniciarMenu();
    iniciarUsuario(usuario);
    actualizarBadgeSuc();
    iniciarAutoSync();
    reportesView();
});
document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        e.target.setAttribute('autocomplete', 'off');
    }
}, true);