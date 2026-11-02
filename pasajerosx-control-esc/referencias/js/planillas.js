function actualizarFechaHora() {
    const ahora = new Date();

    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    document.getElementById('fecha').textContent = ahora.toLocaleDateString('es-ES', opcionesFecha);
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

function marca() {
    window.location = "asientos.html";
}
function back() {
    window.location = "menu.html";
}
function crear() {
    window.location = "asientos.html";
}
function editar(nombre) {
    window.location = `asientos.html?nombre=${encodeURIComponent(nombre)}&tp=${"e"}`;
}
function copy(nombre) {
    window.location = `asientos.html?nombre=${encodeURIComponent(nombre)}&tp=${"c"}`;
}
async function del(nombre) {
    if(confirm(`¿Estás seguro de que deseas eliminar el bus ${nombre}?`)) {
        try {
            const response = await fetch('php/planillas/eliminarBus.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `nombre=${encodeURIComponent(nombre)}`
            });
            
            const result = await response.json();
            
            if(result.success) {
                alert('Bus eliminado correctamente');
                cargarBuses(); // Recargar la lista
            } else {
                alert('Error al eliminar el bus: ' + (result.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    }
}

async function cargarBuses() {
    try {
        const response = await fetch('php/planillas/getAllBus.php');
        const buses = await response.json();
        
        const listaElement = document.getElementById('lista');
        listaElement.innerHTML = '';
        
        // Agrupar buses en grupos de 2
        for(let i = 0; i < buses.length; i += 2) {
            const grupo = buses.slice(i, i + 2);
            const grupoDiv = document.createElement('div');
            grupoDiv.className = 'grupo-buses';
            grupoDiv.style.display = 'flex';
            grupoDiv.style.justifyContent = 'space-around';
            grupoDiv.style.marginBottom = '20px';
            
            grupo.forEach(nombre => {
                // Contenedor principal del bus
                const busContainer = document.createElement('div');
                busContainer.className = 'bus-container';
                busContainer.style.width = '30%';

                // Título (h3) con el nombre del bus
                const tituloH3 = document.createElement('h3');
                tituloH3.textContent = nombre;
                busContainer.appendChild(tituloH3);

                // Div contenedor interno
                const innerContainer = document.createElement('div');
                
                // Div para el diseño del bus
                const busDiv = document.createElement('div');
                busDiv.className = 'bus';
                innerContainer.appendChild(busDiv);
                
                // Div para los botones
                const buttonsDiv = document.createElement('div');
                buttonsDiv.className = 'busButt';
                
                // Crear botones
                const editarBtn = crearBoton('EDITAR', 'img/editar.png', () => editar(nombre));
                const copiarBtn = crearBoton('COPIAR', 'img/nomina.png', () => copy(nombre));
                const eliminarBtn = crearBoton('ELIMINAR', 'img/dell.png', () => del(nombre));
                editarBtn.className = 'editBut';
                copiarBtn.className = 'copiarBut';
                eliminarBtn.className = 'elimBut';
                buttonsDiv.appendChild(editarBtn);
                buttonsDiv.appendChild(copiarBtn);
                buttonsDiv.appendChild(eliminarBtn);
                
                innerContainer.appendChild(buttonsDiv);
                busContainer.appendChild(innerContainer);
                grupoDiv.appendChild(busContainer);
                
                // Cargar el diseño del bus
                cargarMiniDisenoBus(nombre, busDiv);
            });
            
            listaElement.appendChild(grupoDiv);
        }
    } catch (error) {
        console.error('Error al cargar los buses:', error);
    }
}

// Función para cargar un diseño reducido del bus
async function cargarMiniDisenoBus(nombre, contenedor) {
    try {
        const response = await fetch(`php/common/getBus.php?nombre=${encodeURIComponent(nombre)}`);
        const disenoData = await response.json();
        
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
        console.error(`Error al cargar el diseño mini para ${nombre}:`, error);
    }
}

// Función auxiliar para crear botones con el mismo estilo
function crearBoton(texto, icono, onClick) {
    const button = document.createElement('button');
    button.onclick = onClick;
    button.style.display = 'flex';
    button.style.flexDirection = 'column';
    button.style.alignItems = 'center';
    button.style.padding = '5px';
    
    const iconDiv = document.createElement('div');
    const iconImg = document.createElement('img');
    iconImg.src = icono;
    iconImg.alt = texto;
    iconImg.style.width = '20px';
    iconImg.style.height = '20px';
    iconDiv.appendChild(iconImg);
    
    const textDiv = document.createElement('div');
    textDiv.textContent = texto;
    textDiv.style.fontSize = '12px';
    
    button.appendChild(iconDiv);
    button.appendChild(textDiv);
    
    return button;
}

// Cargar los buses cuando la página se cargue
document.addEventListener('DOMContentLoaded', cargarBuses);