import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

const localStorageTokenKey = 'authToken';

const httpClient = (url, options = {}) => {
    const opts = { ...options };
    if (!opts.headers) {
        opts.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem(localStorageTokenKey);
    if (token) {
        opts.headers.set('Authorization', `Bearer ${token}`);
    }
    return fetchUtils.fetchJson(url, opts);
};

const dataProvider = simpleRestProvider('http://localhost:8080', httpClient);
export default dataProvider;