const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_KEY');
}

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${SUPABASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
}

export async function getDestinos(sucursal = 1) {
    const params = new URLSearchParams({
        sucursal: `eq.${sucursal}`,
        select: '*'
    });
    return apiRequest(`/destinos?${params}`);
}

export async function getEncomiendas(sucursal = 1, registrador = null) {
    const params = new URLSearchParams({
        select: '*',
        order: 'fecha.desc'
    });
    if (registrador) {
        params.append('registrador', `eq.${registrador}`);
    }
    return apiRequest(`/encomiendas_mobile?${params}`);
}

export async function createEncomienda(data) {
    const payload = {
        remitente: data.remitente,
        remtelf: data.remtelf,
        consignatario: data.consignatario,
        contelf: data.contelf,
        primer_tramo: data.primer_tramo,
        segundo_tramo: data.segundo_tramo,
        total: data.total,
        bulto: data.bulto,
        valdeclarado: data.valdeclarado,
        destino: data.destino,
        sucursal: data.sucursal,
        estadopaga: data.estadopaga,
        tipo_pago: data.tipo_pago,
        registrador: data.registrador,
        fecha: data.fecha
    };
    return apiRequest('/encomiendas_mobile', 'POST', payload);
}

export async function loginUsuario(nombre, contraseña) {
    const params = new URLSearchParams({
        nombre: `eq.${nombre}`,
        contraseña: `eq.${contraseña}`,
        select: '*'
    });
    const result = await apiRequest(`/usuarios?${params}`);
    if (result.length === 0) {
        throw new Error('Usuario o contraseña incorrectos');
    }
    return result[0];
}

export async function cambiarContrasena(idUsuario, nuevaContraseña) {
    await apiRequest(`/usuarios?id_usuario=eq.${idUsuario}`, 'PATCH', {
        contraseña: nuevaContraseña,
        cambio_contra: true
    });

    const userParams = new URLSearchParams({
        id_usuario: `eq.${idUsuario}`,
        select: '*'
    });
    const result = await apiRequest(`/usuarios?${userParams}`);
    if (result.length === 0) {
        throw new Error('No se pudo obtener el usuario actualizado');
    }
    return result[0];
}
