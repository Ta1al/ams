// Minimal fetch wrapper for Node 18+
// Usage: const { request } = require('./httpClient');

const buildUrl = (baseUrl, path) => {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};

const request = async ({
  baseUrl,
  path,
  method = 'GET',
  token,
  json,
}) => {
  const url = buildUrl(baseUrl, path);

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: json ? JSON.stringify(json) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data && data.message ? data.message : `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

module.exports = { request };
