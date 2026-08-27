import { marcasAceitesView } from "../marcas/marcasAceitesView.js";

import { hardFilter } from "../../utils.js";
import { decimalFilter } from "../../utils.js";
import { comillasFilter } from "../../utils.js";

export async function newMarcaAceiteView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    
    cont.innerHTML = `<p>Cargando Vista de Nueva Marca Aceite...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <h2>NUEVA MARCA DE ACEITE</h2>
        <div class="btnsTitle">
            <button type="submit" id="saveBtn" form="formNuevaMarca">
                <img src="img/save.svg" alt="Guardar">GUARDAR
            </button>
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", marcasAceitesView);
    
    try {
        let html = `
            <form id="formNuevaMarca" class="formStyle">
                <div class="nmrvrow">
                    <div class="il40 ilR">
                        <label>Nombre Marca:</label>
                        <input type="text" name="nombre_marca_aceite" placeholder="..." maxlength="25" required>
                    </div>
                    <div class="il25 ilR">
                        <label class="noWr">Unidad Aceite:</label>
            `;
        const unidadAceiteRes = await fetch("php/api/get/unidadAceite/route.php");
        const unidadAceiteResponse = await unidadAceiteRes.json();
        const unidadAceite = unidadAceiteResponse.data || unidadAceiteResponse;
        const searchOpt = unidadAceite.map(u => `<option value="${u.id_ua}">${u.unidad_aceite}</option>`).join("");
        const selectHtml  =   `<select id="placasListSearch" name="id_ua">${searchOpt}</select>`;
        html += selectHtml;
        html += `
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="il40 ilR">
                        <label>Precio Unitario (Bs.):</label>
                        <input class="il30" type="number" step="0.01" name="precio" placeholder="0.00" required
                            oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                    </div>
                    <div class="il25 ilR">
                        <label>Media Viajes:</label>
                        <input class="il30" type="number" name="media_viajes" placeholder="0" required
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                </div>
            </form>
            <hr>
        `;


        cont.innerHTML = html;

        const inpMarcaAc = cont.querySelector('input[name="nombre_marca_aceite"]');
        const inpPrecio = cont.querySelector('input[name="precio"]');
        const inpMediaViajes = cont.querySelector('input[name="media_viajes"]');

        if (inpMarcaAc) inpMarcaAc.addEventListener("keydown", comillasFilter);
        if (inpPrecio) inpPrecio.addEventListener("keydown", decimalFilter);
        if (inpMediaViajes) inpMediaViajes.addEventListener("keydown", hardFilter);

        const form = document.getElementById("formNuevaMarca");
        
        form.addEventListener("submit", async (e) => { 
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            console.log("Datos listos para enviar:", dataFinal);
            
            const res = await fetch("php/api/store/marcaAceite/route.php", {
                method: "POST",
                body: JSON.stringify(dataFinal)
            });
            marcasAceitesView();
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando formulario</p>";
        console.error(error);
    }
}