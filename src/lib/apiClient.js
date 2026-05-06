const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost/ipd-backend/api';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return {
    success: response.ok,
    message: text || (response.ok ? 'Request completed successfully.' : 'Request failed.'),
    data: null,
  };
}

export async function postJson(path, payload) {
  const normalizedPath = path.replace(/^\/+/, '');
  const response = await fetch(`${API_BASE_URL}/${normalizedPath}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await parseResponse(response);

  if (!response.ok || result.success === false) {
    const error = new Error(result.message || 'Request failed.');
    error.payload = result;
    throw error;
  }

  return result;
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
