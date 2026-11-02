// buses.js
const params = new URLSearchParams(window.location.search);
const fechaParam = params.get("fecha");
const fecha = decodeURIComponent(fechaParam);

// Mostrar la fecha en el encabezado
document.getElementById('fecha').textContent = fecha;

// Función para actualizar la hora continuamente
function actualizarFechaHora() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

// Función para volver atrás
function back() {
    window.location = `diario.html?fecha=${encodeURIComponent(fecha)}`;
}

// Cargar los buses del día
async function cargarBusesDiarios() {
    try {
        const response = await fetch(`php/buses/getBusesDiarios.php?fecha=${encodeURIComponent(fecha)}`);
        const buses = await response.json();
        
        const listaElement = document.getElementById('lista');
        listaElement.innerHTML = '';
        
        if (buses.length === 0) {
            listaElement.innerHTML = '<h3 style="text-align: center; width: 100%;">No hay buses registrados para esta fecha</h3>';
            return;
        }
        
        // Agrupar buses en grupos de 2
        for (let i = 0; i < buses.length; i += 2) {
            const grupo = buses.slice(i, i + 2);
            const grupoDiv = document.createElement('div');
            grupoDiv.className = 'grupo-buses';
            grupoDiv.style.display = 'flex';
            grupoDiv.style.justifyContent = 'space-around';
            grupoDiv.style.marginBottom = '20px';
            
            grupo.forEach(bus => {
                // Contenedor principal del bus
                const busContainer = document.createElement('div');
                busContainer.className = 'bus-container';
                busContainer.style.width = '45%';

                // Título con el destino del bus
                const tituloH3 = document.createElement('h3');
                tituloH3.textContent = `${bus.destino} - ${bus.placa} | ${bus.hora}`  || 'Sin destino';
                busContainer.appendChild(tituloH3);

                // Div contenedor interno
                const innerContainer = document.createElement('div');
                
                // Div para el diseño del bus
                const busDiv = document.createElement('div');
                busDiv.className = 'bus';
                innerContainer.appendChild(busDiv);
                
                // Cargar el diseño del bus con los asientos ocupados
                cargarMiniDisenoBus(bus.placa, busDiv, bus.codR);
                
                busContainer.appendChild(innerContainer);
                grupoDiv.appendChild(busContainer);
            });
            
            listaElement.appendChild(grupoDiv);
        }
    } catch (error) {
        console.error('Error al cargar los buses:', error);
        document.getElementById('lista').innerHTML = '<h3 style="text-align: center; width: 100%; color: #f00;">Error al cargar los buses</h3>';
    }
}

// Función para cargar un diseño reducido del bus con asientos ocupados
async function cargarMiniDisenoBus(placa, contenedor, codR) {
    try {
        // Obtener diseño del bus y pasajeros en paralelo
        const [disenoResponse, pasajerosResponse] = await Promise.all([
            fetch(`php/common/getBus.php?placa=${encodeURIComponent(placa)}`),
            fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
        ]);
        
        const [disenoData, pasajeros] = await Promise.all([
            disenoResponse.json(),
            pasajerosResponse.json()
        ]);
        
        // Extraer los asientos ocupados
        const asientosOcupados = pasajeros.map(p => p.asiento);
        
        disenoData.forEach(item => {
            const div = document.createElement('div');
            const posX = (parseInt(item.posX) || 0);
            const posY = (parseInt(item.posY) || 0);
            
            div.style.position = 'absolute';
            div.style.left = `${posX}px`;
            div.style.top = `${posY}px`;
            div.style.borderRadius = '5px';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            
            if (item.tipo === 'asiento') {
                div.className = 'asiento';
                div.textContent = item.numAs;
                div.style.width = '40px';
                div.style.height = '40px';
                
                // Verificar si el asiento está ocupado
                const estaOcupado = asientosOcupados.some(a => a.toString() === item.numAs.toString());
                if (estaOcupado) {
                    div.classList.add('asOcu');
                } else {
                    div.classList.add('asLib');
                    // Hacer el asiento clickeable
                    div.style.cursor = 'pointer';
                    div.addEventListener('click', () => {
                        agregarPasajero(codR, item.numAs);
                    });
                }
            } else {
                div.className = 'extra';
                const img = document.createElement('img');
                
                const tipoConfig = {
                    'puerta': { src: 'img/puerta.png', class: 'elePue', width: 30, height: 30 },
                    'baño': { src: 'img/bath.png', class: 'eleBan', width: 30, height: 30 },
                    'tv': { src: 'img/tv.png', class: 'eleTv', width: 30, height: 30 },
                    '2do piso': { src: 'img/2do.png', class: 'ele2', width: 300, height: 15 }
                };
                
                img.src = tipoConfig[item.tipo].src;
                img.alt = item.tipo;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                
                div.classList.add(tipoConfig[item.tipo].class);
                div.style.width = `${tipoConfig[item.tipo].width}px`;
                div.style.height = `${tipoConfig[item.tipo].height}px`;
                div.appendChild(img);
            }
            
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error(`Error al cargar el diseño mini para ${placa}:`, error);
    }
}

// Función para redirigir a pasajero.html con todos los datos necesarios
async function agregarPasajero(codR, asiento) {
    try {
        // Obtener los datos completos del reporte usando codR
        const response = await fetch(`php/common/getReporte.php?codR=${encodeURIComponent(codR)}`);
        const reporte = await response.json();
        
        if (!reporte) {
            alert('No se pudo obtener la información del bus');
            return;
        }
        
        // Codificar los parámetros para la URL
        const fechaCod = encodeURIComponent(fecha);
        const c1 = encodeURIComponent(reporte.con1 || '');
        const pl = encodeURIComponent(reporte.placa || '');
        const placa = encodeURIComponent(reporte.placa || '');
        const dt = encodeURIComponent(reporte.destino || '');
        const as = encodeURIComponent(asiento);
        const hh = encodeURIComponent(reporte.hora || '');
        
        // Redirigir con todos los parámetros necesarios
        window.location.href = `pasajero.html?codR=${codR}&fecha=${fechaCod}&c1=${c1}&pl=${pl}&placa=${placa}&dt=${dt}&as=${as}&hh=${hh}`;
        
    } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        alert('Error al cargar los datos del bus');
    }
}

document.addEventListener('DOMContentLoaded', cargarBusesDiarios);