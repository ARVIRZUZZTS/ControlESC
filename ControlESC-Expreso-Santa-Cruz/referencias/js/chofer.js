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

function mostrarForm(nombre) {
    document.getElementById('formFlota').style.display = 'flex';
    document.getElementById('lista').style.display = 'none';

    if (nombre) {
        document.getElementById('formTitle').textContent = 'EDITAR CHOFER';
        fetch(`php/chofer/getChofer.php?nombre=${encodeURIComponent(nombre)}`)
            .then(r => r.json())
            .then(data => {
                if (data) {
                    document.getElementById('editOriginal').value = data.nombre_chofer;
                    document.getElementById('nombre_chofer').value = data.nombre_chofer;
                    document.getElementById('licencia').value = data.licencia || '';
                }
            });
    } else {
        document.getElementById('formTitle').textContent = 'NUEVO CHOFER';
        document.getElementById('editOriginal').value = '';
        document.getElementById('nombre_chofer').value = '';
        document.getElementById('licencia').value = '';
    }
}

function cancelarForm() {
    document.getElementById('formFlota').style.display = 'none';
    document.getElementById('lista').style.display = 'block';
}

async function guardarChofer() {
    const nombre = document.getElementById('nombre_chofer').value.trim();
    if (!nombre) {
        alert('Ingrese un nombre');
        return;
    }

    const data = {
        nombre_chofer: nombre,
        licencia: document.getElementById('licencia').value.trim(),
        editOriginal: document.getElementById('editOriginal').value
    };

    try {
        const response = await fetch('php/chofer/saveChofer.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Chofer guardado correctamente');
            cancelarForm();
            cargarChoferes();
        } else {
            alert('Error: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
}

async function eliminarChofer(nombre) {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;

    try {
        const response = await fetch('php/chofer/eliminarChofer.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `nombre=${encodeURIComponent(nombre)}`
        });
        const result = await response.json();
        if (result.success) {
            alert('Chofer eliminado correctamente');
            cargarChoferes();
        } else {
            alert('Error: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
}

async function cargarChoferes() {
    try {
        const response = await fetch('php/chofer/getChofer.php');
        const choferes = await response.json();

        const lista = document.getElementById('lista');
        lista.innerHTML = '';
        lista.style.display = 'block';

        if (!choferes || choferes.length === 0) {
            lista.innerHTML = '<h2 style="text-align:center;color:#555;">NO HAY CHOFERES REGISTRADOS</h2>';
            return;
        }

        choferes.forEach(c => {
            const card = document.createElement('div');
            card.className = 'flota-card';

            const info = document.createElement('div');
            info.className = 'flota-info';

            const nombreDiv = document.createElement('div');
            nombreDiv.className = 'placa';
            nombreDiv.textContent = c.nombre_chofer;
            info.appendChild(nombreDiv);

            const detalle = document.createElement('div');
            detalle.className = 'detalle';
            let texto = '';
            if (c.licencia) texto += `Licencia: ${c.licencia}`;
            detalle.textContent = texto || 'Sin licencia';
            info.appendChild(detalle);

            const actions = document.createElement('div');
            actions.className = 'flota-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'editBtn';
            editBtn.textContent = 'EDITAR';
            editBtn.onclick = () => mostrarForm(c.nombre_chofer);
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'delBtn';
            delBtn.textContent = 'ELIMINAR';
            delBtn.onclick = () => eliminarChofer(c.nombre_chofer);
            actions.appendChild(delBtn);

            card.appendChild(info);
            card.appendChild(actions);
            lista.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar choferes:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarChoferes();
});
