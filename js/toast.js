export function showToast({ type = "loading", title = "", description = "", duration } = {}) {
    const viewport = document.getElementById("toastViewport");
    if (!viewport) return null;

    const icons = {
        loading: `<span class="spinner"></span>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M15 9l-6 6"></path><path d="m9 9 6 6"></path></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`
    };

    const durations = { loading: 0, success: 30000, error: 30000, info: 30000 };
    const maxToasts = 4;

    let toastIdCounter = window._toastIdCounter || 0;
    window._toastIdCounter = toastIdCounter;

    const visible = viewport.querySelectorAll(".toast:not(.is-leaving)");
    if (visible.length >= maxToasts) {
        removeToastById(visible[0].dataset.toastId);
    }

    const id = String(++window._toastIdCounter);

    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.dataset.toastId = id;
    el.innerHTML = `
        <div class="toast-icon">${icons[type] || ""}</div>
        <div class="toast-content">
            <span class="toast-title">${escapeHtml(title)}</span>
            ${description ? `<span class="toast-desc">${escapeHtml(description)}</span>` : ""}
        </div>
        <button type="button" class="toast-close" aria-label="Cerrar toast">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
        </button>
    `;

    el.querySelector(".toast-close").addEventListener("click", () => removeToastById(id));

    viewport.appendChild(el);
    void el.offsetWidth;
    el.classList.add("is-visible");

    const time = duration === undefined ? durations[type] : duration;
    if (time > 0) {
        const timer = setTimeout(() => removeToastById(id), time);
        if (!window._toastTimers) window._toastTimers = new Map();
        window._toastTimers.set(id, timer);
    }

    return id;
}

export function updateToast(id, options) {
    const viewport = document.getElementById("toastViewport");
    if (!viewport) return id;
    const el = viewport.querySelector(`[data-toast-id="${id}"]`);
    if (!el) return id;

    const type = options.type || "loading";
    const icons = {
        loading: `<span class="spinner"></span>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M15 9l-6 6"></path><path d="m9 9 6 6"></path></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`
    };
    const durations = { loading: 0, success: 30000, error: 30000, info: 30000 };

    el.classList.remove("toast-loading", "toast-success", "toast-error", "toast-info");
    el.classList.add(`toast-${type}`);
    el.querySelector(".toast-icon").innerHTML = icons[type] || "";

    if (options.title !== undefined) {
        el.querySelector(".toast-title").textContent = options.title;
    }
    if (options.description !== undefined) {
        const desc = el.querySelector(".toast-desc");
        if (desc) {
            desc.textContent = options.description;
        } else if (options.description) {
            const span = document.createElement("span");
            span.className = "toast-desc";
            span.textContent = options.description;
            el.querySelector(".toast-content").appendChild(span);
        }
    }

    if (!window._toastTimers) window._toastTimers = new Map();
    clearTimeout(window._toastTimers.get(id));
    window._toastTimers.delete(id);

    const time = options.duration === undefined ? durations[type] : options.duration;
    if (time > 0) {
        window._toastTimers.set(id, setTimeout(() => removeToastById(id), time));
    }

    return id;
}

function removeToastById(id) {
    const viewport = document.getElementById("toastViewport");
    if (!viewport) return;
    const el = viewport.querySelector(`[data-toast-id="${id}"]`);
    if (!el || el.classList.contains("is-leaving")) return;

    if (window._toastTimers) {
        clearTimeout(window._toastTimers.get(id));
        window._toastTimers.delete(id);
    }

    el.classList.add("is-leaving");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 500);
}

export function toastPromise(promise, messages = {}) {
    const loading = messages.loading || {};
    const id = showToast({
        type: "loading",
        title: loading.title || "Cargando…",
        description: loading.description || "",
    });

    promise.then((data) => {
        const success = typeof messages.success === "function" ? messages.success(data) : messages.success;
        updateToast(id, {
            type: "success",
            title: (success && success.title) || "Completado",
            description: (success && success.description) || "",
        });
    }).catch((error) => {
        const fail = typeof messages.error === "function" ? messages.error(error) : messages.error;
        updateToast(id, {
            type: "error",
            title: (fail && fail.title) || "Error",
            description: (fail && fail.description) || (error && error.message) || "",
        });
    });

    return id;
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => {
        const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return entities[char];
    });
}