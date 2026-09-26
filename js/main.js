import { cargarFecha } from "./utils.js";
import { iniciarMenu } from "./menu.js";
import { reportesView } from "./views/reportesView.js";

document.addEventListener("DOMContentLoaded", () => {
    cargarFecha();
    iniciarMenu();
    reportesView();
});
document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        e.target.setAttribute('autocomplete', 'off');
    }
}, true);