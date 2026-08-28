import { marcasRuedasView } from "../marcas/ruedas.js";

export async function newMarcaRuedaView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    
    cont.innerHTML = `<p>Cargando Vista de Nueva Marca Rueda...</p>`;
    title.innerHTML = ``;

    let titleHtml = `
        <div class="backTitle">
            <button id="backBtn"><img src="img/back.svg" alt="Atras"></button>
            <h2>NUEVA MARCA DE RUEDA</h2>
        </div>
        <button type="submit" id="saveBtn" form="formNuevaMarca">
            <img src="img/save.svg" alt="Guardar">GUARDAR
        </button>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("backBtn").addEventListener("click", marcasRuedasView);
    
    try {
        let html = `
            <form id="formNuevaMarca" class="formStyle">
                <div class="nmrvrow">
                    <div class="il80 ilR">
                        <label class="noWr">Nombre Marca:</label>
                        <input class="il80" type="text" name="nombre_marca_rueda" placeholder="..." maxlength="25" required>
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="ilR">
                        <label>Medida:</label>
                        <input class="il30" type="number" step="0.01" name="medida" placeholder="0.00 cm"
                            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);">
                    </div>
                    <div class="ilR">
                        <label>Serie:</label>
                        <input class="il30" type="text" name="serie" placeholder="..." maxlength="25">
                    </div>
                    <div class="ilR">
                        <label>Trilla:</label>
                        <input class="il30" type="text" name="trilla" placeholder="..." maxlength="50">
                    </div>
                </div>
                <div class="nmrvrow">
                    <div class="il40 ilR">
                        <label>Aro:</label>
                        <input class="il30" type="text" name="aro" placeholder="..." maxlength="50">
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