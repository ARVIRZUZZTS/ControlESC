import { estadisticasView } from "./views/estadisticaView.js";

import { configView } from "./views/config.js";

import { avisosView } from "./views/avisosView.js";
import { ruedasListView } from "./views/list/ruedas.js";
import { aceitesListView } from "./views/aceitesListView.js";
import { flotasListView } from "./views/flotasListView.js";
import { reportesView } from "./views/reportesView.js";
import { personalListView } from "./views/personalListView.js";
import { ajustesView } from "./views/ajustes.js";
import { modalCambiarContra } from "./cuenta.js";
import { cerrarSesion } from "./sesion.js";

export function iniciarMenu() {
    document.getElementById("estaBtn").addEventListener("click", avisosView);
    document.getElementById("ruedaBtn").addEventListener("click", ruedasListView);
    document.getElementById("aceiteBtn").addEventListener("click", aceitesListView);
    document.getElementById("flotaBtn").addEventListener("click", flotasListView);
    document.getElementById("reporteBtn").addEventListener("click", reportesView);
    document.getElementById("personalBtn").addEventListener("click", personalListView);
    document.getElementById("confBtn").addEventListener("click", ajustesView);

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");
    const logo = document.getElementById("sidebarLogo");

    const actualizarLogo = (collapsed) => {
        if (!logo) return;
        const origen = collapsed ? logo.dataset.collapsed : logo.dataset.expanded;
        if (origen) logo.src = origen;
    };

    if (localStorage.getItem("sidebarCollapsed") === "true") {
        sidebar.classList.add("collapsed");
    }
    actualizarLogo(sidebar.classList.contains("collapsed"));

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        const collapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("sidebarCollapsed", collapsed);
        actualizarLogo(collapsed);
    });
}

/* Bloque de usuario: nombre, rol, cambiar contrasena y salir */
export function iniciarUsuario(usuario) {
    const nombreEl = document.getElementById("usuarioNombre");
    const rolEl = document.getElementById("usuarioRol");
    if (nombreEl) nombreEl.textContent = usuario.nombre || "";
    if (rolEl) rolEl.textContent = usuario.rol === "admin" ? "Administrador" : "";

    document.getElementById("usuarioContraBtn")?.addEventListener("click", modalCambiarContra);
    document.getElementById("usuarioSalirBtn")?.addEventListener("click", cerrarSesion);
}