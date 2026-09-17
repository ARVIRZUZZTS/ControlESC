import { empleado } from "./entitie/empleado.js";
import { newEmpleadoView } from "./new/newEmpleadoView.js";

function moneda(valor) {
    const n = parseFloat(valor);
    if (isNaN(n)) return "0.00";
    return n.toFixed(2);
}

export async function empleadosListView() {

    const cont = document.getElementById("contDin");
    const title = document.getElementById("titleDin");
    title.innerHTML = ``;
    let titleHtml = `
        <h2>PERSONAL</h2>
        <button id="newEmpleadoBtn"><img src="img/newEmpleado.svg" alt="nuevo"></button>
    `;
    title.innerHTML = titleHtml;

    document.getElementById("newEmpleadoBtn").addEventListener("click", newEmpleadoView);

    try {

        const res = await fetch("php/views/empleados.php");
        const data = await res.json();

        if (data.status === "error") {
            cont.innerHTML = `<p>${data.message}</p>`;
            console.error(data.message);
            return;
        }

        let html = `
            <table id="tbEmpleados">
                <thead>
                    <tr>
                        <th class="thl t5">ID</th>
                        <th class="t10">Empleado</th>
                        <th class="t8">Tipo</th>
                        <th class="t5">Mensual Bs.</th>
                        <th class="t5">Total Pagado Bs.</th>
                        <th class="t5">Fecha Contrato</th>
                        <th class="t5">Estado</th>
                        <th class="thr t3">Info.</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(emp => {
            html += `
                <tr>
                    <td class="pb t5">${emp.id_empleado}</td>
                    <td class="pb pm t10">${emp.empleado}</td>
                    <td class="pb pm t8">${emp.tipo_empleado}</td>
                    <td class="pb pm t5">${moneda(emp.mensual)}</td>
                    <td class="pb pm t5">${moneda(emp.total)}</td>
                    <td class="pb pm t5">${emp.fecha_contrato || "-"}</td>
                    <td class="pb pm t5">${emp.estado || "Activo"}</td>
                    <td class="pb t3"><button class="btnInfo listBtn" data-id="${emp.id_empleado}" alt="reporte"><img src="img/info.svg" alt="reporte"></button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        cont.innerHTML = html;

        document.querySelectorAll("#tbEmpleados .btnInfo").forEach(btn => {
            btn.addEventListener("click", function() {
                empleado(this.dataset.id);
            });
        });

    } catch (error) {
        cont.innerHTML = "<p>Error cargando empleados</p>";
        console.error(error);
    }

}