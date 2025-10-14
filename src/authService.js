export const AUTH_TOKEN_KEY = 'auth_token';

function safeDecodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

export const authService = {
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token) => localStorage.setItem(AUTH_TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(AUTH_TOKEN_KEY),
  isTokenValid: (token) => {
    if (!token) return false;
    const payload = safeDecodeJwt(token);
    return payload?.exp ? payload.exp * 1000 > Date.now() : false;
  },
};


