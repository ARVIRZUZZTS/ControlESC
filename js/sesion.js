export async function obtenerSesion() {
    try {
        const res = await fetch("php/api/auth/sesion/route.php");
        const data = await res.json();
        return data.logueado ? data.usuario : null;
    } catch (e) {
        return null;
    }
}

export async function verificarSesion() {
    return await obtenerSesion();
}

export async function cerrarSesion() {
    try {
        await fetch("php/api/auth/logout/route.php", { method: "POST" });
    } catch (e) { /* igual se cierra en el cliente */ }
    window.location.href = "login.html";
}
