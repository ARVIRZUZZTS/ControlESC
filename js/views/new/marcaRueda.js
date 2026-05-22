import { marcasRuedasView } from "../marcas/ruedas.js";

export async function newMarcaRuedaView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    
    cont.innerHTML = `<p>Cargando Vista de Nueva Marca Rueda...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <h2>NUEVA MARCA DE RUEDA</h2>
        <div class="btnsTitle">
            <button type="submit" id="saveBtn" form="formNuevaMarca">
                <img src="img/save.svg" alt="Guardar">GUARDAR
            </button>
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", marcasRuedasView);
    
    try {
        let html = `
            <form id="formNuevaMarca" class="formStyle">
                <div class="nmrvrow">
                    <div class="il100 ilR">
                        <label class="noWr">Nombre Marca:</label>
                        <input class="il100" type="text" name="marca_rueda" placeholder="..." maxlength="25" required>
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="il100 ilR">
                        <label class="noWr">Modelo de Marca:</label>
                        <input class="il100" type="text" name="modelo" placeholder="..." maxlength="25">
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="ilR">
                        <label>Diámetro:</label>
                        <input class="il30" type="number" step="0.01" name="diametro" placeholder="0.00 cm"
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                    <div class="ilR">
                        <label>Ancho:</label>
                        <input class="il30" type="number" step="0.01" name="ancho" placeholder="0.00 cm" 
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                    <div class="ilR">
                        <label>Perfil:</label>
                        <input class="il30" type="number" step="0.01" name="perfil" placeholder="0.00 cm" 
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="il40 ilR">
                        <label>Precio Unitario (Bs.):</label>
                        <input class="il30" type="number" step="0.01" name="precio" placeholder="0.00" required
                            oninput="if(this.value.length > 7) this.value = this.value.slice(0, 7);">
                    </div>
                    <div class="il30 ilR">
                        <label>Media Viajes:</label>
                        <input class="il30" type="number" name="media_viajes" placeholder="0" required
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                </div>
            </form>
            <hr>
        `;

        cont.innerHTML = html;

        const form = document.getElementById("formNuevaMarca");
        
        form.addEventListener("submit", async (e) => { 
            e.preventDefault();

            const formData = new FormData(form);
            const dataFinal = Object.fromEntries(formData.entries());

            console.log("Datos listos para enviar:", dataFinal);
            
            const res = await fetch("php/api/store/marcaRueda/route.php", {
                method: "POST",
                body: JSON.stringify(dataFinal)
            });
            marcasRuedasView();
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando formulario</p>";
        console.error(error);
    }
}