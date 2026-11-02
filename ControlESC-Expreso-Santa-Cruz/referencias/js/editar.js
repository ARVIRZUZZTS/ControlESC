const choferesMap = {};

const params = new URLSearchParams(window.location.search);
const codR = params.get('codR');

function back() {
    const fecha = document.getElementById('fe').value || params.get('fecha');
    window.location.href = `ver.html?codR=${codR}&fecha=${encodeURIComponent(fecha)}`;
}
function getReporte() {
    fetch(`php/common/reporte.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('c1').placeholder = data.con1 || 'CONDUCTOR 1';
            document.getElementById('l1').placeholder = data.lic1 || 'LICENCIA 1';
            document.getElementById('c2').placeholder = data.con2 || 'CONDUCTOR 2';
            document.getElementById('l2').placeholder = data.lic2 || 'LICENCIA 2';
            document.getElementById('ay').placeholder = data.ayudante || 'AYUDANTE';
            document.getElementById('dt').placeholder = data.destino || 'DESTINO';
            document.getElementById('pl').placeholder = data.placa || 'PLACA';
            document.getElementById('fe').placeholder = data.fecha || 'FECHA';
            document.getElementById('hr').placeholder = data.hora || 'HORA';
            document.getElementById('ca').placeholder = data.carril || 'CARRIL';
            if (data.placa) {
                fetch(`php/flota/getFlota.php?placa=${encodeURIComponent(data.placa)}`)
                    .then(r => r.json())
                    .then(flota => {
                        document.getElementById('planilla').value = flota?.nombre_planilla || '';
                        document.getElementById('propietario').value = flota?.propietario || '';
                        document.getElementById('marca').value = flota?.marca || '';
                    })
                    .catch(() => {});
                cargarDisenoBus(data.placa);
            }
        })
        .catch(error => console.error('Error al obtener el reporte:', error));
}

async function loadDatalists() {
    try {
        console.time('Carga completa');

        // Cargar choferes desde la tabla chofer (única fuente para conductores)
        const choferRes = await fetch('php/chofer/getChofer.php');
        if (choferRes.ok) {
            const choferes = await choferRes.json();
            if (choferes?.length) {
                choferes.forEach(c => {
                    if (c.nombre_chofer) choferesMap[c.nombre_chofer] = c;
                });
            }
        }

        const fillDatalist = (id, items) => {
            const datalist = document.getElementById(id);
            if (!datalist) return;
            const fragment = document.createDocumentFragment();
            (items || []).slice(0, 1000).forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                fragment.appendChild(option);
            });
            datalist.innerHTML = '';
            datalist.appendChild(fragment);
        };

        // Conductores y licencias SOLO desde la tabla chofer
        const choferNombres = Object.keys(choferesMap);
        const choferLicencias = [...new Set(Object.values(choferesMap).map(c => c.licencia).filter(Boolean))];

        fillDatalist('c1-list', choferNombres);
        fillDatalist('c2-list', choferNombres);
        fillDatalist('l1-list', choferLicencias);
        fillDatalist('l2-list', choferLicencias);

        const response = await fetch('php/common/getList.php');
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const lists = await response.json();

        for (const [key, values] of Object.entries(lists)) {
            if (['conLic', 'c1', 'l1', 'c2', 'l2', 'planillasCompletas'].includes(key)) continue;
            fillDatalist(`${key}-list`, values);
        }
        console.timeEnd('Llenar datalists');

        console.time('Configurar eventos');

        const setupConductorLicencia = (conductorId, licenciaId) => {
            const conductorInput = document.getElementById(conductorId);
            const licenciaInput = document.getElementById(licenciaId);
            if (!conductorInput || !licenciaInput) return;
            const updateLicencia = () => {
                const nombre = conductorInput.value.trim();
                const chofer = choferesMap[nombre];
                licenciaInput.value = chofer?.licencia || '';
            };
            conductorInput.addEventListener('input', updateLicencia);
            conductorInput.addEventListener('change', updateLicencia);
        };

        setupConductorLicencia('c1', 'l1');
        setupConductorLicencia('c2', 'l2');

        setupPlacaAutocomplete();
        console.timeEnd('Configurar eventos');
        console.timeEnd('Carga completa');

    } catch (error) {
        console.error("Error crítico:", error);
        alert("Error al cargar datos. Por favor recarga la página.");
    }
}
function setupPlacaAutocomplete() {
    const plInput = document.getElementById('pl');
    if (!plInput) return;

    plInput.addEventListener('change', async function() {
        const placa = this.value.trim();
        if (!placa) return;
        try {
            const res = await fetch(`php/flota/getFlota.php?placa=${encodeURIComponent(placa)}`);
            const flota = await res.json();
            if (flota && !flota.error) {
                document.getElementById('planilla').value = flota.nombre_planilla || '';
                document.getElementById('propietario').value = flota.propietario || '';
                document.getElementById('marca').value = flota.marca || '';
                document.getElementById('c1').placeholder = flota.conductor1 || '';
                document.getElementById('l1').placeholder = flota.licencia1 || '';
                document.getElementById('c2').placeholder = flota.conductor2 || '';
                document.getElementById('l2').placeholder = flota.licencia2 || '';
            }
        } catch (e) {
            console.error('Error al autocompletar por placa:', e);
        }
    });
}

const getVal = (id) => {
    const el = document.getElementById(id);
    return el.value.trim() || el.placeholder.trim();
};

async function save() {
    const asientosOcupados = await getAsientosOcupados();
    
    const pasajerosInputs = document.querySelectorAll('#dinamic .pasajero');
    let asientosDuplicados = [];
    let asientosInvalidos = [];
    
    pasajerosInputs.forEach(div => {
        const asientoInput = div.querySelector('.as');
        const asiento = asientoInput.value.trim() || asientoInput.placeholder;
        
        if (asientosOcupados.includes(asiento.toString()) && asientoInput.value.trim() !== '') {
            asientosInvalidos.push(asiento);
        }
        
        pasajerosInputs.forEach(otherDiv => {
            if (div !== otherDiv) {
                const otherAsientoInput = otherDiv.querySelector('.as');
                const otherAsiento = otherAsientoInput.value.trim() || otherAsientoInput.placeholder;
                if (asiento === otherAsiento && asientoInput.value.trim() !== '') {
                    asientosDuplicados.push(asiento);
                }
            }
        });
    });
    
    asientosDuplicados = [...new Set(asientosDuplicados)];
    asientosInvalidos = [...new Set(asientosInvalidos)];
    
    if (asientosDuplicados.length > 0 || asientosInvalidos.length > 0) {
        let mensaje = '';
        
        if (asientosDuplicados.length > 0) {
            mensaje += `Los siguientes asientos están duplicados: ${asientosDuplicados.join(', ')}\n`;
        }
        
        if (asientosInvalidos.length > 0) {
            mensaje += `Los siguientes asientos ya están ocupados: ${asientosInvalidos.join(', ')}\n`;
            mensaje += "Puede guardarlos en 0 (cero) si desea marcarlos como vacíos.";
        }
        
        alert(mensaje);
        return;
    }
    guardarDatos();
}

async function getAsientosOcupados() {
    try {
        const codR = new URLSearchParams(window.location.search).get('codR');
        
        // Obtener pasajeros existentes
        const pasajerosResponse = await fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`);
        const pasajeros = await pasajerosResponse.json();
        
        return pasajeros.map(p => p.asiento.toString());
    } catch (error) {
        console.error('Error al obtener asientos ocupados:', error);
        return [];
    }
}

async function guardarDatos() {
    const codR = new URLSearchParams(window.location.search).get('codR');
    const fechaInput = document.getElementById('fe').value || document.getElementById('fe').placeholder;

    const datosReporte = {
        codR: codR,
        con1: getVal('c1') || undefined,
        lic1: getVal('l1') || undefined,
        con2: getVal('c2') || undefined,
        lic2: getVal('l2') || undefined,
        ayudante: document.getElementById('ay').value || undefined,
        destino: document.getElementById('dt').value || undefined,
        placa: document.getElementById('pl').value || undefined,
        fecha: fechaInput,
        hora: document.getElementById('hr').value || undefined,
        carril: document.getElementById('ca').value || undefined
    };

    try {
        // Guardar reporte
        await fetch('php/editar/updateReporte.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosReporte)
        });

        // Procesar pasajeros
        const pasajerosActualizar = [];
        const pasajerosBorrar = [];
        
        document.querySelectorAll('#dinamic .pasajero').forEach(div => {
            const asientoInput = div.querySelector('.as');
            const nombreInput = div.querySelector('.nm');
            const ciInput = div.querySelector('.ci');
            const precioInput = div.querySelector('.pr');
        
            const asiento = asientoInput.value.trim();
            const nombre = nombreInput.value.trim();
            const ci = ciInput.value.trim();
            const precio = precioInput.value.trim();
        
            const codP = parseInt(div.id);
            
            // Si el asiento es 0, marcamos para borrar
            if (asiento === '0') {
                pasajerosBorrar.push(codP);
            } 
            // Si hay cambios (valor diferente al placeholder o diferente de vacío)
            else if (asiento !== asientoInput.placeholder || 
                     nombre !== nombreInput.placeholder || 
                     ci !== ciInput.placeholder || 
                     precio !== precioInput.placeholder) {
                pasajerosActualizar.push({ 
                    codR, 
                    codP, 
                    asiento: asiento || asientoInput.placeholder,
                    nombre: nombre || nombreInput.placeholder,
                    ci: ci || ciInput.placeholder,
                    precio: precio || precioInput.placeholder
                });
            }
        });

        if (pasajerosBorrar.length > 0) {
            const deleteResponse = await fetch('php/editar/deletePasajero.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codR, pasajeros: pasajerosBorrar })
            });
            const deleteResult = await deleteResponse.json();
            console.log('Resultado borrado:', deleteResult);
            
            if (!deleteResult.success) {
                throw new Error(deleteResult.error || "Error al borrar pasajeros");
            }
        }

        // Luego actualizamos los demás
        if (pasajerosActualizar.length > 0) {
            const updateResponse = await fetch('php/editar/updatePasajero.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pasajerosActualizar)
            });
            const updateResult = await updateResponse.json();
            console.log('Resultado actualización:', updateResult);
            
            if (!updateResult.success) {
                throw new Error(updateResult.error || "Error al actualizar pasajeros");
            }
        }

        window.location.href = `ver.html?codR=${codR}&fecha=${encodeURIComponent(fecha)}`;
        
    } catch (error) {
        console.error('Error en guardarDatos:', error);
        alert("Ocurrió un error al guardar: " + error.message);
    }
}
async function cargarDisenoBus(placa) {
  try {
    const codR = new URLSearchParams(window.location.search).get('codR');
    const busElement = document.getElementById('bus');
    busElement.innerHTML = '';
    
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
      const posX = parseInt(item.posX) || 0;
      const posY = parseInt(item.posY) || 0;
      
      // Configuración común
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
        div.classList.add(estaOcupado ? 'asOcu' : 'asLib');
        
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

function obtenerPasajeros(codR) {
    fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = ''; // Limpiar contenido anterio
            data.forEach(pasajero => {
                const div = document.createElement('div');
                div.classList.add('pasajero');
                div.id = pasajero.codP;

                const inputSit = document.createElement('input');
                inputSit.type = 'number';
                inputSit.placeholder = pasajero.asiento;
                inputSit.classList.add('as');

                const inputNombre = document.createElement('input');
                inputNombre.type = 'text';
                inputNombre.placeholder = pasajero.nombre;
                inputNombre.classList.add('nm');

                const inputCi = document.createElement('input');
                inputCi.type = 'number';
                inputCi.placeholder = pasajero.ci;
                inputCi.classList.add('ci');

                const inputPr = document.createElement('input');
                inputPr.type = 'number';
                inputPr.placeholder = pasajero.precio;
                inputPr.classList.add('pr');

                div.appendChild(inputSit);
                div.appendChild(inputNombre);
                div.appendChild(inputCi);
                div.appendChild(inputPr);
                contenedor.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error al obtener los pasajeros:', error);
        });
}
function actualizarFechaHoraFooter() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}

window.onload = () => {
    getReporte();
    actualizarFechaHoraFooter();
    setInterval(actualizarFechaHoraFooter, 1000); 
    obtenerPasajeros(codR);
    setFecha();
    loadDatalists();
};
function setFecha() {
    document.getElementById("fecha").textContent = "FECHA SELECCIONADA: " + params.get('fecha');
}

document.addEventListener('keydown', function(e) {
     if (e.key === 'Enter') {
        e.preventDefault();
        save(); // Ejecutar función de guardado
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        back(); // Volver a ver.html
    }
    const editableClasses = ['as', 'nm', 'ci', 'pr'];
    const active = document.activeElement;
    if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        (!active || !editableClasses.some(cls => active.classList.contains(cls)))
    ) {
        const firstInput = document.querySelector('#dinamic .pasajero .as'); // Primer campo de asiento
        if (firstInput) {
            e.preventDefault();
            firstInput.focus();
            firstInput.select();
        }
        return; // No continuar con navegación, ya se enfocó
    }
    if (['ArrowUp', 'ArrowDown'].includes(e.key) && document.activeElement.type === 'number') {
        e.preventDefault();
    }

    const current = document.activeElement;
    if (!current || !current.classList.contains('as') && !current.classList.contains('nm') && !current.classList.contains('ci') && !current.classList.contains('pr')) return;

    const currentDiv = current.closest('.pasajero');
    if (!currentDiv) return;

    const rows = Array.from(document.querySelectorAll('#dinamic .pasajero'));

    const currentIndex = rows.indexOf(currentDiv);
    if (currentIndex === -1) return;

    const fieldClass = current.classList[0];

    if (e.key === 'ArrowDown' && currentIndex < rows.length - 1) {
        e.preventDefault();
        const nextInput = rows[currentIndex + 1].querySelector(`.${fieldClass}`);
        if (nextInput) nextInput.focus();
    }

    if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        const prevInput = rows[currentIndex - 1].querySelector(`.${fieldClass}`);
        if (prevInput) prevInput.focus();
    }

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const order = ['as', 'nm', 'ci', 'pr'];
        const currentPos = order.indexOf(fieldClass);
        if (currentPos > 0) {
            const leftInput = currentDiv.querySelector(`.${order[currentPos - 1]}`);
            if (leftInput) leftInput.focus();
        }
    }

    if (e.key === 'ArrowRight') {
        e.preventDefault();
        const order = ['as', 'nm', 'ci', 'pr'];
        const currentPos = order.indexOf(fieldClass);
        if (currentPos < order.length - 1) {
            const rightInput = currentDiv.querySelector(`.${order[currentPos + 1]}`);
            if (rightInput) rightInput.focus();
        }
    }
    const lista = document.getElementById('lista');
    if (!lista) return;

    const SCROLL_AMOUNT = 68; // Puedes ajustar este valor

    switch (event.key) {
        case 'ArrowUp':
            lista.scrollTop -= SCROLL_AMOUNT;
            event.preventDefault();
            break;
        case 'ArrowDown':
            lista.scrollTop += SCROLL_AMOUNT;
            event.preventDefault();
            break;
    }
});
