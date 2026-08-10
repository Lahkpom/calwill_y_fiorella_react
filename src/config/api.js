export const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
// TODO: Reemplazar con la URL real de tu backend cuando esté disponible.

const buildUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_API_URL}${normalizedPath}`;
};

const parseJsonResponse = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (err) {
        return `${err} - ${text}`;
    }
};

export const apiRequest = async (path, options = {}) => {
    const url   = buildUrl(path);
    const init  = {
        credentials : 'include', // TODO: Cambiar a 'omit' o 'same-origin' si tu backend no usa cookies.
        headers     : {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (init.body && typeof init.body !== 'string') init.body = JSON.stringify(init.body);

    const response  = await fetch(url, init);
    const data      = await parseJsonResponse(response);

    if (!response.ok) throw new Error(data?.error || data?.message || response.statusText || 'API request failed');

    return data;
};
