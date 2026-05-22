import { estadisticasView } from "./views/estadisticaView.js";

import { configView } from "./views/config.js";

import { ruedasListView } from "./views/list/ruedas.js";
import { aceitesListView } from "./views/aceitesListView.js";
import { flotasListView } from "./views/flotasListView.js";
import { reportesView } from "./views/reportesView.js";

export function iniciarMenu() {
    document.getElementById("ruedaBtn").addEventListener("click", ruedasListView);
    document.getElementById("aceiteBtn").addEventListener("click", aceitesListView);
    document.getElementById("flotaBtn").addEventListener("click", flotasListView);
    document.getElementById("reporteBtn").addEventListener("click", reportesView);
}