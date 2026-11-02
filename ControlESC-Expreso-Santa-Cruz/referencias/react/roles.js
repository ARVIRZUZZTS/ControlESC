export const MODULOS = [
    {
        id: 'encomienda',
        label: 'Nueva Encomienda',
        icon: '📦',
        path: '/encomienda',
        roles: ['encomiendas']
    },
    {
        id: 'historial',
        label: 'Historial',
        icon: '📋',
        path: '/historial',
        roles: ['encomiendas']
    },
    {
        id: 'perfil',
        label: 'Mi Perfil',
        icon: '👤',
        path: '/perfil',
        roles: ['*']
    }
];

export function modulosPorRol(rol) {
    if (!rol) return MODULOS.filter(m => m.roles.includes('*'));
    return MODULOS.filter(m => m.roles.includes('*') || m.roles.includes(rol));
}

export function tieneAcceso(rol, moduloId) {
    const modulo = MODULOS.find(m => m.id === moduloId);
    if (!modulo) return false;
    return modulo.roles.includes('*') || modulo.roles.includes(rol);
}

export function rutaHome(rol) {
    const modulos = modulosPorRol(rol);
    if (modulos.length > 0) return modulos[0].path;
    return '/perfil';
}

export const ROLES_CONOCIDOS = [
    'encomiendas',
    'Boletero',
    'admin',
    'Chofer Principal',
    'Chofer Auxiliar'
];
