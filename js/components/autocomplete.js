export function autocompleteSeleccion({
    input,
    opciones = [],
    valorActual = "",
    placeholder = "",
    onCambio = null,
    modoBuscador = false,
    placeholderSiempre = false
} = {}) {

    if (!input) return null;

    let seleccionado = null;
    let tocado = false;

    const original = opciones.find(o => String(o.label) === String(valorActual));

    input.value = "";
    input.placeholder = valorActual || placeholder;
    input.setAttribute("autocomplete", "off");

    const wrap = document.createElement("div");
    wrap.className = "ac-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const lista = document.createElement("ul");
    lista.className = "ac-list";
    wrap.appendChild(lista);

    function posicionar() {
        if (lista.style.display === "none") return;
        const r = input.getBoundingClientRect();
        const espacioAbajo = window.innerHeight - r.bottom - 8;
        const altoEstimado = lista.offsetHeight || 200;
        lista.style.left = r.left + "px";
        lista.style.width = r.width + "px";
        if (espacioAbajo >= altoEstimado) {
            lista.style.top = (r.bottom + 4) + "px";
            lista.style.bottom = "auto";
        } else {
            lista.style.top = "auto";
            lista.style.bottom = (window.innerHeight - r.top + 4) + "px";
        }
    }

    function mostrar(opcionesMostrar) {
        lista.innerHTML = "";
        if (opcionesMostrar.length === 0) {
            lista.style.display = "none";
            return;
        }
        opcionesMostrar.forEach(op => {
            const li = document.createElement("li");
            li.className = "ac-item";
            li.textContent = op.label;
            li.addEventListener("mousedown", (e) => {
                e.preventDefault();
                seleccion(op);
            });
            lista.appendChild(li);
        });
        lista.style.display = "block";
        posicionar();
    }

    function seleccion(op) {
        seleccionado = op;
        tocado = true;
        input.value = op.label;
        lista.style.display = "none";
        if (onCambio) onCambio({ id: modoBuscador ? null : op.id, label: op.label, tocado: true });
    }

    function filtrar() {
        const texto = input.value.trim().toLowerCase();
        if (texto === "") {
            mostrar(opciones);
            return;
        }
        const filtradas = opciones.filter(op => op.label.toLowerCase().includes(texto));
        mostrar(filtradas);
    }

    input.addEventListener("focus", () => {
        const texto = input.value.trim();
        if (texto === "") {
            mostrar(opciones);
        } else {
            filtrar();
        }
    });

    input.addEventListener("input", () => {
        tocado = true;
        filtrar();
    });

    input.addEventListener("blur", () => {
        setTimeout(() => {
            lista.style.display = "none";
            if (onCambio) {
                if (input.value.trim() === "" ) {
                    const valorDefecto = original ? original.label : "";
                    if (!placeholderSiempre) {
                        input.value = valorDefecto;
                    }
                    onCambio({
                        id: original ? original.id : null,
                        label: original ? original.label : "",
                        tocado: false
                    });
                } else if (!seleccionado) {
                    onCambio({ id: null, label: input.value, tocado: true });
                }
            }
        }, 120);
    });

    input.addEventListener("keydown", (e) => {
        const items = Array.from(lista.querySelectorAll(".ac-item"));
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const currentIndex = items.findIndex(li => li.classList.contains("active"));
            let nextIndex = e.key === "ArrowDown" ? 0 : -1;
            if (currentIndex !== -1) {
                nextIndex = e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
            }
            items.forEach(li => li.classList.remove("active"));
            if (nextIndex >= 0 && nextIndex < items.length) {
                items[nextIndex].classList.add("active");
            }
        } else if (e.key === "Enter") {
            const active = lista.querySelector(".ac-item.active");
            if (active) {
                e.preventDefault();
                const op = opciones.find(o => o.label === active.textContent);
                if (op) seleccion(op);
            }
        } else if (e.key === "Escape") {
            lista.style.display = "none";
        }
    });

    document.addEventListener("mousedown", (e) => {
        if (!wrap.contains(e.target)) {
            lista.style.display = "none";
        }
    });

    window.addEventListener("scroll", posicionar, true);
    window.addEventListener("resize", posicionar);

    return {
        obtener: () => ({
            id: seleccionado ? seleccionado.id : (original ? original.id : null),
            label: input.value.trim(),
            tocado
        }),
        actualizarOpciones(nuevas) {
            opciones = nuevas;
        },
        input,
        lista
    };
}
