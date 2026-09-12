import { abrirModal, abrirAlert } from "../../components/modal.js";

export async function abrirInfoRueda(id_rd) {
    if (!id_rd) return;

    try {
        const res = await fetch(`php/api/get/ruedaDetalle/route.php?id_rd=${encodeURIComponent(id_rd)}`);
        const response = await res.json();
        if (response.status === "error") {
            abrirAlert({ mensaje: "Error: " + response.message });
            return;
        }

        const data = response.data;
        const records = data.records || [];

        const filas = records.map(r => `
            <tr>
                <td class="pb pm t8">${r.placa || "-"}</td>
                <td class="pb pm t15">${r.nombre_posicion || "-"}</td>
                <td class="pb pm t8">${r.viajes_hechos ?? 0}</td>
                <td class="pb pm t8">${r.estado}</td>
                <td class="pb pm t10">${r.fecha_instalacion || "-"}</td>
                <td class="pb pm t5">
                    <button type="button" class="btnInfo listBtn" title="Detalle del registro"><img src="img/info.svg" alt="info"></button>
                </td>
            </tr>
        `).join("");

        abrirModal({
            titulo: `Detalle de Rueda ${data.id_rd} del Lote ${data.id_rl}`,
            sinFooter: true,
            panelClase: "modal-panel-ruedaDetalle",
            contenidoHTML: `
                <table id="tbRuedaInfo">
                    <thead>
                        <tr>
                            <th class="thl t8">Instalado en:</th>
                            <th class="th t15">Posicion</th>
                            <th class="th t8">Viajes Hechos</th>
                            <th class="th t8">Estado</th>
                            <th class="th t10">Fecha Instalacion</th>
                            <th class="thr t5">Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas || `<tr><td class="pb pm" colspan="6">Sin registros en flotas.</td></tr>`}
                    </tbody>
                </table>
            `
        }).overlay.querySelectorAll("#tbRuedaInfo .btnInfo").forEach(btn => {
            btn.addEventListener("click", () => {
                abrirAlert({
                    titulo: "Info. Registro",
                    mensaje: "El detalle de la instalacion esta pendiente de implementacion."
                });
            });
        });

    } catch (error) {
        abrirAlert({ mensaje: "Error de conexion: " + error.message });
    }
}