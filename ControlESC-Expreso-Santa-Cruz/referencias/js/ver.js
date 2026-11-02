const params = new URLSearchParams(window.location.search);
const codR = params.get('codR');
var total = 0;
window.onload = () => {
    obtenerDatosReporte(codR);
    obtenerPasajeros(codR);
    actualizarFechaHoraFooter();
    setInterval(actualizarFechaHoraFooter, 1000); 
    setFecha();
    setTitleDat(codR);
};
function back() {
    window.location = "menu.html";
}
function edit() {
    const params = new URLSearchParams(window.location.search);
    const codR = params.get('codR');
    const fecha = encodeURIComponent(params.get('fecha'));
    window.location.href = `editar.html?codR=${codR}&fecha=${fecha}`;
}
function add(asiento) {
    const params = new URLSearchParams(window.location.search);
    const codR = params.get('codR');
    const fecha = encodeURIComponent(params.get("fecha"));
    const c1 = encodeURIComponent(document.getElementById('c1').textContent.trim());
    const pl = encodeURIComponent(document.getElementById('pl').textContent.trim());
    const placa = encodeURIComponent(document.getElementById('pl').textContent.trim());
    const fe = encodeURIComponent(document.getElementById('fe').textContent.trim());
    const dt = encodeURIComponent(document.getElementById('dt').textContent.trim());
    const as = encodeURIComponent(asiento);
    const hh = encodeURIComponent(document.getElementById('hr').textContent.trim());
    window.location.href = `pasajero.html?fecha=${fecha}&codR=${codR}&c1=${c1}&pl=${pl}&placa=${placa}&fe=${fe}&dt=${dt}&as=${as}&hh=${hh}`;
}

function obtenerDatosReporte(codR) {
    fetch(`php/common/reporte.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('c1').textContent = data.con1 || '';
            document.getElementById('l1').textContent = data.lic1 || '';
            document.getElementById('c2').textContent = data.con2 || '';
            document.getElementById('l2').textContent = data.lic2 || '';
            document.getElementById('ay').textContent = data.ayudante || '';
            document.getElementById('dt').textContent = data.destino || '';
            document.getElementById('pl').textContent = data.placa || '';
            document.getElementById('fe').textContent = data.fecha || '';
            document.getElementById('hr').textContent = data.hora || '';
            document.getElementById('ca').textContent = data.carril || '';
            if (data.placa) {
                fetch(`php/flota/getFlota.php?placa=${encodeURIComponent(data.placa)}`)
                    .then(res => res.json())
                    .then(flota => {
                        document.getElementById('placa').textContent = flota?.nombre_planilla || 'SIN PLANILLA';
                        document.getElementById('propietario').textContent = flota?.propietario || '-';
                        document.getElementById('marca').textContent = flota?.marca || '-';
                    })
                    .catch(() => {
                        document.getElementById('placa').textContent = 'SIN PLANILLA';
                    });
                cargarDisenoBus(data.placa);
            } else {
                document.getElementById('placa').textContent = '';
                document.getElementById('propietario').textContent = '';
                document.getElementById('marca').textContent = '';
            }
        })
        .catch(error => {
            console.error('Error al obtener datos del reporte:', error);
        });
}
function actualizarFechaHoraFooter() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
function obtenerPasajeros(codR) {
    total = 0;
    fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = ''; // Limpiar contenido anterior
            
            if (data.length === 0) {
                // Mostrar mensaje cuando no hay pasajeros
                const mensaje = document.createElement('h3');
                mensaje.textContent = 'NO HAY PASAJEROS EN ESTE BUS';
                mensaje.style.textAlign = 'center';
                mensaje.style.width = '100%';
                mensaje.style.margin = '20px 0';
                mensaje.style.color = '#666';
                contenedor.appendChild(mensaje);
            } else {
                // Procesar pasajeros si los hay
                data.forEach(pasajero => {
                    const div = document.createElement('div');
                    div.classList.add('pasajero');

                    const h3Sit = document.createElement('h3');
                    h3Sit.textContent = pasajero.asiento;
                    h3Sit.classList.add('as');

                    const h3Nombre = document.createElement('h3');
                    h3Nombre.textContent = pasajero.nombre;
                    h3Nombre.classList.add('nm');

                    const h3Ci = document.createElement('h3');
                    h3Ci.textContent = pasajero.ci;
                    h3Ci.classList.add('ci');

                    const h3Pr = document.createElement('h3');
                    h3Pr.textContent = pasajero.precio;
                    h3Pr.classList.add('pr');

                    const printButton = document.createElement('button');
                    printButton.setAttribute('onclick', `printy(${pasajero.codP})`);
                    printButton.classList.add('pp');
                    const img = document.createElement('img');
                    img.src = 'img/printW.png';
                    img.alt = 'Imprimir';
                    printButton.appendChild(img);

                    div.appendChild(h3Sit);
                    div.appendChild(h3Nombre);
                    div.appendChild(h3Ci);
                    div.appendChild(h3Pr);
                    div.appendChild(printButton);
                    
                    total += parseFloat(pasajero.precio) || 0;
                    contenedor.appendChild(div);
                });
            }
            document.getElementById("total").textContent = total + " Bs";
        })
        .catch(error => {
            console.error('Error al obtener los pasajeros:', error);
            // También puedes mostrar un mensaje de error en la interfaz si lo deseas
            const contenedor = document.getElementById('dinamic');
            contenedor.innerHTML = '<h3 style="text-align: center; width: 100%; margin: 20px 0; color: #f00;">Error al cargar los pasajeros</h3>';
        });
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
        if (estaOcupado) {
          div.classList.add('asOcu');
        } else {
          div.classList.add('asLib');
          // Hacer el asiento clickeable
          div.style.cursor = 'pointer';
          div.addEventListener('click', () => {
            add(item.numAs);
          });
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


function setFecha() {
    const params = new URLSearchParams(window.location.search);
    document.getElementById("fecha").textContent = "FECHA SELECCIONADA: " + params.get('fecha');
}
function setTitleDat(codR){
    document.getElementById("titleDat").textContent = "REPORTE N° " + codR;
}

function printy(codP) {
    const printReporte = document.getElementById('printReporte');
    const printPasajero = document.getElementById('printPasajero');
    const horaActual = document.getElementById("hora").textContent;
    const fechaActual = document.getElementById("fe").textContent;
    
    // Limpiar contenedores de impresión
    printReporte.style.display = 'none';
    printReporte.innerHTML = '';
    printPasajero.style.display = 'none';
    printPasajero.innerHTML = '';

    // Obtener datos comunes
    const datos = {
        c1: document.getElementById("c1").textContent,
        l1: document.getElementById("l1").textContent,
        c2: document.getElementById("c2").textContent,
        l2: document.getElementById("l2").textContent,
        ay: document.getElementById("ay").textContent,
        dt: document.getElementById("dt").textContent,
        pl: document.getElementById("pl").textContent,
        placa: document.getElementById("placa").textContent,
        fe: fechaActual,
        hr: document.getElementById("hr").textContent,
        ca: document.getElementById("ca").textContent,
        marca: document.getElementById("marca").textContent,
        horaActual: horaActual
    };

    if (codP == 0) {
        // IMPRIMIR LISTA DE PASAJEROS (con múltiples copias y cortes) - MANTENEMOS ESTO IGUAL
        const cantidad = prompt("¿Cuántas copias de la lista deseas imprimir?", "1");
        if (cantidad === null) return;
        
        const numCopias = parseInt(cantidad);
        if (isNaN(numCopias) || numCopias <= 0) {
            alert("Por favor ingresa un número válido mayor que 0");
            return;
        }

        const codR = new URLSearchParams(window.location.search).get('codR');

        fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
            .then(response => response.json())
            .then(data => {
                printReporte.innerHTML = '';
                
                // Plantilla HTML para la lista de pasajeros
                const listaHTML = (index) => `
                    <div class="copia-lista" ${index < numCopias - 1 ? 'style="page-break-after: always;"' : ''}>
                        <div id="topPrint">
                            <img id="imgPr" src="img/logXXF.png" alt="Logo" onerror="this.style.display='none'">
                            <div>
                                <h2 id="lbsc">LINEA DE BUSES EXP SANTA CRUZ</h2>
                            </div>
                            <div>
                                <h3 class="tizq">CONDUCTOR 1: ${datos.c1} (Licencia: ${datos.l1})</h3>
                            </div>
                            <div>
                                <h3 class="tizq">CONDUCTOR 2: ${datos.c2} (Licencia: ${datos.l2})</h3>
                            </div>
                            <div>
                                <h3 class="tizq">PLACA: ${datos.pl}</h3>
                                <h3>DESTINO: ${datos.dt}</h3>
                            </div>
                            <div>                    
                                <h3 class="tizq">FECHA: ${datos.fe}</h3>
                                <h3>HORA: ${datos.hr}</h3>
                            </div>
                        </div>
                        <hr>
                        <div id="titlesPr">
                            <h3 class="asP">N°</h3>
                            <h3 class="nmP">NOMBRE</h3>
                            <h3 class="ciP">CI</h3>
                        </div>
                        <div id="pasajerosPrint">
                            ${data.map(pasajero => `
                                <div class="pasajeroPrint">
                                    <h3 class="asP">${pasajero.asiento}</h3>
                                    <h3 class="nmP">${pasajero.nombre}</h3>
                                    <h3 class="ciP">${pasajero.ci}</h3>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Agregar todas las copias al contenedor
                for (let i = 0; i < numCopias; i++) {
                    const copiaDiv = document.createElement('div');
                    copiaDiv.innerHTML = listaHTML(i);
                    printReporte.appendChild(copiaDiv);
                }

                printReporte.style.display = 'block';

                // Precargar imagen
                const img = new Image();
                img.src = 'img/logXXF.png';
                img.onload = function() {
                    document.querySelectorAll('#imgPr').forEach(imgEl => {
                        imgEl.src = img.src;
                    });
                    setTimeout(() => {
                        window.print();
                        printReporte.style.display = 'none';
                    }, 500);
                };
                img.onerror = function() {
                    setTimeout(() => {
                        window.print();
                        printReporte.style.display = 'none';
                    }, 500);
                };
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error al cargar la lista de pasajeros");
            });
    } else if (codP == -1) {
        const cantidad = prompt(`¿Cuántos tickets vacíos para el ${datos.pl} deseas imprimir?`, "1");
        
        if (cantidad === null) return;
        const numTickets = parseInt(cantidad);
        if (isNaN(numTickets) || numTickets <= 0) {
            alert("Por favor ingresa un número válido mayor que 0");
            return;
        }

        const ticketHTML = `
        <div id="pasajeroPrintBody">
            <img id="imgPr2" src="img/logXXF.png" alt="Logo">
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
                <h3 id="dtP" class="cien">De SC a: ${datos.dt}</h3>
            </div>
            <div>
                <h3 id="nmP" class="cien big">NOMBRE: </h3>
            </div>
            <div>
                <h3 class="ciPr big">CI/CEL: </h3>
            </div>
            <div>
                <h3 class="pl">PLACA: </h3>
                <h3 class="ca">CARRIL: ${datos.ca}</h3>
            </div>
            <div>
                <h3 id="fechaPrint">FECHA: ${datos.fe}</h3>
                <h3 id="hrP">HORA: </h3>
            </div> 
            <div>
                <h3 id="prP" class="big">PRECIO: </h3>
                <h3 id="asP" class="big">ASIENTO: </h3>                
            </div>
            <div>
                <h3 id="emP" class="big">EMITIDO POR: </h3>
            </div>
            <h1 id="bv">¡¡BUEN VIAJE!!</h1>
            <p id="msj">AVISE 3 HRS ANTES DE ABORDAR EL BUS EN CASO DE DEVOLUCION<br>
                No valido para credito fiscal.
            </p>
        </div>
        `;

        document.getElementById('printPasajero').style.display = 'block';
        document.getElementById("printPasajero").innerHTML = '';
        
        for (let i = 0; i < numTickets; i++) {
            const ticketDiv = document.createElement('div');
            ticketDiv.innerHTML = ticketHTML;
            document.getElementById("printPasajero").appendChild(ticketDiv);
            
            if (i < numTickets - 1) {
                const corte = document.createElement('div');
                corte.style.pageBreakAfter = 'always';
                document.getElementById("printPasajero").appendChild(corte);
            }
        }

        const img = new Image();
        img.src = 'img/logXXF.png';
        img.onload = function() {
            document.querySelectorAll('#imgPr2').forEach(imgEl => {
                imgEl.src = img.src;
            });
            
            setTimeout(() => {
                window.print();
                document.getElementById('printPasajero').style.display = 'none';
            }, 200);
        };
        img.onerror = function() {
            console.error("No se pudo cargar la imagen");
            window.print();
            document.getElementById('printPasajero').style.display = 'none';
        };
    } else if (codP == -2) {
        const descuento = prompt(`¿CUANTO ES EL DESCUENTO?`, "1");
        
        if (descuento === null) return;
        const descu = parseInt(descuento);
        if (isNaN(descu) || descu <= 0) {
            alert("Por favor ingresa un descuento valido");
            return;
        }
        const ticketHTML = `
            <div id="pasajeroPrintBody">
                <img id="imgPr2" src="img/logXXF.png" alt="Logo">
                <div id="detalle">
                    <h3 class="botBor lefty">DETALLE DE PASAJES</h3>
                    <div id="precios"  class="botBor lefty"></div>
                    <h3 id="totalText" class="righty">TOTAL: </h3>
                </div>
                <br>
                <div><h3 id="descue" class="marNon">DESCUENTO..............................</h3></div>
                <div><h3 id="saldo" class="marNon lefty">SALDO: </h3></div>
                <h3 class="blank">---</h3>
            </div>
        `;

        document.getElementById('printPasajero').style.display = 'block';
        document.getElementById("printPasajero").innerHTML = '';

        const ticketDiv = document.createElement('div');
        ticketDiv.innerHTML = ticketHTML;
        document.getElementById("printPasajero").appendChild(ticketDiv);

        fetch(`php/common/getPasajeros.php?codR=${encodeURIComponent(codR)}`)
            .then(response => response.json())
            .then(data => {
                let total = 0;
                const preciosDiv = document.getElementById('precios');

                const grouped = data.reduce((acc, pasajero) => {
                const precio = parseFloat(pasajero.precio) || 0;
                acc[precio] = (acc[precio] || 0) + 1;
                total += precio;
                return acc;
            }, {});

            Object.entries(grouped).forEach(([precio, cantidad]) => {
                const resultado = cantidad * precio;
                const h3 = document.createElement('h3');
                h3.textContent = `${cantidad} * ${precio} Bs = ${resultado} Bs`;
                preciosDiv.appendChild(h3);
            });
            document.getElementById('totalText').textContent = `TOTAL: ${total} Bs`;

            let saldo = total - descu;
            document.getElementById('descue').textContent= `DESCUENTO:...${descu}.Bs..................`;
            document.getElementById('saldo').textContent= `SALDO: ${saldo} Bs`;
            const img = new Image();
            img.src = 'img/logXXF.png';
            img.onload = () => {
                document.querySelectorAll('#imgPr2').forEach(imgEl => imgEl.src = img.src);
                setTimeout(() => {
                    window.print();
                    document.getElementById('printPasajero').style.display = 'none';
                }, 200);
            };
            img.onerror = () => {
                console.error("No se pudo cargar la imagen");
                window.print();
                document.getElementById('printPasajero').style.display = 'none';
            };
        })
    .catch(error => {
        console.error('Error al obtener los pasajeros:', error);
        const contenedor = document.getElementById('dinamic');
        contenedor.innerHTML = '<h3 style="width: 100%;">Error al cargar los pasajeros</h3>';
    });

} else {

        // SOLO AQUÍ AGREGAMOS EL MODAL PARA TICKETS INDIVIDUALES
        showPrintOptionsModal(codP, datos);
    }
}

// Función para mostrar el modal de opciones de impresión (SOLO PARA TICKETS INDIVIDUALES)
function showPrintOptionsModal(codP, datos) {
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
            <button id="printCancel" class="print-option-btn cancel-btn">CANCELAR</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Configurar botones del modal
    document.getElementById('printFull').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(codP, datos, 'full');
    });
    
    document.getElementById('printPrice').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(codP, datos, 'price');
    });
    
    document.getElementById('printTime').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(codP, datos, 'time');
    });
    
    document.getElementById('printEmpty').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(codP, datos, 'empty');
    });
    
    document.getElementById('printCancel').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
}

// Función para imprimir ticket individual según la opción seleccionada
function printIndividualTicket(codP, datos, option) {
    const printPasajero = document.getElementById('printPasajero');
    printPasajero.style.display = 'none';
    printPasajero.innerHTML = '';

    // Buscar el pasajero específico
    const pasajeros = document.querySelectorAll("#dinamic .pasajero");
    let pasajeroEncontrado = null;

    pasajeros.forEach(pasajeroDiv => {
        const boton = pasajeroDiv.querySelector("button");
        if (boton && boton.getAttribute("onclick") === `printy(${codP})`) {
            pasajeroEncontrado = {
                asiento: pasajeroDiv.querySelector(".as").textContent,
                nombre: pasajeroDiv.querySelector(".nm").textContent,
                ci: pasajeroDiv.querySelector(".ci").textContent,
                precio: pasajeroDiv.querySelector(".pr").textContent
            };
        }
    });

    if (!pasajeroEncontrado) {
        alert("No se encontró el pasajero especificado");
        return;
    }

    // Generar el ticket según la opción seleccionada
    printPasajero.innerHTML = `
        <div id="pasajeroPrintBody">
            <img id="imgPr2" src="img/logXXF.png" alt="Logo" onerror="this.style.display='none'">
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
                <h3 id="dtP" class="cien">De SC a: ${datos.dt}</h3>
            </div>
            <div>
                <h3 id="nmP" class="cien">NOMBRE: ${pasajeroEncontrado.nombre}</h3>    
            </div>
            <div>
                <h3 class="ciPr">CI/CEL: ${pasajeroEncontrado.ci}</h3>
            </div>
            <div>
                <h3 class="pl">PLACA: ${datos.pl}</h3>
                <h3 class="ca">CARRIL: ${datos.ca}</h3>
            </div>
            <div>
                <h3 id="fechaPrint">FECHA: ${datos.fe}</h3> 
                <h3 id="hrP">HORA: ${option === 'full' || option === 'time' ? datos.hr : ''}</h3> 
            </div>
            <div>
                <h3 id="prP">PRECIO: ${option === 'full' || option === 'price' ? pasajeroEncontrado.precio : ''}</h3>
                <h3 id="asP">ASIENTO: ${pasajeroEncontrado.asiento}</h3>
            </div>
            <div>
                <h3 id="emP" class="big">EMITIDO POR: </h3>
            </div>
            <h1 id="bv">¡¡BUEN VIAJE!!</h1>
            <p id="msj">AVISE 3 HRS ANTES DE ABORDAR EL BUS EN CASO DE DEVOLUCION<br>
                No valido para credito fiscal.
            </p>
        </div>
    `;

    printPasajero.style.display = 'block';

    // Precargar imagen
    const img = new Image();
    img.src = 'img/logXXF.png';
    img.onload = function() {
        document.getElementById("imgPr2").src = img.src;
        setTimeout(() => {
            window.print();
            printPasajero.style.display = 'none';
        }, 500);
    };
    img.onerror = function() {
        setTimeout(() => {
            window.print();
            printPasajero.style.display = 'none';
        }, 500);
    };
}
function printOrdenSalida() {
    const printReporte = document.getElementById('printReporte');
    const datos = {
        c1: document.getElementById("c1").textContent,
        c2: document.getElementById("c2").textContent,
        l1: document.getElementById("l1").textContent,
        l2: document.getElementById("l2").textContent,
        dt: document.getElementById("dt").textContent,
        pl: document.getElementById("pl").textContent,
        fe: document.getElementById("fe").textContent,
        hr: document.getElementById("hr").textContent,
        marca: document.getElementById("marca").textContent
    };
    printReporte.style.display = 'none';
    printReporte.innerHTML = '';

    const template = `
        <div class="os-copy">
            <div class="os-content">
                <div class="os-header">
                    <img class="os-logo" src="img/logXXF.png" alt="Logo">
                    <h2 class="os-salida">ORDEN DE SALIDA</h2>
                </div>
                <div class="os-body">
                    <div class="os-left">
                        <h4>CONDUCTOR:<span>..</span>${datos.c1}<span>..</span></h4>
                        <h4>CONDUCTOR:<span>..</span>${datos.c2}<span>..</span></h4>
                        <h4>MARCA:<span>..</span>${datos.marca}<span>..</span></h4>
                        <h4>DESTINO:<span>..</span>${datos.dt}<span>..</span></h4>
                    </div>
                    <div class="os-right">
                        <h4>BREVET:${datos.l1}</h4>
                        <h4>BREVET:${datos.l2}</h4>
                        <h4>PLACA:${datos.pl}</h4>
                        <h4>HR.SALIDA:${datos.hr}</h4>
                    </div>
                </div>
                <h5 class="os-fecha">..SANTA..CRUZ.....${datos.fe}..</h5>
                <div class="os-signatures">
                    <h4 class="os-sig">Administrador</h4>
                    <h4 class="os-sig">V°B° JEFE SECC. TECNICA</h4>
                </div>
            </div>
        </div>
    `;

    for (let i = 0; i < 2; i++) {
        const div = document.createElement('div');
        div.innerHTML = template;
        printReporte.appendChild(div);
        if (i < 1) {
            const brk = document.createElement('div');
            brk.style.pageBreakAfter = 'always';
            printReporte.appendChild(brk);
        }
    }

    printReporte.style.display = 'block';

    const img = new Image();
    img.src = 'img/logXXF.png';
    img.onload = function() {
        document.querySelectorAll('.os-logo').forEach(el => el.src = img.src);
        setTimeout(() => {
            window.print();
            printReporte.style.display = 'none';
        }, 200);
    };
    img.onerror = function() {
        setTimeout(() => {
            window.print();
            printReporte.style.display = 'none';
        }, 200);
    };
}
function del() {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este reporte?");
    if (!confirmacion) return;

    const params = new URLSearchParams(window.location.search);
    const codR = params.get('codR');

    fetch(`php/editar/eliminarReporte.php?codR=${encodeURIComponent(codR)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location = "menu.html"; 
            } else {
                alert("Error al eliminar: " + (data.error || "Error desconocido"));
            }
        })
        .catch(error => {
            console.error("Error al eliminar:", error);
            alert("Ocurrió un error al intentar eliminar el reporte.");
        });
}

document.addEventListener('keydown', (event) => {
    const lista = document.getElementById('lista');
    if (!lista) return;

    const SCROLL_AMOUNT = 60; // Puedes ajustar este valor

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