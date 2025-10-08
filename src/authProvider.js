import { fetchUtils } from 'react-admin';
import { API_URL, AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY } from './config';

function decodeJwtPayload(token) {
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

const authProvider = {
    // Called when the user attempts to log in
    login: async ({ username, password }) => {
        const response = await fetchUtils.fetchJson(`${API_URL}/auth/sign-in`, {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }),
        });
        const { token, refreshToken } = response.json;
        if (!token) {
            return Promise.reject(new Error('No token received'));
        }
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        if (refreshToken) {
            localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
        }
        return Promise.resolve();
    },

    // Called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
        return Promise.resolve();
    },

    // Called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
            return Promise.reject();
        }
        return Promise.resolve();
    },

    // Called when the user navigates, to check for authentication
    checkAuth: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY)
            ? Promise.resolve()
            : Promise.reject();
    },

    // Optional: get user permissions/roles
    getPermissions: () => Promise.resolve(),

    // Optional: get identity for useGetIdentity (no network call)
    getIdentity: async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return Promise.reject();
        const payload = decodeJwtPayload(token);
        const id = payload?.sub || payload?.id || 'me';
        const fullName = payload?.name || payload?.fullName || payload?.email || 'User';
        return Promise.resolve({ id, fullName });
    },
};

export default authProvider;


