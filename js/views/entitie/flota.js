export async function flota(placa) {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <h2>FLOTA ${placa}</h2>
    `;
    title.innerHTML = titleHtml;
    
}