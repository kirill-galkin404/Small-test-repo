import { API_URL } from '../config';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

let unauthorizedHandler = null;

// SessionProvider registers a callback here so a 401 can reset React state
// (RequireAuth then redirects to /login). Pass null to unregister.
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : null;
}

export function buildQuery(params) {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function request(method, path, { params, body } = {}) {
  const headers = { Accept: 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['X-Auth-Token'] = token;

  const init = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(API_URL + path + buildQuery(params), init);
  const data = await parseBody(res);

  if (res.ok) return data;

  if (res.status === 401) {
    clearStoredSession();
    if (unauthorizedHandler) unauthorizedHandler();
  }

  const serverMessage =
    data && typeof data === 'object' ? data.error || data.message : null;
  const err = new Error(serverMessage || `Request failed with status ${res.status}`);
  err.status = res.status;
  err.data = data;
  throw err;
}

export const get = (path, params) => request('GET', path, { params });
export const post = (path, body) => request('POST', path, { body });
export const put = (path, body) => request('PUT', path, { body });
export const del = (path) => request('DELETE', path);
