import { ruedaPos } from "./config/ruedaPos.js";

export async function configView() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <h2>CONFIGURACION DEL SISTEMA</h2>
        `;
        //<button id="newFlotaBtn"><img src="img/newFlota.svg" alt="reporte"></button>
    title.innerHTML = titleHtml;
    try {

        const res = await fetch("php/views/flotas.php");
        const data = await res.json();
        let html = `
            <button id="ruedaPos">COnfigurar Planilla de Posiciones de Ruedas de las FLotas</button>
        `;

        cont.innerHTML = html;

        document.getElementById("ruedaPos").addEventListener("click", ruedaPos);

    } catch (error) {
        cont.innerHTML = "<p>Error cargando flotas</p>";
        console.error(error);
    }
}