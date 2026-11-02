var totalT = 0;
function back() {
    window.location = "menu.html";
}
function buses() {
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fecha = decodeURIComponent(fechaParam);
    const fechaCod = encodeURIComponent(fechaParam);
    window.location = `buses.html?fecha=${fechaCod}`;
}
function crear() {
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fecha = decodeURIComponent(fechaParam);
    const fechaCod = encodeURIComponent(fechaParam);
    window.location = `pasajero.html?fecha=${fechaCod}`;
}
function diario() {    
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fecha = decodeURIComponent(fechaParam);
    console.log(fecha);
    document.getElementById('fecha').textContent  = "FECHA SELECCIONADA: " + fecha;
}

function actualizarFechaHora() {
    const ahora = new Date();
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

document.addEventListener("DOMContentLoaded", () => {
    diario();
    getDiarios();
});

function getDiarios() {
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.get("fecha");
    const fechaDecodificada = decodeURIComponent(fechaParam);
    totalT = 0;
    fetch(`php/diario/getDiarios.php?fecha=${encodeURIComponent(fechaDecodificada)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(data => {
            const contenedor = document.getElementById("dinamic");
            contenedor.innerHTML = ""; // Limpiar antes
            if (data.length === 0) {
                const mensaje = document.createElement('h2');
                mensaje.textContent = 'NO HAY PASAJEROS REGISTRADOS';
                mensaje.style.textAlign = 'center'; // opcional: centrar texto
                contenedor.appendChild(mensaje);
                return; // detener ejecución si no hay pasajeros
            }

            fetch(`php/diario/obtenerReportesDiarios.php?fecha=${encodeURIComponent(fechaDecodificada)}`)
                .then(res => res.json())
                .then(reportes => {
                    data.forEach(p => {
                        const div = document.createElement("div");
                        div.classList.add("reporte");
                        div.id = `pasajero-${p.codP}`;
                        // Generar opciones del datalist desde PHP
                        const opciones = reportes.map(r => `<option value="Reporte ${r.codR}_${r.placa}"></option>`).join("");
                        let codsitoR = "Elegir reporte";
                        if (p.codR != null) {
                            const reporteAsignado = reportes.find(r => r.codR === p.codR);
                            if (reporteAsignado) {
                                codsitoR = `Reporte ${reporteAsignado.codR}_${reporteAsignado.placa}`;
                            } else {
                                codsitoR = `Reporte ${p.codR}_???`; 
                            }
                        }
                        div.innerHTML = `
                            <input class="dl" list="reportes-${p.codP}" id="input-reporte-${p.codP}" placeholder="${codsitoR}">
                            <datalist id="reportes-${p.codP}">
                                ${opciones}
                            </datalist>
                            <button class="sv" onclick="guarda(${p.codP})">GUARDAR</button>

                            <h2 class="nm">${p.nombre}</h2>
                            <h2 class="ci">${p.ci}</h2>
                            <h2 class="dt">${p.destino}</h2>
                            <h2 class="as">${p.asiento}</h2>
                            <h2 class="pr">${p.precio}</h2>

                            <button class="im" onclick="printy(${p.codP})"><img src="img/printW.png"></button>
                        `;
                        totalT += p.precio;
                        contenedor.appendChild(div);
                    });
                    document.getElementById("tota").textContent = "Total: " + totalT.toFixed(2);
                })
                .catch(err => {
                    console.error("Error cargando reportes:", err);
                    document.getElementById("tota").textContent = "Total: 0";
                });
        })
        .catch(error => {
            console.error("Error al cargar los diarios:", error);
            document.getElementById("tota").textContent = "Total: 0";
        });
}

function guarda(codP) {
    const input = document.getElementById(`input-reporte-${codP}`);
    const valor = input.value;

    const match = valor.match(/^Reporte (\d+)_/);
    if (!match) {
        alert("Selecciona un reporte válido.");
        return;
    }

    const codR = parseInt(match[1]); 
    console.log(`Asignando codR=${codR} a codP=${codP}`);

    // Primero verificar disponibilidad de asiento
    verificarDisponibilidadAsiento(codP, codR);
}
async function verificarDisponibilidadAsiento(codP, codR) {
    try {
        // 1. Obtener datos del pasajero actual
        const pasajeroRes = await fetch(`php/diario/getPasajeros2.php?codP=${codP}`);
        if (!pasajeroRes.ok) throw new Error(`Error HTTP: ${pasajeroRes.status}`);
        
        const pasajero = await pasajeroRes.json();
        if (!pasajero || !pasajero.codP) throw new Error("No se encontró el pasajero");
        
        const asientoActual = pasajero.asiento;
        if (!asientoActual) throw new Error("El pasajero no tiene asiento asignado");

        // 2. Obtener todos los pasajeros del reporte
        const pasajerosRes = await fetch(`php/diario/getPasajerosPorReporte.php?codR=${codR}`);
        if (!pasajerosRes.ok) throw new Error(`Error HTTP: ${pasajerosRes.status}`);
        
        const pasajeros = await pasajerosRes.json();
        if (!Array.isArray(pasajeros)) throw new Error("Formato de datos inválido para pasajeros");

        // 3. Obtener datos del bus (placa)
        const reporteRes = await fetch(`php/common/getReporte.php?codR=${codR}`);
        if (!reporteRes.ok) throw new Error(`Error HTTP: ${reporteRes.status}`);
        
        const reporte = await reporteRes.json();
        if (!reporte || !reporte.placa) throw new Error("No se encontró el reporte o falta la placa del bus");

        // 4. Verificar disponibilidad del asiento
        const asientoOcupado = pasajeros.some(p => p.asiento == asientoActual && p.codP != codP);

        if (!asientoOcupado) {
            asignarReporteDirecto(codP, codR);
            return;
        }

        // 5. Buscar asiento alternativo
        const asientosOcupados = pasajeros.map(p => parseInt(p.asiento)).filter(a => !isNaN(a));
        const asientoLibre = await encontrarAsientoLibre(reporte.placa, asientoActual, asientosOcupados);
        
        if (asientoLibre === null) {
            alert("El bus está lleno, NO hay asientos disponibles");
            return;
        }
        
        const confirmacion = confirm(`El asiento ${asientoActual} está ocupado. ¿Desea asignar el asiento ${asientoLibre} en su lugar?`);
        
        if (confirmacion) {
            // Actualizar directamente sin redirección
            await actualizarAsientoYReporte(codP, codR, asientoLibre);
        }

    } catch (error) {
        console.error("Error en verificarDisponibilidadAsiento:", error);
        alert(`Error: ${error.message || "No se pudo verificar la disponibilidad del asiento"}`);
    }
}
async function actualizarAsientoYReporte(codP, codR, nuevoAsiento) {
    try {
        // Primero verificar y actualizar el asiento
        const responseAsiento = await fetch("php/diario/actualizarAsiento.php", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codP: codP,
                asiento: nuevoAsiento,
                codR: codR // Enviamos el codR para la verificación
            })
        });

        const resultAsiento = await responseAsiento.json();

        if (!resultAsiento.success) {
            throw new Error(resultAsiento.error || "Error al actualizar asiento");
        }

        // Luego asignar el reporte
        const datos = new FormData();
        datos.append("codP", codP);
        datos.append("codR", codR);

        const responseReporte = await fetch("php/diario/asignarReporte.php", {
            method: "POST",
            body: datos
        });

        const resultReporte = await responseReporte.json();

        if (resultReporte.success) {
            //alert(`Asiento actualizado a ${nuevoAsiento} y reporte asignado correctamente`);
            //window.location.reload();
            console.log(`Asiento actualizado a ${nuevoAsiento} y reporte asignado correctamente`)
        } else {
            throw new Error(resultReporte.error || "Error al asignar reporte");
        }

    } catch (error) {
        console.error("Error en actualizarAsientoYReporte:", error);
        alert(`Error: ${error.message || "Hubo un problema al actualizar los datos"}`);
        
        // Opcional: Revertir cambios si falla la segunda operación
        // Podrías implementar esta lógica si es importante para tu aplicación
    }
}
async function encontrarAsientoLibre(placa, asientoOriginal, asientosOcupados) {
    try {
        // Obtener todos los asientos del bus
        const busRes = await fetch(`php/common/getBus.php?placa=${encodeURIComponent(placa)}`);
        const busData = await busRes.json();
        
        // Filtrar solo asientos y obtener números
        const todosAsientos = busData
            .filter(item => item.tipo === 'asiento')
            .map(item => parseInt(item.numAs))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);
        
        if (todosAsientos.length === 0) {
            return null;
        }
        
        // Buscar asiento libre más cercano
        let distancia = 1;
        const maxAsiento = Math.max(...todosAsientos);
        
        while (distancia <= maxAsiento) {
            // Buscar hacia abajo (asientoOriginal - distancia)
            if (asientoOriginal - distancia >= todosAsientos[0]) {
                const asientoAbajo = asientoOriginal - distancia;
                if (todosAsientos.includes(asientoAbajo) && !asientosOcupados.includes(asientoAbajo)) {
                    return asientoAbajo;
                }
            }
            
            // Buscar hacia arriba (asientoOriginal + distancia)
            if (asientoOriginal + distancia <= todosAsientos[todosAsientos.length - 1]) {
                const asientoArriba = asientoOriginal + distancia;
                if (todosAsientos.includes(asientoArriba) && !asientosOcupados.includes(asientoArriba)) {
                    return asientoArriba;
                }
            }
            
            distancia++;
        }
        
        // No se encontró ningún asiento libre
        return null;
    } catch (error) {
        console.error("Error al buscar asiento libre:", error);
        return null;
    }
}


function asignarReporteDirecto(codP, codR) {
    const datos = new FormData();
    datos.append("codP", codP);
    datos.append("codR", codR);

    fetch("php/diario/asignarReporte.php", {
        method: "POST",
        body: datos
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            //alert("Reporte asignado correctamente");
            //window.location.reload();
            console.log(`Reporte asignado correctamente`);
        } else {
            alert("Error al asignar reporte.");
            console.error(result.error);
        }
    })
    .catch(error => {
        console.error("Error en la petición:", error);
        alert("Error al conectar con el servidor.");
    });
}

function printy(codP) {
    const fe = document.getElementById("fecha").textContent;
    const hr = document.getElementById("hora").textContent;
    const fecha = fe.split(" ")[2];
    const pasajeroDiv = document.getElementById(`pasajero-${codP}`);
    
    if (codP == 0) {
        // MANTENEMOS EXACTAMENTE IGUAL LA FUNCIONALIDAD PARA TICKETS VACÍOS
        const cantidad = prompt("¿Cuántos tickets vacíos deseas imprimir?", "1");
        
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
                <h3 id="dtP" class="cien big">De SC a: </h3>
            </div>
            <div>
                <h3 id="nmP" class="cien big">NOMBRE: </h3>
            </div>
            <div>
                <h3 class="ciPr big">CI/CEL: </h3>
            </div>
            <div>
                <h3 class="pl big">PLACA: </h3>
                <h3 class="ca big">CARRIL: 30</h3>
            </div>
            <div>
                <h3 id="fechaPrint" class="big">FECHA: ${fecha}</h3>
                <h3 id="hrP" class="big">HORA: </h3>
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

        document.getElementById('printP').style.display = 'block';
        document.getElementById("printP").innerHTML = '';
        
        for (let i = 0; i < numTickets; i++) {
            const ticketDiv = document.createElement('div');
            ticketDiv.innerHTML = ticketHTML;
            document.getElementById("printP").appendChild(ticketDiv);
            
            if (i < numTickets - 1) {
                const corte = document.createElement('div');
                corte.style.pageBreakAfter = 'always';
                document.getElementById("printP").appendChild(corte);
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
                document.getElementById('printP').style.display = 'none';
            }, 200);
        };
        img.onerror = function() {
            console.error("No se pudo cargar la imagen");
            window.print();
            document.getElementById('printP').style.display = 'none';
        };
    } else {
        // AQUÍ IMPLEMENTAMOS EL MODAL PARA TICKETS INDIVIDUALES
        if (!pasajeroDiv) {
            console.warn("Pasajero con codP no encontrado en el DOM.");
            return;
        }

        // Obtener datos del pasajero
        const asiento = pasajeroDiv.querySelector(".as").textContent;
        const nombre = pasajeroDiv.querySelector(".nm").textContent;
        const ci = pasajeroDiv.querySelector(".ci").textContent;
        const dest = pasajeroDiv.querySelector(".dt").textContent;
        const precio = pasajeroDiv.querySelector(".pr").textContent;

        // Mostrar modal de opciones
        showPrintOptionsModal({
            fecha: fecha,
            horaActual: hr,
            destino: dest,
            nombre: nombre,
            ci: ci,
            asiento: asiento,
            precio: precio,
            codP: codP
        });
    }
}

// Función para mostrar el modal de opciones de impresión
function showPrintOptionsModal(datosPasajero) {
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
        printIndividualTicket(datosPasajero, 'full');
    });
    
    document.getElementById('printPrice').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(datosPasajero, 'price');
    });
    
    document.getElementById('printTime').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(datosPasajero, 'time');
    });
    
    document.getElementById('printEmpty').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        printIndividualTicket(datosPasajero, 'empty');
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
function printIndividualTicket(datosPasajero, option) {
    const fe = document.getElementById("fecha").textContent;
    const fecha = fe.split(" ")[2];
    
    // Primero obtenemos el codR del pasajero y luego la hora del reporte
    fetch(`php/diario/getHoraReporte.php?codP=${datosPasajero.codP}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener datos del reporte");
            }
            return response.json();
        })
        .then(reporteData => {
            const horaReporte = reporteData.hora || '';
            
            // Ahora obtenemos el carril
            return fetch(`php/diario/getMarca.php?codP=${datosPasajero.codP}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error al obtener datos del pasajero");
                    }
                    return response.json();
                })
                .then(data => {
                    const carril = data.carril || "30";
                    const placa = data.placa || "";
                    
                    // Construir el HTML según la opción seleccionada
                    document.getElementById('printP').style.display = 'block';
                    document.getElementById("printP").innerHTML = `
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
                            <h3 id="dtP" class="cien">De SC a: ${datosPasajero.destino}</h3>
                        </div>
                        <div>
                            <h3 id="nmP" class="cien">NOMBRE: ${datosPasajero.nombre}</h3>
                        </div>
                        <div>
                            <h3 class="ciPr">CI/CEL: ${datosPasajero.ci}</h3>
                        </div>
                        <div>
                            <h3 class="pl">PLACA: ${placa}</h3>
                            <h3 class="ca">CARRIL: ${carril}</h3>
                        </div>
                        <div>
                            <h3 id="fechaPrint">FECHA: ${datosPasajero.fecha}</h3>
                            <h3 id="hrP">HORA: ${option === 'full' || option === 'time' ? horaReporte : ''}</h3>
                        </div> 
                        <div>
                            <h3 id="prP">PRECIO: ${option === 'full' || option === 'price' ? datosPasajero.precio : ''}</h3>
                            <h3 id="asP">ASIENTO: ${datosPasajero.asiento}</h3>
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

                    // Precargar imagen
                    const img = new Image();
                    img.src = 'img/logXXF.png';
                    img.onload = function() {
                        document.getElementById("imgPr2").src = img.src;
                        setTimeout(() => {
                            window.print();
                            document.getElementById('printP').style.display = 'none';
                        }, 200);
                    };
                    img.onerror = function() {
                        console.error("No se pudo cargar la imagen");
                        window.print();
                        document.getElementById('printP').style.display = 'none';
                    };
                });
        })
        .catch(error => {
            console.error("Error al obtener la hora del reporte:", error);
            
            // Mostrar ticket incluso si falla la obtención de la hora
            fetch(`php/diario/getMarca.php?codP=${datosPasajero.codP}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error al obtener datos del pasajero");
                    }
                    return response.json();
                })
                .then(data => {
                    const carril = data.carril || "30";
                    
                    document.getElementById('printP').style.display = 'block';
                    document.getElementById("printP").innerHTML = `
                    <div id="pasajeroPrintBody">
                        <img id="imgPr2" src="img/logXXF.png" alt="Logo">
                        <div>
                            <h3 id="dtP" class="cien">De SC a: ${datosPasajero.destino}</h3>
                        </div>
                        <div>
                            <h3 id="nmP" class="cien">NOMBRE: ${datosPasajero.nombre}</h3>
                        </div>
                        <div>
                            <h3 id="fechaPrint">FECHA: ${datosPasajero.fecha}</h3>
                            <h3 id="hrP">HORA: ${option === 'full' || option === 'time' ? '' : ''}</h3>
                        </div> 
                        <div>
                            <h3 class="ciPr">CI: ${datosPasajero.ci}</h3>
                            <h3 class="ca">CARRIL: ${carril}</h3>
                        </div>
                        <div>
                            <h3 id="asP">ASIENTO: ${datosPasajero.asiento}</h3>
                            <h3 id="prP">PRECIO: ${option === 'full' || option === 'price' ? datosPasajero.precio : ''}</h3>
                        </div>
                        <p class="emision">Emitido a las ${datosPasajero.horaActual}</p>
                        <h1 id="bv">¡¡BUEN VIAJE!!</h1>
                        <p id="msj">ANTES DE ABORDAR CAMBIAR POR FACTURA<br>
                            Este operador se encuentra bajo regulación y fiscalización de telecomunicaciones y transporte. 
                            No se aceptan devoluciones.<br>Este boleto constituye como reserva de pasaje<br>
                            No valido para credito fiscal.
                        </p>
                    </div>
                    `;
                    
                    const img = new Image();
                    img.src = 'img/logXXF.png';
                    img.onload = function() {
                        document.getElementById("imgPr2").src = img.src;
                        setTimeout(() => {
                            window.print();
                            document.getElementById('printP').style.display = 'none';
                        }, 200);
                    };
                    img.onerror = function() {
                        console.error("No se pudo cargar la imagen");
                        window.print();
                        document.getElementById('printP').style.display = 'none';
                    };
                })
                .catch(error => {
                    console.error("Error al obtener el carril:", error);
                    
                    // Mostrar ticket con carril por defecto si falla todo
                    document.getElementById('printP').style.display = 'block';
                    document.getElementById("printP").innerHTML = `
                    <div id="pasajeroPrintBody">
                        <img id="imgPr2" src="img/logXXF.png" alt="Logo">
                        <div>
                            <h3 id="dtP" class="cien">De SC a: ${datosPasajero.destino}</h3>
                        </div>
                        <div>
                            <h3 id="nmP" class="cien">NOMBRE: ${datosPasajero.nombre}</h3>
                        </div>
                        <div>
                            <h3 id="fechaPrint">FECHA: ${datosPasajero.fecha}</h3>
                            <h3 id="hrP">HORA: ${option === 'full' || option === 'time' ? '' : ''}</h3>
                        </div> 
                        <div>
                            <h3 class="ciPr">CI: ${datosPasajero.ci}</h3>
                            <h3 class="ca">CARRIL: 30</h3>
                        </div>
                        <div>
                            <h3 id="asP">ASIENTO: ${datosPasajero.asiento}</h3>
                            <h3 id="prP">PRECIO: ${option === 'full' || option === 'price' ? datosPasajero.precio : ''}</h3>
                        </div>
                        <p class="emision">Emitido a las ${datosPasajero.horaActual}</p>
                        <h1 id="bv">¡¡BUEN VIAJE!!</h1>
                        <p id="msj">ANTES DE ABORDAR CAMBIAR POR FACTURA<br>
                            Este operador se encuentra bajo regulación y fiscalización de telecomunicaciones y transporte. 
                            No se aceptan devoluciones.<br>Este boleto constituye como reserva de pasaje<br>
                            No valido para credito fiscal.
                        </p>
                    </div>
                    `;
                    
                    const img = new Image();
                    img.src = 'img/logXXF.png';
                    img.onload = function() {
                        document.getElementById("imgPr2").src = img.src;
                        setTimeout(() => {
                            window.print();
                            document.getElementById('printP').style.display = 'none';
                        }, 200);
                    };
                    img.onerror = function() {
                        console.error("No se pudo cargar la imagen");
                        window.print();
                        document.getElementById('printP').style.display = 'none';
                    };
                });
        });
}