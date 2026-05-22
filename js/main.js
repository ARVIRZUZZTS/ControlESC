import { cargarFecha } from "./utils.js";
import { iniciarMenu } from "./menu.js";

document.addEventListener("DOMContentLoaded", () => {
    cargarFecha();
    iniciarMenu();
});
document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        e.target.setAttribute('autocomplete', 'off');
    }
}, true);