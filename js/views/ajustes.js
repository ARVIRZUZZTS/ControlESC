import { gastosView } from "./ajustes/gastos.js";
import { destinosView } from "./ajustes/destinos.js";
import { tiposPersonalView } from "./ajustes/tiposPersonal.js";
import { dieselView } from "./ajustes/diesel.js";
import { ubicacionesLlegadaView } from "./ajustes/ubicacionesLlegada.js";
import { marcasAceitesView } from "./marcas/marcasAceitesView.js";
import { marcasRuedasView } from "./marcas/ruedas.js";
import { sucursalesView } from "./ajustes/sucursales.js";
import { peajesView } from "./ajustes/peajes.js";

export function ajustesView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    title.innerHTML = `<h2>AJUSTES</h2>`;

    cont.innerHTML = `
        <div class="ajustesButtons">
            <div class="ajustesRow">
                <button id="ajGastos" class="ajustesBtn">GASTOS</button>
                <button id="ajDestinos" class="ajustesBtn">DESTINOS</button>
                <button id="ajTipoPersonal" class="ajustesBtn">TIPO PERSONAL</button>
            </div>
            <div class="ajustesRow">
                <button id="ajMarcaAceite" class="ajustesBtn">MARCA ACEITE</button>
                <button id="ajMarcaRueda" class="ajustesBtn">MARCA RUEDA</button>
                <button id="ajSucursales" class="ajustesBtn">SUCURSALES</button>
                <button id="ajPeajes" class="ajustesBtn">PEAJES</button>
            </div>
            <div class="ajustesRow center">
                <button id="ajDiesel" class="ajustesBtn">DIESEL</button>
                <button id="ajUbicacionLlegada" class="ajustesBtn">UBIC. LLEGADA</button>
            </div>
        </div>
    `;

    document.getElementById("ajGastos").addEventListener("click", gastosView);
    document.getElementById("ajDestinos").addEventListener("click", destinosView);
    document.getElementById("ajTipoPersonal").addEventListener("click", tiposPersonalView);
    document.getElementById("ajMarcaAceite").addEventListener("click", () => marcasAceitesView({ onBack: ajustesView }));
    document.getElementById("ajMarcaRueda").addEventListener("click", () => marcasRuedasView({ onBack: ajustesView }));
    document.getElementById("ajSucursales").addEventListener("click", sucursalesView);
    document.getElementById("ajPeajes").addEventListener("click", peajesView);
    document.getElementById("ajDiesel").addEventListener("click", dieselView);
    document.getElementById("ajUbicacionLlegada").addEventListener("click", ubicacionesLlegadaView);

}    


