const CACHE_KEY = 'encomiendas_cache';
const CACHE_TTL = 5 * 60 * 1000;

export function getCachedEncomiendas() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_TTL) {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }

    return data;
}

export function setCachedEncomiendas(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
}

export function clearEncomiendasCache() {
    localStorage.removeItem(CACHE_KEY);
}
