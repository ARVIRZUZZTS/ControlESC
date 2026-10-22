import { cargarFecha } from "./utils.js";
import { iniciarMenu, iniciarUsuario } from "./menu.js";
import { verificarSesion } from "./sesion.js";
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
    reportesView();
});
