import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';
import { API_URL, AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY } from './config';

// Helper function to parse error messages from backend
function parseErrorMessage(error) {
    // Try to extract meaningful error message from backend response
    if (error.body && typeof error.body === 'object') {
        if (error.body.message) {
            return error.body.message;
        }
        if (error.body.error) {
            return error.body.error;
        }
        if (error.body.details) {
            return error.body.details;
        }
    }
    
    // If error has a message property, use it
    if (error.message) {
        return error.message;
    }
    
    // Default fallback
    return 'An unexpected error occurred';
}

// Helper function to create user-friendly error messages
function createErrorMessage(error, operation = 'access') {
    const status = error.status;
    const parsedMessage = parseErrorMessage(error);
    const isRu = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language.toLowerCase().startsWith('ru') : false;
    
    // Handle specific error cases
    if (status === 403) {
        if (isRu) {
            return `Доступ запрещён: У вас нет прав на ${operation === 'view' ? 'просмотр' : operation === 'create' ? 'создание' : operation === 'update' ? 'изменение' : 'выполнение операции'} уроков. Свяжитесь с администратором.`;
        }
        return `Access denied: You do not have permission to ${operation} lessons. ${parsedMessage.includes('Access denied') ? '' : 'Please contact your administrator.'}`;
    } else if (status === 401) {
        if (isRu) {
            return `Ошибка аутентификации: Сессия истекла. Пожалуйста, войдите снова.`;
        }
        return `Authentication failed: Your session has expired. Please log in again.`;
    } else if (status === 500) {
        if (isRu) {
            const mapped = parsedMessage && /access denied/i.test(parsedMessage) ? 'Доступ запрещён' : 'Произошла внутренняя ошибка сервера';
            return `Ошибка сервера: ${mapped}. Пожалуйста, попробуйте позже или обратитесь в поддержку.`;
        }
        return `Server error: The server encountered an internal error. ${parsedMessage}. Please try again later or contact support.`;
    } else if (status === 404) {
        if (isRu) {
            return `Не найдено: Запрашиваемый ресурс не найден. ${parsedMessage || ''}`.trim();
        }
        return `Not found: The requested resource was not found. ${parsedMessage}`;
    } else if (status >= 400 && status < 500) {
        if (isRu) {
            return `Ошибка клиента (${status}): ${parsedMessage}. Проверьте запрос и повторите попытку.`;
        }
        return `Client error (${status}): ${parsedMessage}. Please check your request and try again.`;
    } else if (status >= 500) {
        if (isRu) {
            return `Ошибка сервера (${status}): ${parsedMessage}. Пожалуйста, попробуйте позже или обратитесь в поддержку.`;
        }
        return `Server error (${status}): ${parsedMessage}. Please try again later or contact support.`;
    }
    
    return parsedMessage;
}

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
        // console.log('Headers:', Object.fromEntries(opts.headers.entries()));
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

// Helpers to translate between backend DTO and react-admin shape for lessons
const mapLessonFromServer = (record) => {
    if (!record) return record;
    const mapped = { ...record };
    if (record.lessonId != null) mapped.id = record.lessonId;
    return mapped;
};

const mapLessonToServer = (data) => {
    if (!data) return data;
    const mapped = { ...data };
    if (data.id != null) mapped.lessonId = data.id;
    // Ensure numbers are numbers if provided as strings
    if (mapped.durationMinutes != null) mapped.durationMinutes = Number(mapped.durationMinutes);
    if (mapped.price != null) mapped.price = Number(mapped.price);
    return mapped;
};

// Students mapping
const mapStudentFromServer = (record) => {
    if (!record) return record;
    const mapped = { ...record };
    if (record.studentId != null) mapped.id = record.studentId;
    return mapped;
};

const mapStudentToServer = (data) => {
    if (!data) return data;
    const mapped = { ...data };
    if (data.id != null) mapped.studentId = data.id;
    if (mapped.grade != null) mapped.grade = Number(mapped.grade);
    return mapped;
};

// Teachers mapping
const mapTeacherFromServer = (record) => {
    if (!record) return record;
    const mapped = { ...record };
    if (record.id != null) mapped.id = record.id;
    return mapped;
};

const mapTeacherToServer = (data) => {
    if (!data) return data;
    const mapped = { ...data };
    if (data.id != null) mapped.id = data.id;
    return mapped;
};

const dataProvider = {
    ...baseDataProvider,
    // Custom endpoint helpers
    getStudentsByTeacher: async (teacherId) => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            // console.log(`Fetching students for teacher ${teacherId} from: ${API_URL}/teachers/${teacherId}/students`);
            const resp = await fetchUtils.fetchJson(`${API_URL}/teachers/${teacherId}/students`, { headers });
            
            const body = resp.json || [];
            
            const items = Array.isArray(body) ? body : (body?.data || []);
           
            const mapped = items.map(mapStudentFromServer);
            
            return mapped;
        } catch (error) {
            console.error('Error in getStudentsByTeacher:', error);
            const errorMessage = createErrorMessage(error, 'view');
            throw new Error(errorMessage);
        }
    },

  // Fetch teacher by auth userId via backend: GET /teachers/by-user/{userId}
  getTeacherByUserId: async (userId) => {
    const headers = new Headers({ Accept: 'application/json' });
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    try {
      const url = `${API_URL}/teachers/by-user/${userId}`;
      const resp = await fetchUtils.fetchJson(url, { headers });
      const body = resp.json || {};
      // Normalize to our teacher entity shape if needed
      return body;
    } catch (error) {
      console.error('Error in getTeacherByUserId:', error);
      const errorMessage = createErrorMessage(error, 'view');
      throw new Error(errorMessage);
    }
  },

  // Fetch student by auth userId via backend: GET /students/by-user/{userId}
  getStudentByUserId: async (userId) => {
    const headers = new Headers({ Accept: 'application/json' });
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    try {
      const url = `${API_URL}/students/by-user/${userId}`;
      const resp = await fetchUtils.fetchJson(url, { headers });
      const body = resp.json || {};
      return body;
    } catch (error) {
      console.error('Error in getStudentByUserId:', error);
      const errorMessage = createErrorMessage(error, 'view');
      throw new Error(errorMessage);
    }
  },
    // Fallback when backend doesn't send Content-Range header
    getList: async (resource, params) => {
        try {
            // Map RA sort field `id` to backend-specific identifier fields
            let mappedParams = params;
            if (params && params.sort && params.sort.field === 'id') {
                const idFieldByResource = {
                    lessons: 'lessonId',
                    students: 'studentId',
                    teachers: 'teacherId',
                };
                const mappedField = idFieldByResource[resource];
                if (mappedField) {
                    mappedParams = {
                        ...params,
                        sort: { ...params.sort, field: mappedField },
                    };
                }
            }

            const res = await baseDataProvider.getList(resource, mappedParams);
            if (resource === 'lessons') {
                return { ...res, data: res.data.map(mapLessonFromServer) };
            }
            return res;
        } catch (error) {
            // If missing Content-Range, fallback to client-side pagination/sorting
            const message = error?.message || '';
            const isMissingContentRange = message.includes('Content-Range header is missing');
            if (!isMissingContentRange) {
                const errorMessage = createErrorMessage(error, 'view');
                throw new Error(errorMessage);
            }

            const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
            const rawSort = params.sort || { field: 'id', order: 'ASC' };
            const idFieldByResource = { lessons: 'lessonId', students: 'studentId', teachers: 'teacherId' };
            const mappedSortField = rawSort.field === 'id' ? (idFieldByResource[resource] || rawSort.field) : rawSort.field;
            const sortOrder = rawSort.order || 'ASC';

            const headers = new Headers({ Accept: 'application/json' });
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) headers.set('Authorization', `Bearer ${token}`);

            try {
                const pageZero = Math.max((page || 1) - 1, 0);
                const sortQuery = mappedSortField ? `&sort=${encodeURIComponent(`${mappedSortField},${sortOrder}`)}` : '';
                const url = `${API_URL}/${resource}?page=${pageZero}&size=${perPage || 25}${sortQuery}`;
                const resp = await fetchUtils.fetchJson(url, { headers });

                // Try PageResponseDto shape first
                const body = resp.json || {};
                if (Array.isArray(body.content) && typeof body.totalElements === 'number') {
                    let items = body.content;
                    if (resource === 'lessons') {
                        items = items.map(mapLessonFromServer);
                    } else if (resource === 'students') {
                        items = items.map(mapStudentFromServer);
                    } else if (resource === 'teachers') {
                        items = items.map(mapTeacherFromServer);
                    }
                    return { data: items, total: body.totalElements };
                }

                // Fallback to array or { data: [] } shape
                let items = Array.isArray(body) ? body : (body?.data || []);
                if (resource === 'lessons') {
                    items = items.map(mapLessonFromServer);
                } else if (resource === 'students') {
                    items = items.map(mapStudentFromServer);
                } else if (resource === 'teachers') {
                    items = items.map(mapTeacherFromServer);
                }

                // If server returned whole collection without total, compute client-side pagination
                const total = items.length;
                const start = (page - 1) * (perPage || 25);
                const end = page * (perPage || 25);
                const pageItems = items.slice(start, end);
                return { data: pageItems, total };
            } catch (fallbackError) {
                const fallbackErrorMessage = createErrorMessage(fallbackError, 'view');
                throw new Error(fallbackErrorMessage);
            }
        }
    },
    getOne: async (resource, params) => {
        try {
            const res = await baseDataProvider.getOne(resource, params);
            if (resource === 'lessons') {
                return { ...res, data: mapLessonFromServer(res.data) };
            } else if (resource === 'students') {
                return { ...res, data: mapStudentFromServer(res.data) };
            } else if (resource === 'teachers') {
                return { ...res, data: mapTeacherFromServer(res.data) };
            }
            return res;
        } catch (error) {
            const errorMessage = createErrorMessage(error, 'view');
            throw new Error(errorMessage);
        }
    },
    update: async (resource, params) => {
        try {
            if (resource === 'lessons') {
                const res = await baseDataProvider.update(resource, {
                    ...params,
                    data: mapLessonToServer(params.data),
                });
                return { ...res, data: mapLessonFromServer(res.data) };
            } else if (resource === 'students') {
                const res = await baseDataProvider.update(resource, {
                    ...params,
                    data: mapStudentToServer(params.data),
                });
                return { ...res, data: mapStudentFromServer(res.data) };
            } else if (resource === 'teachers') {
                const res = await baseDataProvider.update(resource, {
                    ...params,
                    data: mapTeacherToServer(params.data),
                });
                return { ...res, data: mapTeacherFromServer(res.data) };
            }
            return baseDataProvider.update(resource, params);
        } catch (error) {
            const errorMessage = createErrorMessage(error, 'update');
            throw new Error(errorMessage);
        }
    },
    create: async (resource, params) => {
        try {
            if (resource === 'lessons') {
                const res = await baseDataProvider.create(resource, {
                    ...params,
                    data: mapLessonToServer(params.data),
                });
                return { ...res, data: mapLessonFromServer(res.data) };
            } else if (resource === 'students') {
                const res = await baseDataProvider.create(resource, {
                    ...params,
                    data: mapStudentToServer(params.data),
                });
                return { ...res, data: mapStudentFromServer(res.data) };
            } else if (resource === 'teachers') {
                const res = await baseDataProvider.create(resource, {
                    ...params,
                    data: mapTeacherToServer(params.data),
                });
                return { ...res, data: mapTeacherFromServer(res.data) };
            }
            return baseDataProvider.create(resource, params);
        } catch (error) {
            const errorMessage = createErrorMessage(error, 'create');
            throw new Error(errorMessage);
        }
    },

    // Lesson status management methods
    startLesson: async (lessonId) => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            const url = `${API_URL}/lessons/${lessonId}/start`;
            const resp = await fetchUtils.fetchJson(url, { 
                method: 'PATCH',
                headers 
            });
            const body = resp.json || {};
            return body;
        } catch (error) {
            console.error('Error in startLesson:', error);
            const errorMessage = createErrorMessage(error, 'start lesson');
            throw new Error(errorMessage);
        }
    },

    completeLesson: async (lessonId) => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            const url = `${API_URL}/lessons/${lessonId}/complete`;
            const resp = await fetchUtils.fetchJson(url, { 
                method: 'PATCH',
                headers 
            });
            const body = resp.json || {};
            return body;
        } catch (error) {
            console.error('Error in completeLesson:', error);
            const errorMessage = createErrorMessage(error, 'complete lesson');
            throw new Error(errorMessage);
        }
    },

    cancelLesson: async (lessonId) => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            const url = `${API_URL}/lessons/${lessonId}/cancel`;
            const resp = await fetchUtils.fetchJson(url, { 
                method: 'PATCH',
                headers 
            });
            const body = resp.json || {};
            return body;
        } catch (error) {
            console.error('Error in cancelLesson:', error);
            const errorMessage = createErrorMessage(error, 'cancel lesson');
            throw new Error(errorMessage);
        }
    },

    // Get all lesson statuses
    getAllStatuses: async () => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            const url = `${API_URL}/lesson-statuses`;
            const resp = await fetchUtils.fetchJson(url, { headers });
            const body = resp.json || {};
            return body;
        } catch (error) {
            console.error('Error in getAllStatuses:', error);
            const errorMessage = createErrorMessage(error, 'get lesson statuses');
            throw new Error(errorMessage);
        }
    },

    // Get dashboard statistics
    getDashboardStats: async () => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            const url = `${API_URL}/dashboard/stats`;
            const resp = await fetchUtils.fetchJson(url, { headers });
            const body = resp.json || {};
            return body;
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            const errorMessage = createErrorMessage(error, 'get dashboard stats');
            throw new Error(errorMessage);
        }
    },

    // Get user by id
    getUserById: async (userId) => {
        const headers = new Headers({ Accept: 'application/json' });
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        try {
            const url = `${API_URL}/users/${userId}`;
            const resp = await fetchUtils.fetchJson(url, { headers });
            const body = resp.json || {};
            return body;
        } catch (error) {
            console.error('Error in getUserById:', error);
            const errorMessage = createErrorMessage(error, 'view user');
            throw new Error(errorMessage);
        }
    },
};

export default dataProvider;