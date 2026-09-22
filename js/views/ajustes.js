import { gastosView } from "./ajustes/gastos.js";
import { ubicacionesView } from "./ajustes/ubicaciones.js";
import { tiposPersonalView } from "./ajustes/tiposPersonal.js";
import { dieselView } from "./ajustes/diesel.js";
import { marcasAceitesView } from "./marcas/marcasAceitesView.js";
import { marcasRuedasView } from "./marcas/ruedas.js";

export function ajustesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `<h2>AJUSTES</h2>`;

    cont.innerHTML = `
        <div class="ajustesButtons">
            <div class="ajustesRow">
                <button id="ajGastos" class="ajustesBtn">GASTOS</button>
                <button id="ajUbicaciones" class="ajustesBtn">UBICACIONES</button>
                <button id="ajTipoPersonal" class="ajustesBtn">TIPO PERSONAL</button>
            </div>
            <div class="ajustesRow">
                <button id="ajMarcaAceite" class="ajustesBtn">MARCA ACEITE</button>
                <button id="ajMarcaRueda" class="ajustesBtn">MARCA RUEDA</button>
            </div>
            <div class="ajustesRow center">
                <button id="ajDiesel" class="ajustesBtn">DIESEL</button>
            </div>
        </div>
    `;

    document.getElementById("ajGastos").addEventListener("click", gastosView);
    document.getElementById("ajUbicaciones").addEventListener("click", ubicacionesView);
    document.getElementById("ajTipoPersonal").addEventListener("click", tiposPersonalView);
    document.getElementById("ajMarcaAceite").addEventListener("click", () => marcasAceitesView({ onBack: ajustesView }));
    document.getElementById("ajMarcaRueda").addEventListener("click", () => marcasRuedasView({ onBack: ajustesView }));
    document.getElementById("ajDiesel").addEventListener("click", dieselView);
}    