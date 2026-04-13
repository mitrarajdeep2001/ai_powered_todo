const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const defaultHeaders = { 'Content-Type': 'application/json' };
const defaultOpts = { credentials: 'include' as RequestCredentials };

export const api = {
  get: (endpoint: string) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: defaultHeaders,
      ...defaultOpts,
    }),

  post: (endpoint: string, data: unknown) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
      ...defaultOpts,
    }),

  put: (endpoint: string, data: unknown) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
      ...defaultOpts,
    }),

  delete: (endpoint: string) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: defaultHeaders,
      ...defaultOpts,
    }),
};
