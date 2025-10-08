import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';
import { API_URL, AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY } from './config';

const httpClient = async (url, options = {}) => {
    const doFetch = async () => {
        const opts = { ...options };
        if (!opts.headers) {
            opts.headers = new Headers({ Accept: 'application/json' });
        }
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            opts.headers.set('Authorization', `Bearer ${token}`);
        }
        return fetchUtils.fetchJson(url, opts);
    };

    try {
        return await doFetch();
    } catch (error) {
        const status = error?.status ?? error?.response?.status;
        const bodyText = error?.body?.message || '';
        // if token expired -> try refresh
        if (status === 401 && (bodyText.includes('ExpiredJwtException') || true)) {
            const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
            if (!refreshToken) throw error;
            try {
                const refreshResp = await fetchUtils.fetchJson(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                    }),
                    body: JSON.stringify({ refreshToken }),
                });
                const { token: newToken, refreshToken: newRefresh } = refreshResp.json || {};
                if (!newToken) throw error;
                localStorage.setItem(AUTH_TOKEN_KEY, newToken);
                if (newRefresh) localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, newRefresh);
                // retry original request with new token
                return await doFetch();
            } catch (e) {
                // cleanup and rethrow to let authProvider handle logout if needed
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
                throw error;
            }
        }
        throw error;
    }
};

const baseDataProvider = simpleRestProvider(API_URL, httpClient);

const dataProvider = {
    ...baseDataProvider,
    // Fallback when backend doesn't send Content-Range header
    getList: async (resource, params) => {
        try {
            return await baseDataProvider.getList(resource, params);
        } catch (error) {
            // Fallback: fetch full list, then paginate/sort client-side
            const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
            const sort = params.sort || { field: 'id', order: 'ASC' };

            const headers = new Headers({ Accept: 'application/json' });
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) headers.set('Authorization', `Bearer ${token}`);

            const resp = await fetchUtils.fetchJson(`${API_URL}/${resource}`, { headers });
            let items = Array.isArray(resp.json) ? resp.json : (resp.json?.data || []);

            // sort client-side
            const { field, order } = sort;
            if (field) {
                items = items.slice().sort((a, b) => {
                    const av = a?.[field];
                    const bv = b?.[field];
                    if (av === bv) return 0;
                    if (av == null) return order === 'ASC' ? -1 : 1;
                    if (bv == null) return order === 'ASC' ? 1 : -1;
                    if (av > bv) return order === 'ASC' ? 1 : -1;
                    if (av < bv) return order === 'ASC' ? -1 : 1;
                    return 0;
                });
            }

            const total = items.length;
            const start = (page - 1) * perPage;
            const end = page * perPage;
            const pageItems = items.slice(start, end);
            return { data: pageItems, total };
        }
    },
};

export default dataProvider;