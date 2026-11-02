function actualizarFechaHora() {
    const ahora = new Date();
    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('fecha').textContent = ahora.toLocaleDateString('es-ES', opcionesFecha);
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-ES', opcionesHora);
}
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

function back() {
    window.location = "menu.html";
}

function mostrarForm(placa) {
    document.getElementById('formFlota').style.display = 'flex';
    document.getElementById('lista').style.display = 'none';

    if (placa) {
        document.getElementById('formTitle').textContent = 'EDITAR FLOTA';
        fetch(`php/flota/getFlota.php?placa=${encodeURIComponent(placa)}`)
            .then(r => r.json())
            .then(data => {
                if (data) {
                    document.getElementById('editOriginal').value = data.placa;
                    document.getElementById('placa').value = data.placa;
                    document.getElementById('propietario').value = data.propietario || '';
                    document.getElementById('marca').value = data.marca || '';
                    document.getElementById('conductor1').value = data.conductor1 || '';
                    document.getElementById('licencia1').value = data.licencia1 || '';
                    document.getElementById('conductor2').value = data.conductor2 || '';
                    document.getElementById('licencia2').value = data.licencia2 || '';
                    document.getElementById('nombre_planilla').value = data.nombre_planilla || '';
                }
            });
    } else {
        document.getElementById('formTitle').textContent = 'NUEVA FLOTA';
        document.getElementById('editOriginal').value = '';
        document.getElementById('placa').value = '';
        document.getElementById('propietario').value = '';
        document.getElementById('marca').value = '';
        document.getElementById('conductor1').value = '';
        document.getElementById('licencia1').value = '';
        document.getElementById('conductor2').value = '';
        document.getElementById('licencia2').value = '';
        document.getElementById('nombre_planilla').value = '';
        document.getElementById('placaError').textContent = '';
    }
}

function cancelarForm() {
    document.getElementById('formFlota').style.display = 'none';
    document.getElementById('lista').style.display = 'block';
}

let choferesMap = {};

function autocompletarLicencia(numero) {
    const nombre = document.getElementById(`conductor${numero}`).value.trim();
    const chofer = choferesMap[nombre];
    if (chofer) {
        document.getElementById(`licencia${numero}`).value = chofer.licencia || '';
    }
}

async function cargarChoferes() {
    try {
        const response = await fetch('php/chofer/getChofer.php');
        const choferes = await response.json();
        if (!Array.isArray(choferes)) return;

        const datalist = document.getElementById('listaChoferes');
        datalist.innerHTML = '';
        choferesMap = {};

        choferes.forEach(c => {
            const nombre = c.nombre_chofer;
            if (!nombre) return;
            choferesMap[nombre] = c;

            const option = document.createElement('option');
            option.value = nombre;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar choferes:', error);
    }
}

function validarPlaca() {
    const placa = document.getElementById('placa').value;
    const error = document.getElementById('placaError');
    if (placa.length === 8 && !/^\d{4}-[A-Z]{3}$/.test(placa)) {
        error.textContent = 'Formato inválido (ej: 1234-ABC)';
    } else {
        error.textContent = '';
    }
}

async function guardarFlota() {
    const placa = document.getElementById('placa').value.trim();
    if (!placa) {
        alert('Ingrese una placa');
        return;
    }
    if (!/^\d{4}-[A-Z]{3}$/.test(placa)) {
        alert('Formato de placa inválido. Debe ser 4 dígitos, guión, 3 letras (ej: 1234-ABC)');
        return;
    }

    const data = {
        placa: placa,
        propietario: document.getElementById('propietario').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        conductor1: document.getElementById('conductor1').value.trim(),
        licencia1: document.getElementById('licencia1').value.trim(),
        conductor2: document.getElementById('conductor2').value.trim(),
        licencia2: document.getElementById('licencia2').value.trim(),
        nombre_planilla: document.getElementById('nombre_planilla').value,
        editOriginal: document.getElementById('editOriginal').value
    };

    try {
        const response = await fetch('php/flota/saveFlota.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Flota guardada correctamente');
            cancelarForm();
            cargarFlotas();
        } else {
            alert('Error: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
}

async function eliminarFlota(placa) {
    if (!confirm(`¿Estás seguro de eliminar la flota ${placa}?`)) return;

    try {
        const response = await fetch('php/flota/eliminarFlota.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `placa=${encodeURIComponent(placa)}`
        });
        const result = await response.json();
        if (result.success) {
            alert('Flota eliminada correctamente');
            cargarFlotas();
        } else {
            alert('Error: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
}

async function cargarFlotas() {
    try {
        const response = await fetch('php/flota/getFlota.php');
        const flotas = await response.json();

        const lista = document.getElementById('lista');
        lista.innerHTML = '';
        lista.style.display = 'block';

        if (!flotas || flotas.length === 0) {
            lista.innerHTML = '<h2 style="text-align:center;color:#555;">NO HAY FLOTAS REGISTRADAS</h2>';
            return;
        }

        flotas.forEach(f => {
            const card = document.createElement('div');
            card.className = 'flota-card';

            const info = document.createElement('div');
            info.className = 'flota-info';

            const placaDiv = document.createElement('div');
            placaDiv.className = 'placa';
            placaDiv.textContent = f.placa;
            info.appendChild(placaDiv);

            const detalle = document.createElement('div');
            detalle.className = 'detalle';
            let texto = '';
            if (f.propietario) texto += `Dueño: ${f.propietario}`;
            if (f.marca) texto += (texto ? ' | ' : '') + `Marca: ${f.marca}`;
            if (f.conductor1) texto += (texto ? ' | ' : '') + `Cond1: ${f.conductor1}`;
            if (f.conductor2) texto += (texto ? ' | ' : '') + `Cond2: ${f.conductor2}`;
            if (f.nombre_planilla) texto += (texto ? ' | ' : '') + `Planilla: ${f.nombre_planilla}`;
            detalle.textContent = texto || 'Sin datos';
            info.appendChild(detalle);

            const actions = document.createElement('div');
            actions.className = 'flota-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'editBtn';
            editBtn.textContent = 'EDITAR';
            editBtn.onclick = () => mostrarForm(f.placa);
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'delBtn';
            delBtn.textContent = 'ELIMINAR';
            delBtn.onclick = () => eliminarFlota(f.placa);
            actions.appendChild(delBtn);

            card.appendChild(info);
            card.appendChild(actions);
            lista.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar flotas:', error);
    }
}

async function cargarPlanillas() {
    try {
        const response = await fetch('php/common/getList.php');
        const data = await response.json();
        const select = document.getElementById('nombre_planilla');
        const nombresVistos = new Set();

        if (data.planillasCompletas) {
            data.planillasCompletas.forEach(p => {
                if (nombresVistos.has(p.nombre)) return;
                nombresVistos.add(p.nombre);
                const option = document.createElement('option');
                option.value = p.nombre;
                option.textContent = p.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar planillas:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarFlotas();
    cargarPlanillas();
    cargarChoferes();
});
