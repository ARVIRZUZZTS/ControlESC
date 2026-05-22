let navBtn = document.getElementById("menuNav");
let sideBtn = document.getElementById("reporteBtn");

document.addEventListener("DOMContentLoaded", function() {
    cargarFecha();
    cargarLocation(navBtn, sideBtn, true);
});

/*********** RUEDAS ***********/
function ruedas() {

}

/*********** ACEITE ***********/
function aceite() {

}

/*********** FLOTAS ***********/
function flotas() {

}

/*********** REPORTE ***********/
function reporte() {

}

function menuNav() {
    onavBtn = document.getElementById("flotaNav");
    osideBtn = sideBtn;
    navBtn = document.getElementById("menuNav");
    sideBtn = document.getElementById("reporteBtn");
    cargarLocation(navBtn, sideBtn, false);
}

function llegadaNav() {
    onavBtn = navBtn;
    osideBtn = document.getElementById("aceiteBtn");
    navBtn = document.getElementById("llegadaNav");
    sideBtn = document.getElementById("reporteBtn");
    cargarLocation(navBtn, sideBtn, false);
}

/*********** Datos del DOM ***********/
function cargarLocation(navBttn, sideBttn, val) {   
    if (val){
        sideBtn.style.backgroundColor = "rgb(161, 245, 161)";
        navBtn.style.backgroundColor = "rgb(199, 236, 199)";
    } else {
        sideBtn.style.backgroundColor = "rgb(161, 245, 161)";
        navBtn.style.backgroundColor = "rgb(199, 236, 199)";
    }
}
function cargarFecha() {
    let fecha = document.getElementById("fecha");
    const hoy = new Date();
    fecha.textContent = String(hoy.getDate()).padStart(2, '0') + '/' + String(hoy.getMonth() + 1).padStart(2, '0') + '/' + hoy.getFullYear();
}