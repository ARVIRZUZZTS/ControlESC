function actualizarFechaHora() {
    const ahora = new Date();

    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    document.getElementById('fecha').textContent = ahora.toLocaleDateString('es-ES', opcionesFecha);
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

const params = new URLSearchParams(window.location.search);
const nombreBusOriginal = decodeURIComponent(params.get('nombre') || '');
const tipoOperacion = decodeURIComponent(params.get('tp') || 'n');

let numeroAsiento = 1;
const bus = document.getElementById('bus');
const configuracionActual = {
  puertas: 0,
  banos: 0,
  tvs: 0,
  columnas: 4
};

// Configurar la página según el tipo de operación
// Configurar la página según el tipo de operación
document.addEventListener('DOMContentLoaded', function() {
    const busNameInput = document.getElementById('busName');
    const headerTitle = document.querySelector('h1');
    
    switch(tipoOperacion) {
        case 'e': // Editar
            headerTitle.textContent = `Editando: ${nombreBusOriginal}`;
            busNameInput.placeholder = nombreBusOriginal;
            busNameInput.value = nombreBusOriginal;
            cargarBusParaEdicion(nombreBusOriginal);
            break;
            
        case 'c': // Copiar
            headerTitle.textContent = `Nuevo diseño Copiado de: ${nombreBusOriginal}`;
            busNameInput.placeholder = `Copiado de ${nombreBusOriginal}`;
            busNameInput.value = ''; // Dejar vacío para nuevo nombre
            cargarBusParaEdicion(nombreBusOriginal);
            break;
            
        default: // Nuevo
            headerTitle.textContent = 'DISEÑO DE ASIENTOS DEL BUS';
            busNameInput.placeholder = 'Ingrese el nombre de la PLANILLA';
            busNameInput.value = ''; // Asegurar que esté vacío
            crearAsientosIniciales();
            break;
    }
});

async function cargarBusParaEdicion(nombre) {
    try {
        const response = await fetch(`php/common/getBus.php?nombre=${encodeURIComponent(nombre)}`);
        const data = await response.json();
        
        // Verificar si recibimos un array (formato actual)
        if (!Array.isArray(data)) {
            throw new Error('Formato de respuesta inesperado');
        }

        // Limpiar el contenedor completamente
        bus.innerHTML = '';
        
        // Resetear contadores
        numeroAsiento = 1;
        configuracionActual.puertas = 0;
        configuracionActual.banos = 0;
        configuracionActual.tvs = 0;
        
        // Procesar cada elemento del diseño
        data.forEach(item => {
            const div = document.createElement('div');
            
            // Normalizar posiciones (asegurar que tengan 'px')
            let posX = item.posX;
            let posY = item.posY;
            
            if (typeof posX === 'number' || (!posX.includes('px') && !isNaN(parseInt(posX)))) {
                posX = `${parseInt(posX)}px`;
            }
            if (typeof posY === 'number' || (!posY.includes('px') && !isNaN(parseInt(posY)))) {
                posY = `${parseInt(posY)}px`;
            }
            
            div.style.position = 'absolute';
            div.style.left = posX;
            div.style.top = posY;
            div.style.borderRadius = '5px';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            
            if (item.tipo === 'asiento') {
                div.className = 'asiento';
                div.textContent = item.numAs;
                div.style.width = '40px';
                div.style.height = '40px';
                
                // Actualizar el número de asiento máximo
                const num = parseInt(item.numAs);
                if (num >= numeroAsiento) {
                    numeroAsiento = num + 1;
                }
            } else {
                const tipoConfig = {
                    'puerta': { src: 'img/puerta.png', class: 'elePue', width: 60, height: 80 },
                    'baño': { src: 'img/bath.png', class: 'eleBan', width: 60, height: 60 },
                    'tv': { src: 'img/tv.png', class: 'eleTv', width: 60, height: 60 },
                    '2do piso': { src: 'img/2do.png', class: 'ele2', width: 300, height: 15 }
                };
                
                const img = document.createElement('img');
                img.src = tipoConfig[item.tipo].src;
                img.alt = item.tipo;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                
                div.classList.add('extra', tipoConfig[item.tipo].class);
                div.style.width = `${tipoConfig[item.tipo].width}px`;
                div.style.height = `${tipoConfig[item.tipo].height}px`;
                div.appendChild(img);
                
                // Actualizar contadores de elementos especiales
                if (item.tipo === 'puerta') configuracionActual.puertas++;
                if (item.tipo === 'baño') configuracionActual.banos++;
                if (item.tipo === 'tv') configuracionActual.tvs++;
            }
            
            hacerDraggable(div);
            bus.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error al cargar el bus:', error);
    }
}

// Función para crear asientos iniciales (para nuevo bus)
function crearAsientosIniciales() {
    for (let i = 0; i < 44; i++) {
        const fila = Math.floor(i / 4);
        const col = i % 4;
        crearAsientoOrdenado(numeroAsiento++, fila, col);
    }
}

// Resto de las funciones existentes (sin cambios)
function crearAsientoOrdenado(numero, fila, col) {
    const div = document.createElement('div');
    div.className = 'asiento';
    div.textContent = numero;

    const anchoAsiento = 40;
    const altoAsiento = 40;
    const margenHorizontal = 10;
    const margenVertical = 3;
    const espacioPasillo = 50;

    let left = 100 + col * (anchoAsiento + margenHorizontal); 
    if (col >= 2) left += espacioPasillo;

    let top = 50 + fila * (altoAsiento + margenVertical);

    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    hacerDraggable(div);
    bus.appendChild(div);
}

function crearAsiento(numero) {
    const div = document.createElement('div');
    div.className = 'asiento';
    div.textContent = numero;
    
    div.style.left = `10px`;
    div.style.top = `10px`;

    hacerDraggable(div);
    bus.appendChild(div);
}

function agregarAsiento() {
    crearAsiento(numeroAsiento++);
}

function agregarElemento(tipo) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    
    switch(tipo) {
        case 'puerta':
            img.src = 'img/puerta.png';
            img.alt = 'Puerta';
            div.classList.add('extra', 'elePue');
            break;
        case 'baño':
            img.src = 'img/bath.png';
            img.alt = 'Baño';
            div.classList.add('extra', 'eleBan');
            break;
        case 'tv':
            img.src = 'img/tv.png';
            img.alt = 'TV';
            div.classList.add('extra', 'eleTv');
            break;
        case '2do piso':
            img.src = 'img/2do.png';
            img.alt = '2do piso';
            div.classList.add('extra', 'ele2');
            break;
    }
    
    img.style.width = '100%';
    img.style.height = '100%';
    
    div.appendChild(img);
    div.style.left = '10px';
    div.style.top = '10px';
    
    if (tipo === 'puerta' || tipo === '2do piso') {
        div.style.width = '60px';
        div.style.height = '80px';
    } else {
        div.style.width = '60px';
        div.style.height = '60px';
    }
    
    hacerDraggable(div);
    bus.appendChild(div);
}

function hacerDraggable(el) {
    el.onmousedown = function (e) {
        if (modoEliminar) {
            const elementoAEliminar = e.target.closest('.asiento, .extra');
            if (elementoAEliminar && confirm('¿Eliminar este elemento?')) {
                elementoAEliminar.remove();
            }
            return;
        }

        if (e.target.tagName === 'IMG') {
            e.stopPropagation();
            return;
        }

        const rect = el.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let offsetY = e.clientY - rect.top;

        function mover(ev) {
            ev.preventDefault();
            el.style.left = ev.clientX - offsetX - bus.getBoundingClientRect().left + 'px';
            el.style.top = ev.clientY - offsetY - bus.getBoundingClientRect().top + 'px';
        }

        function soltar() {
            document.removeEventListener('mousemove', mover);
            document.removeEventListener('mouseup', soltar);
        }

        document.addEventListener('mousemove', mover);
        document.addEventListener('mouseup', soltar);
    };
}

async function guardarPosiciones() {
    const busName = document.getElementById('busName').value.trim();
    
    if (!busName) {
        alert("Por favor ingresa un nombre para el bus");
        return;
    }

    // Verificar si estamos editando y el nombre cambió
    if (tipoOperacion === 'e' && busName !== nombreBusOriginal) {
        if (!confirm(`¿Estás seguro de querer cambiar el nombre de "${nombreBusOriginal}" a "${busName}"?`)) {
            return;
        }
    }

    const elementos = bus.querySelectorAll('.asiento, .extra');
    const datos = {
        nombreBus: busName,
        elementos: [],
        operacion: tipoOperacion,
        nombreOriginal: tipoOperacion !== 'n' ? nombreBusOriginal : null
    };
    
    elementos.forEach(el => {
        const tipo = el.classList.contains('asiento') ? 'asiento' : 
                     el.classList.contains('elePue') ? 'puerta' :
                     el.classList.contains('eleBan') ? 'baño' :
                     el.classList.contains('eleTv') ? 'tv' : '2do piso';
        
        datos.elementos.push({
            tipo: tipo,
            numAs: el.classList.contains('asiento') ? el.textContent : 'x',
            posX: el.style.left,
            posY: el.style.top
        });
    });

    try {
        const response = await fetch('php/asientos/saveBus.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        const result = await response.json();
        
        if (result.success) {
            alert(tipoOperacion === 'e' ? "Bus actualizado exitosamente!" : 
                  tipoOperacion === 'c' ? "Copia del bus guardada exitosamente!" : 
                  "Diseño del bus guardado exitosamente!");
                  window.location = `planillas.html`;
            
        } else {
            alert("Error al guardar: " + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Error al conectar con el servidor");
    }
}

function back() {
    window.location = "planillas.html";
}

function asi(columnas) {
    const elementosNoAsientos = [];
    document.querySelectorAll('.extra').forEach(el => {
        elementosNoAsientos.push({
            element: el.cloneNode(true),
            className: el.className,
            left: el.style.left,
            top: el.style.top
        });
    });
    
    document.querySelectorAll('.asiento').forEach(el => el.remove());
    numeroAsiento = 1;
    configuracionActual.columnas = columnas;
    
    if (columnas === 3) {
        const filas = 14;
        for (let fila = 0; fila < filas; fila++) {
            for (let col = 0; col < 3; col++) {
                crearAsientoPersonalizado(numeroAsiento++, fila, col, columnas);
            }
        }
    } else if (columnas === 4) {
        const filas = Math.ceil(44 / 4);
        for (let i = 0; i < 44; i++) {
            const fila = Math.floor(i / 4);
            const col = i % 4;
            crearAsientoOrdenado(numeroAsiento++, fila, col);
        }
    }
    
    elementosNoAsientos.forEach(item => {
        const nuevoElemento = item.element;
        nuevoElemento.style.left = item.left;
        nuevoElemento.style.top = item.top;
        hacerDraggable(nuevoElemento);
        bus.appendChild(nuevoElemento);
    });
    
    if (configuracionActual.puertas > 0) pue(configuracionActual.puertas);
    if (configuracionActual.banos > 0) ban(configuracionActual.banos);
    if (configuracionActual.tvs > 0) tv(configuracionActual.tvs);
}

function crearAsientoPersonalizado(numero, fila, col, columnas) {
    const div = document.createElement('div');
    div.className = 'asiento';
    div.textContent = numero;

    const anchoAsiento = 40;
    const altoAsiento = 40;
    const margenHorizontal = 10;
    const margenVertical = 3;
    const espacioPasillo = 60;

    let left;
    if (col === 0) {
        left = 100;
    } else if (col === 1) {
        left = 100 + (anchoAsiento + margenHorizontal);
    } else if (col === 2) {
        left = 100 + 2 * (anchoAsiento + margenHorizontal) + espacioPasillo;
    }

    const top = 1 + fila * (altoAsiento + margenVertical);
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;

    hacerDraggable(div);
    bus.appendChild(div);
}

let modoEliminar = false;

function activarModoEliminar() {
    modoEliminar = !modoEliminar;
    const busElement = document.getElementById('bus');
    
    if (modoEliminar) {
        busElement.classList.add('modo-eliminar');
        alert("Modo eliminar activado. Haz clic en un elemento para borrarlo.");
    } else {
        busElement.classList.remove('modo-eliminar');
        alert("Modo eliminar desactivado.");
    }
}

function pue(cantidad) {
    document.querySelectorAll('.elePue').forEach(el => el.remove());
    configuracionActual.puertas = cantidad;
    
    const posicionesPuertas = [
        { left: '350px', top: '100px' },
        { left: '350px', top: '150px' },
        { left: '350px', top: '200px' }
    ];
    
    for (let i = 0; i < cantidad; i++) {
        const div = document.createElement('div');
        div.classList.add('extra', 'elePue');
        
        const img = document.createElement('img');
        img.src = 'img/puerta.png';
        img.alt = 'Puerta';
        img.style.width = '100%';
        img.style.height = '100%';
        
        div.appendChild(img);
        div.style.width = '60px';
        div.style.height = '80px';
        div.style.left = posicionesPuertas[i].left;
        div.style.top = posicionesPuertas[i].top;
        
        hacerDraggable(div);
        bus.appendChild(div);
    }
}

function ban(cantidad) {
    document.querySelectorAll('.eleBan').forEach(el => el.remove());
    configuracionActual.banos = cantidad;
    
    const posicionesBanos = [
        { left: '40px', top: '100px' },
        { left: '40px', top: '150px' }
    ];
    
    for (let i = 0; i < cantidad; i++) {
        const div = document.createElement('div');
        div.classList.add('extra', 'eleBan');
        
        const img = document.createElement('img');
        img.src = 'img/bath.png';
        img.alt = 'Baño';
        img.style.width = '100%';
        img.style.height = '100%';
        
        div.appendChild(img);
        div.style.width = '60px';
        div.style.height = '60px';
        div.style.left = posicionesBanos[i].left;
        div.style.top = posicionesBanos[i].top;
        
        hacerDraggable(div);
        bus.appendChild(div);
    }
}

function tv(cantidad) {
    document.querySelectorAll('.eleTv').forEach(el => el.remove());
    configuracionActual.tvs = cantidad;
    
    const posicionesTVs = [
        { left: '200px', top: '100px' },
        { left: '200px', top: '150px' },
        { left: '200px', top: '200px' }
    ];
    
    for (let i = 0; i < cantidad; i++) {
        const div = document.createElement('div');
        div.classList.add('extra', 'eleTv');
        
        const img = document.createElement('img');
        img.src = 'img/tv.png';
        img.alt = 'TV';
        img.style.width = '100%';
        img.style.height = '100%';
        
        div.appendChild(img);
        div.style.left = posicionesTVs[i].left;
        div.style.top = posicionesTVs[i].top;
        
        hacerDraggable(div);
        bus.appendChild(div);
    }
}

function reset() {
    if (confirm("¿Estás seguro que deseas restaurar la pagina?\nSe perdera todo lo configurado")) {
        window.location.reload();
    } 
}