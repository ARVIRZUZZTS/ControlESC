let fechaSeleccionada = (() => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
})();

function actualizarFechaHora() {
    const ahora = new Date();

    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    document.getElementById('fecha').textContent = ahora.toLocaleDateString('es-ES', opcionesFecha);
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
setInterval(actualizarFechaHora, 1000);

actualizarFechaHora();
function diario() {
    const fecha = encodeURIComponent(fechaSeleccionada);
    window.location.href = `diario.html?fecha=${fecha}`;
}

function crear() {
    const fecha = encodeURIComponent(fechaSeleccionada);
    window.location.href = `nomina.html?fecha=${fecha}`;
}
function planilla() {
    window.location = "planillas.html";
}
function flota() {
    window.location = "flota.html";
}
function chofer() {
    window.location = "chofer.html";
}
document.addEventListener('DOMContentLoaded', () => {
    
    flatpickr("#calendario", {
        inline: true,
        locale: "es",
        dateFormat: "Y-m-d",  
        defaultDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            const fecha = selectedDates[0];
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
    
            fechaSeleccionada = `${dia}/${mes}/${anio}`;
            console.log("Fecha seleccionada:", fechaSeleccionada);
            obtenerreportes(); // Actualiza lista cuando se cambia la fecha
        }
    });
    obtenerreportes();
});

function obtenerreportes() {
    fetch('php/menu/obtenerreportes.php')
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = '';

            // Si hay fecha seleccionada, filtrar
            const filtrados = fechaSeleccionada
                ? data.filter(r => r.fecha === fechaSeleccionada)
                : data;

            if (filtrados.length === 0) {
                contenedor.innerHTML = '<h2>NO HAY NOMINAS PARA ESTA FECHA</h2>';
                return;
            }

            filtrados.forEach(reporte => {
                const boton = document.createElement('button');
                boton.classList.add('reporte-boton');
                boton.onclick = () => {
                    const fecha = encodeURIComponent(fechaSeleccionada);
                    window.location.href = `ver.html?codR=${reporte.codR}&fecha=${fecha}`;
                };

                const div = document.createElement('div');
                const h2CodR = document.createElement('h2');
                h2CodR.textContent = `Reporte N° ${reporte.codR}`;
                const h2Placa = document.createElement('h2');
                h2Placa.textContent = reporte.placa;
                const h2Fecha = document.createElement('h2');
                h2Fecha.textContent = reporte.fecha;

                div.appendChild(h2CodR);
                div.appendChild(h2Placa);
                div.appendChild(h2Fecha);
                boton.appendChild(div);
                contenedor.appendChild(boton);
            });
        })
        .catch(error => {
            console.error('Error al obtener los reportes:', error);
        });
}

