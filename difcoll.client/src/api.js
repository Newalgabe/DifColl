export const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = (url, options) => fetch(`${API_BASE}${url}`, options);
