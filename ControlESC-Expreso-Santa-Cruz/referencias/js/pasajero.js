const params = new URLSearchParams(window.location.search);
const codR = params.get('codR');
const c1 = decodeURIComponent(params.get('c1') || 'n');
const pl = decodeURIComponent(params.get('pl') || 'n');
const placa = decodeURIComponent(params.get('placa') || 'n');
const dt = decodeURIComponent(params.get('dt') || 'n');
const as = decodeURIComponent(params.get('as') || 'n');
const hh = decodeURIComponent(params.get('hh') || 'n');

let asientosSeleccionados = []; 

document.addEventListener("DOMContentLoaded", () => {
    setFecha();
    setTitle();
    setDest();
    cargarDisenoBus(placa);

    if (as !== "n") {
        document.getElementById('asH').readOnly = true;
        if (as !== "0") {
            asientosSeleccionados = [as];
            document.getElementById('asH').value = as;
            actualizarInputsPasajeros(); // <<--- EXISTE SOLO AQUÍ
        }
    } else {
        document.getElementById('asH').maxLength = 2;

        // 👇👇 AÑADE ESTA LÍNEA PARA FORZAR EL CAMPO DEFAULT
        actualizarInputsPasajeros();
    }
});

function back() {
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fecha = encodeURIComponent(fechaParam);
    if (c1 == "n") {
        window.location = `diario.html?fecha=${fecha}`;
    } else if (c1 == "nu") {
        window.location = `buses.html?fecha=${fecha}`;
    } else {
        window.location.href = `ver.html?codR=${codR}&fecha=${fecha}`;
    }
}

async function crear() {
    const nombres = Array.from(document.querySelectorAll('input[name="nm[]"]')).map(input => input.value.trim());
    const cis = Array.from(document.querySelectorAll('input[name="ci[]"]')).map(input => input.value.trim() || "0");
    const destino = document.querySelector('input[name="ds"]').value.trim();
    const precioPorAsiento = parseInt(document.querySelector('input[name="pr"]').value.trim());
    
    // Validaciones
    if (asientosSeleccionados.length === 0) {
        asientosSeleccionados.push(document.getElementById("asH").value);
        if (asientosSeleccionados.length === 0) {
            alert("Debe seleccionar al menos un asiento.");
            return;
        }
    }
    
    if (nombres.some(nombre => !nombre)) {
        alert("Todos los pasajeros deben tener un nombre.");
        return;
    }
    
    if (isNaN(precioPorAsiento)) {
        alert("El precio debe ser un número válido.");
        return;
    }
    
    // Verificar asientos ocupados
    try {
        const codR = new URLSearchParams(window.location.search).get('codR');
        const response = await fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`);
        const pasajeros = await response.json();
        const asientosOcupados = pasajeros.map(p => p.asiento.toString());
        
        const asientosOcupadosSeleccionados = asientosSeleccionados.filter(as => 
            asientosOcupados.includes(as)
        );
        
        if (asientosOcupadosSeleccionados.length > 0) {
            alert(`Asientos ocupados: ${asientosOcupadosSeleccionados.join(', ')}`);
            return;
        }
    } catch (error) {
        console.error("Error al verificar asientos:", error);
        alert("Error al verificar disponibilidad de asientos");
        return;
    }
    
    // Insertar todos los asientos
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fecha = decodeURIComponent(fechaParam || "");
    
    try {
        const resultados = await Promise.all(
            asientosSeleccionados.map((asiento, index) => {
                const datos = new FormData();
                datos.append("nombre", nombres[index]);
                datos.append("ci", cis[index]);
                datos.append("destino", destino);
                datos.append("asiento", asiento);
                datos.append("precio", precioPorAsiento);
                datos.append("fecha", fecha);
                if (dt !== "n") datos.append("codR", codR);
                
                return fetch("php/pasajero/nuevaPersona.php", {
                    method: "POST",
                    body: datos
                }).then(res => res.json());
            })
        );
        
        if (resultados.every(res => res.success)) {
            const fakeEvent = { preventDefault: () => {} };
            printy(fakeEvent);
        } else {
            throw new Error("Error en algunas inserciones");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar pasajeros");
    }
}

function actualizarFechaHora() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}

function setTitle() {
    if (c1 == "n") {
        document.getElementById("title").innerHTML = `
            <h1>VENTA DE PASAJE SIN BUS ASIGNADO:</h1>
        `;
    } else {
        document.getElementById("title").innerHTML = `
            <h1>VENTA DE PASAJE PARA EL REPORTE N°${codR}:</h1>
            <div id="title2">
                <h3>Conductor: ${c1}</h3>
                <div>
                    <h3>Placa: ${pl}</h3>
                    <h3>Placa: ${placa}</h3>
                </div>
            </div>
        `;
        document.getElementById("dest").value = dt;
    }
}

function setFecha() {
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fecha = decodeURIComponent(fechaParam);
    document.getElementById('fecha').textContent = "FECHA SELECCIONADA: " + fecha;
}

function setDest() {
    if (dt != "n") {
        document.getElementById('dest').readOnly = true;
    }
}

function actualizarInputsPasajeros() {
    const container = document.getElementById('dinamic');

    // 1. Guardar los datos existentes
    const datosExistentes = {};
    const nombresInputs = document.querySelectorAll('input[name="nm[]"]');
    const ciInputs = document.querySelectorAll('input[name="ci[]"]');

    nombresInputs.forEach((input, index) => {
        const asiento = container.children[index]?.getAttribute('data-asiento');
        if (asiento) {
            datosExistentes[asiento] = {
                nombre: input.value,
                ci: ciInputs[index]?.value || ""
            };
        }
    });

    // 2. Limpiar el contenedor
    container.innerHTML = '';

    // 3. Volver a crear inputs preservando los datos
    asientosSeleccionados.forEach((asiento, index) => {
        const datos = datosExistentes[asiento] || { nombre: '', ci: '' };

        const divPasajero = document.createElement('div');
        divPasajero.className = 'pasajero-inputs';
        divPasajero.setAttribute('data-asiento', asiento);

        divPasajero.innerHTML = `
            <div>
                <h2>NOMBRE:</h2>
                <input type="text" placeholder="NOMBRE del ${asiento}" name="nm[]" maxlength="150" value="${datos.nombre}">
            </div>
            <div>
                <h2>CI:</h2>
                <input type="text" placeholder="CI/CEL del ${asiento}" name="ci[]" maxlength="20" value="${datos.ci}" oninput="this.value = this.value.replace(/[^0-9]/g, '')" autocomplete="off">
            </div>
        `;

        container.appendChild(divPasajero);
    });

    // 4. Si no hay asientos seleccionados, mostrar el default
   if (asientosSeleccionados.length === 0 || (asientosSeleccionados.length === 1 && (asientosSeleccionados[0] === 'n' || asientosSeleccionados[0] === '0' || asientosSeleccionados[0].trim() === '')) || as === 0) {

    const divPasajero = document.createElement('div');
    divPasajero.className = 'pasajero-inputs';
    divPasajero.setAttribute('data-asiento', 'SIN-ASIENTO');

    divPasajero.innerHTML = `
        <div>
            <h2>NOMBRE:</h2>
            <input type="text" placeholder="NOMBRE SIN ASIENTO" name="nm[]" maxlength="150">
        </div>
        <div>
            <h2>CI:</h2>
            <input type="text" placeholder="CI/CEL DEL VIAJERO" name="ci[]" maxlength="20" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
        </div>
    `;
    container.appendChild(divPasajero);
}


}


function addVectAs(numAsiento) {
    numAsiento = numAsiento.toString();
    if(!asientosSeleccionados.includes(numAsiento)) {
        asientosSeleccionados.push(numAsiento);
        document.getElementById('asH').value = asientosSeleccionados.join(', ');
        actualizarInputsPasajeros();
        actualizarVistaBus();
    }
}

function delVectAs(numAsiento) {
    asientosSeleccionados = asientosSeleccionados.filter(as => as !== numAsiento.toString());
    document.getElementById('asH').value = asientosSeleccionados.join(', ');
    actualizarInputsPasajeros();
    actualizarVistaBus();
}

function actualizarVistaBus() {
    const asientos = document.querySelectorAll('.asiento');
    asientos.forEach(asiento => {
        const numAs = asiento.textContent;
        const newAsiento = asiento.cloneNode(true);
        asiento.parentNode.replaceChild(newAsiento, asiento);

        newAsiento.classList.remove('asLib', 'asPos');
        
        if (asientosSeleccionados.includes(numAs)) {
            newAsiento.classList.add('asPos');
            newAsiento.style.cursor = 'pointer';
            newAsiento.addEventListener('click', () => delVectAs(numAs));
        } else if (asiento.classList.contains('asOcu')) {
            newAsiento.classList.add('asOcu');
        } else {
            newAsiento.classList.add('asLib');
            newAsiento.style.cursor = 'pointer';
            newAsiento.onclick = () => addVectAs(numAs);
        }
    });
}

async function cargarDisenoBus(placa) {
    try {
        const codR = new URLSearchParams(window.location.search).get('codR');
        const busElement = document.getElementById('bus');
        busElement.innerHTML = '';
        
        if (as !== "n") {
            if (as != "0") {
                asientosSeleccionados = [as];
                document.getElementById('asH').value = as;
            }
        }
        
        if (placa === "n") {
            const noPlacaDiv = document.createElement('div');
            noPlacaDiv.className = 'noMarca';
            noPlacaDiv.textContent = 'SIN BUS SELECCIONADO';
            busElement.appendChild(noPlacaDiv);
        }
        
        const [disenoResponse, pasajerosResponse] = await Promise.all([
            fetch(`php/common/getBus.php?placa=${encodeURIComponent(placa)}`),
            fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
        ]);
        
        const [disenoData, pasajeros] = await Promise.all([
            disenoResponse.json(),
            pasajerosResponse.json()
        ]);
        
        const asientosOcupados = pasajeros.map(p => p.asiento);
        
        disenoData.forEach(item => {
            const div = document.createElement('div');
            const posX = parseInt(item.posX) || 0;
            const posY = parseInt(item.posY) || 0;
            
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
                
                const estaOcupado = asientosOcupados.some(a => a.toString() === item.numAs.toString());
                if (as == item.numAs) {
                    div.classList.add('asPos');
                    div.style.cursor = 'pointer';
                    div.addEventListener('click', () => {
                        delVectAs(item.numAs);
                    });
                } else {
                    if (estaOcupado) {
                        div.classList.add('asOcu');
                    } else {
                        div.classList.add('asLib');
                        div.style.cursor = 'pointer';
                        div.addEventListener('click', () => addVectAs(item.numAs));
                    }
                }
            } else {
                div.className = 'extra';
                const img = document.createElement('img');
                
                const tipoConfig = {
                    'puerta': { src: 'img/puerta.png', class: 'elePue', width: 30, height: 30 },
                    'baño': { src: 'img/bath.png', class: 'eleBan', width: 30, height: 30 },
                    'tv': { src: 'img/tv.png', class: 'eleTv', width: 30, height: 30 },
                    '2do piso': { src: 'img/2do.png', class: 'ele2', width: 300, height: 30 }
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
            
            busElement.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar el diseño del bus:', error);
    }
}

function printy(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    const modal = document.createElement('div');
    modal.id = 'printOptionsModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; width: 300px; text-align: center;">
            <h2 style="margin-top: 0;">Opciones de Impresión</h2>
            <p>Seleccione el formato de impresión:</p>
            <button id="printFull" class="print-option-btn">COMPLETO</button>
            <button id="printPrice" class="print-option-btn">SOLO PRECIO</button>
            <button id="printTime" class="print-option-btn">SOLO HORA</button>
            <button id="printEmpty" class="print-option-btn">VACÍO</button>
            <button id="printGroup" class="print-option-btn">GRUPAL</button>
            <button id="printCancel" class="print-option-btn cancel-btn">CANCELAR</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const setupButton = (id, option) => {
        const btn = document.getElementById(id);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.body.removeChild(modal);
            document.body.style.overflow = '';
            if (option !== 'cancel') {
                if (option === 'group') {
                    showGroupNameInput();
                } else {
                    printTicket(option);
                }
            }
        });
    };
    
    setupButton('printFull', 'full');
    setupButton('printPrice', 'price');
    setupButton('printTime', 'time');
    setupButton('printEmpty', 'empty');
    setupButton('printGroup', 'group');
    
    document.getElementById('printCancel').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        
        const params = new URLSearchParams(window.location.search);
        const fechaParam = params.get("fecha");
        const fecha = encodeURIComponent(fechaParam);
        
        if (c1 == "n") {
            window.location = `diario.html?fecha=${fecha}`;
        } else {
            window.location = `ver.html?codR=${codR}&fecha=${fecha}`;
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
}

function showGroupNameInput() {
    const groupModal = document.createElement('div');
    groupModal.id = 'groupNameModal';
    groupModal.style.position = 'fixed';
    groupModal.style.top = '0';
    groupModal.style.left = '0';
    groupModal.style.width = '100%';
    groupModal.style.height = '100%';
    groupModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    groupModal.style.display = 'flex';
    groupModal.style.justifyContent = 'center';
    groupModal.style.alignItems = 'center';
    groupModal.style.zIndex = '1000';
    
    groupModal.innerHTML = `
        <div style="background: white; border-radius: 10px; width: 300px; text-align: center;">
            <h2 style="margin-top: 20px;">Nombre Grupal</h2>
            <input type="text" id="groupNameInput" placeholder="NOMBRE GRUPAL" style="padding: 8px; margin-bottom: 15px;" maxlength="30">
            <button id="confirmGroupPrint" class="print-option-btn">CONFIRMAR</button>
            <button id="cancelGroupPrint" class="print-option-btn cancel-btn">CANCELAR</button>
        </div>
    `;
    
    document.body.appendChild(groupModal);
    
    document.getElementById('confirmGroupPrint').addEventListener('click', () => {
        const groupName = document.getElementById('groupNameInput').value.trim();
        if (groupName) {
            document.body.removeChild(groupModal);
            printTicket('group', groupName);
        } else {
            alert('Por favor ingrese un nombre grupal');
        }
    });
    
    document.getElementById('cancelGroupPrint').addEventListener('click', () => {
        document.body.removeChild(groupModal);
        printy(); // Volver a mostrar el modal anterior
    });
}
function printTicket(option, groupName = '') {
    const fe = document.getElementById("fecha").textContent;
    const fecha = fe.split(": ")[1];
    const nombres = Array.from(document.querySelectorAll('input[name="nm[]"]')).map(input => input.value.trim());
    const cis = Array.from(document.querySelectorAll('input[name="ci[]"]')).map(input => input.value.trim() || "0");
    const destino = document.querySelector('input[name="ds"]').value.trim();
    const precioPorAsiento = parseInt(document.querySelector('input[name="pr"]').value.trim());
    const carril = "30";

    if (as === "n") {
        const asientoManual = document.getElementById("asH").value;
        if (asientoManual && !asientosSeleccionados.includes(asientoManual)) {
            asientosSeleccionados.push(asientoManual);
        }
    }

    const printContainer = document.getElementById('printP');
    printContainer.style.display = 'block';
    printContainer.innerHTML = '';

    if (option === 'group') {
        // Impresión grupal - solo un ticket
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'pasajeroPrintBody';
        
        // Ordenar los asientos numéricamente
        const sortedAsientos = [...asientosSeleccionados].sort((a, b) => parseInt(a) - parseInt(b));
        
        ticketDiv.innerHTML = `
            <img class="imgPr2" src="img/logXXF.png" alt="Logo" onerror="this.style.display='none'">
            <div id="adver">
                <div id="fact">
                    <h4 class="marNon strCent">EXIJA SU</h4>
                    <h1 class="marNon strCent">FACTURA</h1>
                </div>
                <div>
                    <h3>ESTE BOLETO CONSTITUYE RESERVA DE PASAJE</h3>
                </div>
            </div>
            <div>
                <h3 class="dtP cien">De SC a: ${destino}</h3>
            </div>
            <div>
                <h3 class="nmP cien">NOMBRE: ${groupName}</h3>
            </div>
            <div>
                <h3 class="ciPr">CI/CEL: ${cis[0] || '0'}</h3>
            </div>
            <div>
                <h3 class="pl">PLACA: ${pl}</h3>
                <h3 class="ca">CARRIL: ${carril}</h3>
            </div>
            <div>
                <h3 class="fechaPrint">FECHA: ${fecha}</h3>
                <h3 class="hrP">HORA: ${hh === 'n' ? '' : hh}</h3>
            </div>
            <div>
                <h3 class="prP">TOTAL: ${precioPorAsiento * asientosSeleccionados.length}</h3>
                <h3 class="asP">ASIENTOS: ${sortedAsientos.join(', ')}</h3>
            </div>
            <div>
                <h3 id="emP" class="big">EMITIDO POR: </h3>
            </div>
            <h1 class="bv">¡¡BUEN VIAJE!!</h1>
            <p id="msj">AVISE 3 HRS ANTES DE ABORDAR EL BUS EN CASO DE DEVOLUCION<br>
                No valido para credito fiscal.
            </p>
        `;
        
        printContainer.appendChild(ticketDiv);
    } else {
        // Impresión normal (individual)
        asientosSeleccionados.forEach((asiento, index) => {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'pasajeroPrintBody';
            
            ticketDiv.innerHTML = `
                <img class="imgPr2" src="img/logXXF.png" alt="Logo" onerror="this.style.display='none'">
                <div id="adver">
                    <div id="fact">
                        <h4 class="marNon strCent">EXIJA SU</h4>
                        <h1 class="marNon strCent">FACTURA</h1>
                    </div>
                    <div>
                        <h3>ESTE BOLETO CONSTITUYE RESERVA DE PASAJE</h3>
                    </div>
                </div>
                <div>
                    <h3 class="dtP cien">De SC a: ${destino}</h3>
                </div>
                <div>
                    <h3 class="nmP cien">NOMBRE: ${nombres[index] || ''}</h3>
                </div>
                <div>
                    <h3 class="ciPr">CI/CEL: ${cis[index] || '0'}</h3>
                </div>
                <div>
                    <h3 class="pl">PLACA: ${pl}</h3>
                    <h3 class="ca">CARRIL: ${carril}</h3>
                </div>
                <div>
                    <h3 class="fechaPrint">FECHA: ${fecha}</h3>
                    <h3 class="hrP">HORA: ${(option === 'full' || option === 'time') ? (hh === 'n' ? '' : hh) : ''}</h3>
                </div>
                <div>
                    <h3 class="prP">PRECIO: ${(option === 'full' || option === 'price') ? precioPorAsiento : ''}</h3>
                    <h3 class="asP">ASIENTO: ${asiento}</h3>
                </div>
                <div>
                    <h3 id="emP" class="big">EMITIDO POR: </h3>
                </div>
                <h1 class="bv">¡¡BUEN VIAJE!!</h1>
                <p id="msj">AVISE 3 HRS ANTES DE ABORDAR EL BUS EN CASO DE DEVOLUCION<br>
                    No valido para credito fiscal.
                </p>
            `;
            
            printContainer.appendChild(ticketDiv);
            
            if (index < asientosSeleccionados.length - 1) {
                const pageBreak = document.createElement('div');
                pageBreak.style.pageBreakAfter = 'always';
                printContainer.appendChild(pageBreak);
            }
        });
    }

    // Resto del código para manejar la impresión...
    const img = new Image();
    img.src = 'img/logXXF.png';
    
    img.onload = function() {
        document.querySelectorAll('.imgPr2').forEach(imgEl => {
            imgEl.src = img.src;
        });
        
        setTimeout(() => {
            window.print();
            
            setTimeout(() => {
                printContainer.style.display = 'none';
                printContainer.innerHTML = '';
                
                const params = new URLSearchParams(window.location.search);
                const fechaParam = params.get("fecha");
                const fecha = encodeURIComponent(fechaParam);
                
                if (c1 == "n") {
                    window.location = `diario.html?fecha=${fecha}`;
                } else {
                    window.location = `ver.html?codR=${codR}&fecha=${fecha}`;
                }
            }, 500);
        }, 500);
    };
    
    img.onerror = function() {
        console.error("Error al cargar la imagen del logo");
        setTimeout(() => {
            window.print();
            
            setTimeout(() => {
                printContainer.style.display = 'none';
                printContainer.innerHTML = '';
                
                const params = new URLSearchParams(window.location.search);
                const fechaParam = params.get("fecha");
                const fecha = encodeURIComponent(fechaParam);
                
                if (c1 == "n") {
                    window.location = `diario.html?fecha=${fecha}`;
                } else {
                    window.location = `ver.html?codR=${codR}&fecha=${fecha}`;
                }
            }, 500);
        }, 500);
    };
}

// Iniciar intervalo para la hora
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();
document.addEventListener("keydown", function (e) {
    const inputs = Array.from(document.querySelectorAll('input[name="nm[]"], input[name="ci[]"], input[name="pr"]'));
    const currentInput = document.activeElement;
    const isInputFocused = inputs.includes(currentInput);

    // 1. Permitir siempre el comportamiento normal para teclas que no sean de navegación
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        return;
    }

    // 2. Manejar navegación solo si estamos en uno de nuestros inputs
    if (isInputFocused) {
        const currentIndex = inputs.indexOf(currentInput);
        
        // Permitir movimiento normal dentro del texto si hay selección o no estamos en los bordes
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            const atStart = (e.key === 'ArrowLeft' && currentInput.selectionStart === 0);
            const atEnd = (e.key === 'ArrowRight' && currentInput.selectionStart === currentInput.value.length);
            
            if (!atStart && !atEnd) {
                return; // Permitir movimiento normal dentro del texto
            }
        }

        e.preventDefault(); // Solo prevenir el comportamiento por defecto para navegación entre campos

        switch (e.key) {
            case "ArrowDown":
            case "Enter":
                // Mover al siguiente campo
                const nextIndex = (currentIndex + 1) % inputs.length;
                inputs[nextIndex].focus();
                break;

            case "ArrowUp":
                // Mover al campo anterior
                const prevIndex = (currentIndex - 1 + inputs.length) % inputs.length;
                inputs[prevIndex].focus();
                break;

            case "ArrowRight":
                // Si estamos en un nombre, mover al CI correspondiente
                if (currentInput.name === "nm[]") {
                    const ciIndex = currentIndex + 1;
                    if (ciIndex < inputs.length) inputs[ciIndex].focus();
                }
                break;

            case "ArrowLeft":
                // Si estamos en un CI, mover al nombre correspondiente
                if (currentInput.name === "ci[]") {
                    const nameIndex = currentIndex - 1;
                    if (nameIndex >= 0) inputs[nameIndex].focus();
                }
                break;
        }
    } else if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
        // 3. Si no hay input enfocado y se presiona una tecla de navegación, enfocar el primero
        e.preventDefault();
        if (inputs.length > 0) inputs[0].focus();
    }
});
