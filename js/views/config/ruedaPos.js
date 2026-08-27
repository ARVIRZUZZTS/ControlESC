export async function ruedaPos() {
    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <h2>CONFIGURACION DEL PLANILLAS DE RUEDAS</h2>
        <div class="btnsTitle">
            <button id="newRuedaPos"><img src="img/back.svg" alt="Atras">Nueva Planilla</button>
            <button id="back"><img src="img/back.svg" alt="Atras"></button>
        </div>
    `;
    title.innerHTML = titleHtml;
    try {

        const res = await fetch("php/views/ruedaPos.php");
        const data = await res.json();
        let html = `
            <table id="tbFlotas">
                <thead>
                    <tr>
                        <th class="thl t8">N°</th>
                        <th class="t10">Nombre Posicion</th>
                        <th class="t10">Placa</th>
                        <th class="t3">Editar</th>
                        <th class="thr t3">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(planilla => {
            html += `
                <tr>
                    <td class="pb t8">${planilla.id}</td>
                    <td class="pb pm t10">${planilla.nombrePosicion}</td>
                    <td class="pb pm t10">${planilla.placa}</td>
                    <td class="pb pm t3"><button class="btnEditar listBtn" data-id="${planilla.id}"><img src="img/edit.svg" alt="reporte"></button></td>
                    <td class="pb t3"><button class="btnEliminar listBtn" data-id="${planilla.id}"><img src="img/trash.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

    } catch (error) {
        cont.innerHTML = "<p>Error cargando flotas</p>";
        console.error(error);
    }
}