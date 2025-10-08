import { fetchUtils } from 'react-admin';

const localStorageTokenKey = 'authToken';

const apiUrl = 'http://localhost:8080';

const authProvider = {
    // Called when the user attempts to log in
    login: async ({ username, password }) => {
        const request = new Request(`${apiUrl}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        const response = await fetchUtils.fetchJson(request);
        const { token } = response.json;
        if (!token) {
            return Promise.reject(new Error('No token received'));
        }
        localStorage.setItem(localStorageTokenKey, token);
        return Promise.resolve();
    },

    // Called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem(localStorageTokenKey);
        return Promise.resolve();
    },

    // Called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem(localStorageTokenKey);
            return Promise.reject();
        }
        return Promise.resolve();
    },

    // Called when the user navigates, to check for authentication
    checkAuth: () => {
        return localStorage.getItem(localStorageTokenKey)
            ? Promise.resolve()
            : Promise.reject();
    },

    // Optional: get user permissions/roles
    getPermissions: () => Promise.resolve(),

    // Optional: get identity for useGetIdentity
    getIdentity: async () => {
        const token = localStorage.getItem(localStorageTokenKey);
        if (!token) return Promise.reject();
        try {
            const response = await fetchUtils.fetchJson(`${apiUrl}/auth/me`, {
                user: { authenticated: true, token: `Bearer ${token}` },
            });
            const user = response.json;
            return Promise.resolve({ id: user.id, fullName: user.fullName || user.name || user.email });
        } catch (e) {
            return Promise.reject();
        }
    },
};

export default authProvider;


