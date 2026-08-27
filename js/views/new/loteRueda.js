import { ruedasListView } from "../list/ruedas.js";

import { strFecha } from "../../utils.js";
import { cargarFecha } from "../../utils.js";
import { hardFilter } from "../../utils.js";
import { decimalFilter } from "../../utils.js";

export async function newLoteRuedaView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");

    cont.innerHTML = `<p>Cargando View de Nuevo Lote de Ruedas</p>`;
    title.innerHTML = ``;
    
    let titleHtml = `
        <h2>NUEVO LOTE DE RUEDAS</h2>
        <div class="btnsTitle">
            <button id="saveBtn" form="formNuevoLote" type="submit">
                <img src="img/save.svg" alt="NewRueda">GUARDAR
            </button>
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", ruedasListView);
    
    try {        
        const fechaDef = strFecha();
        const marca_ruedaRes = await fetch("php/api/get/marcaRueda/route.php");
        const marcasResponse = await marca_ruedaRes.json();
        const marcas_ruedas = marcasResponse.data || marcasResponse;
        const searchOpt = marcas_ruedas.map(m => `<option value="${m.id_marca_rueda}">${m.nombre_marca_rueda}</option>`).join("");
        const selectHtml = `<select id="selectMarca" name="marca_rueda">${searchOpt}</select>`;
        console.log(marcas_ruedas);
        let html = `
            <form id="formNuevoLote" class="formStyle">
                <div class="nmrvrow">
                    <div class="ilR">
                        <label>Marca:</label>
                        ${selectHtml}
                    </div>
                    <div class="ilR">
                        <label>Fecha Compra:</label>
                        <input class="" type="date" name="fecha_compra" value="${fechaDef}" required>
                    </div>
                    <div class="il20 ilR">
                        <label>Cantidad:</label>
                        <input class="il100" type="number" name="cantidad" placeholder="0" required
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="il40 ilR">
                        <label class="noWr">Precio Unitario (Bs.):</label>
                        <input class="il40" type="number" step="0.01" name="precio_unitario" placeholder="0.00"
                            oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                    </div>
                    <div class="il40 ilR">
                        <label class="noWr">Precio Total (Bs.):</label>
                        <input class="il40" type="number" step="0.01" name="precio_total" placeholder="0.00" required
                            oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                    </div>                    
                </div>
            </form>
            <hr>
        `;
        
        cont.innerHTML = html;

        const selectMarca = document.getElementById("selectMarca");
        const inpCantidad = cont.querySelector('input[name="cantidad"]');
        const inpPrecioUni = cont.querySelector('input[name="precio_unitario"]');
        const inpPrecioTot = cont.querySelector('input[name="precio_total"]');
            
        const actualizarTotal = () => {
            const cant = parseFloat(inpCantidad.value) || 0;
            const uni = parseFloat(inpPrecioUni.value) || 0;
            inpPrecioTot.value = (cant * uni).toFixed(2);
        };
        
        const actualizarPrecio = () => {
            const idSeleccionado = selectMarca.value;
            const marcaEncontrada = marcas_ruedas.find(m => m.id_marca_rueda == idSeleccionado);
        
            if (marcaEncontrada) {
                actualizarTotal(); 
            }
        };
        
        selectMarca.addEventListener("change", actualizarPrecio);
        inpCantidad.addEventListener("input", actualizarTotal);
        inpPrecioUni.addEventListener("input", actualizarTotal);
        
        if (inpCantidad) inpCantidad.addEventListener("keydown", hardFilter);
        if (inpPrecioUni) inpPrecioUni.addEventListener("keydown", decimalFilter);
        if (inpPrecioTot) inpPrecioTot.addEventListener("keydown", decimalFilter);
        
        actualizarPrecio();
        
        const form = document.getElementById("formNuevoLote");
                
        form.addEventListener("submit", async (e) => { 
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            console.log("Datos listos para enviar:", dataFinal);
            
            const res = await fetch("php/api/store/loteRueda/route.php", {
                method: "POST",
                body: JSON.stringify(dataFinal)
            });
            ruedasListView();
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando View de Nuevo Lote de Ruedas</p>";
        console.error(error);
    }
}