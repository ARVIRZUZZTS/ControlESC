/* Si ya hay sesion activa, se entra directo al menu */
try {
    const resSesion = await fetch("php/api/auth/sesion/route.php");
    const sesion = await resSesion.json();
    if (sesion.logueado) {
        window.location.replace("menu.html");
    }
} catch (e) { /* sigue al formulario */ }

const usuarioInp = document.getElementById("loginUsuario");
const contraInp = document.getElementById("loginContra");
const recordarInp = document.getElementById("loginRecordar");
const errorDiv = document.getElementById("loginError");
const btn = document.getElementById("loginBtn");

/* Recordar usuario: solo el nombre; la contrasena siempre arranca vacia */
if (localStorage.getItem("loginUsuario")) {
    usuarioInp.value = localStorage.getItem("loginUsuario");
    recordarInp.checked = true;
}

function mostrarError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.add("visible");
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = usuarioInp.value.trim();
    const contrasena = contraInp.value;

    if (!nombre || !contrasena) {
        mostrarError("Ingresa usuario y contrasena.");
        return;
    }

    errorDiv.classList.remove("visible");
    btn.disabled = true;
    btn.textContent = "INGRESANDO...";

    try {
        const res = await fetch("php/api/auth/login/route.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, contrasena })
        });
        const result = await res.json();

        if (result.status === "success") {
            if (recordarInp.checked) {
                localStorage.setItem("loginUsuario", nombre);
            } else {
                localStorage.removeItem("loginUsuario");
            }
            window.location.href = "menu.html";
        } else {
            mostrarError(result.message || "No se pudo iniciar sesion.");
            btn.disabled = false;
            btn.textContent = "INGRESAR";
        }
    } catch (error) {
        mostrarError("Error de conexion. Verifica que el servidor este corriendo.");
        btn.disabled = false;
        btn.textContent = "INGRESAR";
    }
});