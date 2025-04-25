<<<<<<< HEAD
=======
// api.js - Service de communication avec l'API backend
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
<<<<<<< HEAD
  if (!token) {
    console.warn('⚠️ Aucun token trouvé dans le localStorage.');
  } else {
    console.log('🔐 Token utilisé dans les headers');
  }
=======
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
<<<<<<< HEAD
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };
=======
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  const config = { ...options, headers };
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d

  if (!options.skipJson && config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  try {
<<<<<<< HEAD
    console.log(`📡 [API REQUEST] ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [${response.status}] ${url}`, data);
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    console.error(`❌ Erreur API sur ${url}:`, error);
=======
    const response = await fetch(url, config);
    if (response.status === 204) return { success: true };
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Une erreur est survenue');
    return data;
  } catch (error) {
    console.error(`Erreur API: ${url}`, error);
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
    throw error;
  }
}

const api = {
  auth: {
<<<<<<< HEAD
    register: (userData) =>
      apiRequest('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) =>
      apiRequest('/auth/login', { method: 'POST', body: credentials }),
    getProfile: () => apiRequest('/auth/me'),
    updateProfile: (profileData) =>
      apiRequest('/auth/update-profile', { method: 'PUT', body: profileData }),
    updatePassword: (data) =>
      apiRequest('/auth/update-password', { method: 'PUT', body: data }),
    updateDomain: (domainData) =>
      apiRequest('/auth/update-domain', { method: 'PUT', body: domainData }),
    googleAuth: (googleToken) =>
      apiRequest('/auth/google', { method: 'POST', body: { token: googleToken } })
  },

  user: {
    updateProfile: (profileData) =>
      apiRequest('/users/profile', { method: 'PUT', body: profileData }),

    updatePassword: (data) =>
      apiRequest('/users/password', {
        method: 'PUT',
        body: data // must be { currentPassword, newPassword }
      }),

    getTestHistory: () =>
      apiRequest('/users/test-history'),

    getProfile: () =>
      apiRequest('/users/me')
  },

  qcm: {
    getAll: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiRequest(`/qcms?${query}`);
    },
    getById: (id) => apiRequest(`/qcms/${id}`),
    create: (qcmData) => apiRequest('/qcms', { method: 'POST', body: qcmData }),
    update: (id, qcmData) => apiRequest(`/qcms/${id}`, { method: 'PUT', body: qcmData }),
    delete: (id) => apiRequest(`/qcms/${id}`, { method: 'DELETE' }),
    generateQcm: (data) => apiRequest('/qcms/generate', { method: 'POST', body: data })
  },

  document: {
    upload: (formData, onProgress) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/documents/upload`);

        const token = localStorage.getItem('token');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        if (onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 100;
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Échec de l'upload : ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Erreur réseau'));
        xhr.send(formData);
      });
    },

    download: (filename) => {
      window.open(`${API_BASE_URL}/documents/download/${filename}`);
    }
  },

  session: {
    create: (sessionData) => apiRequest('/sessions', { method: 'POST', body: sessionData }),
    getById: (id) => apiRequest(`/sessions/${id}`),
    getUserSessions: () => apiRequest('/sessions/user')
  },

  stats: {
    getUserStats: () => apiRequest('/stats'),
    getAggregatedStats: () => apiRequest('/stats/aggregated/data')
  },

  subject: {
    getAll: () => apiRequest('/subjects'),
    getByName: (name) => apiRequest(`/subjects/${encodeURIComponent(name)}`),
    getByDomain: (domain) => apiRequest(`/subjects/domain/${encodeURIComponent(domain)}`),
    create: (data) => apiRequest('/subjects', { method: 'POST', body: data })
=======
    register:   u => apiRequest('/auth/register',           { method: 'POST', body: u }),
    login:      c => apiRequest('/auth/login',              { method: 'POST', body: c }),
    getProfile:   () => apiRequest('/auth/me'),
    updateProfile: d => apiRequest('/auth/update-profile',  { method: 'PUT',  body: d }),
    updatePassword:d => apiRequest('/auth/update-password', { method: 'PUT',  body: d }),
    updateDomain:  d => apiRequest('/auth/update-domain',   { method: 'PUT',  body: d }),
    googleAuth:    t => apiRequest('/auth/google',          { method: 'POST', body: { token: t } })
  },
  user: {
    getProfile:     () => apiRequest('/users/me'),
    getTestHistory: () => apiRequest('/users/test-history'),
    updateProfile:  d => apiRequest('/users/profile',       { method: 'PUT',  body: d }),
    updatePassword: d => apiRequest('/users/password',      { method: 'PUT',  body: d }),
    getSettings:    () => apiRequest('/settings'),
    updateSettings: s => apiRequest('/settings',            { method: 'PUT',  body: s })
  },
  qcm: {
    getAll:      f => apiRequest(`/qcms?${new URLSearchParams(f)}`),
    getById:     i => apiRequest(`/qcms/${i}`),
    create:      d => apiRequest('/qcms',                   { method: 'POST', body: d }),
    update:      (i,d) => apiRequest(`/qcms/${i}`,         { method: 'PUT',  body: d }),
    delete:      i => apiRequest(`/qcms/${i}`,             { method: 'DELETE' }),
    generateQcm: d => apiRequest('/qcms/generate',         { method: 'POST', body: d })
  },
  document: {
    upload: (formData, onProgress) => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/documents/upload`);
      const token = localStorage.getItem('token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      if (onProgress) {
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
        };
      }
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300
        ? resolve(JSON.parse(xhr.responseText))
        : reject(new Error(`Échec de l'upload : ${xhr.statusText}`));
      xhr.onerror = () => reject(new Error('Erreur réseau'));
      xhr.send(formData);
    }),
    download: filename => window.open(`${API_BASE_URL}/documents/download/${filename}`)
  },
  session: {
    create:         d => apiRequest('/sessions',      { method: 'POST', body: d }),
    getById:        i => apiRequest(`/sessions/${i}`),
    getUserSessions:() => apiRequest('/sessions/user')
  },
  stats: {
    getUserStats:      () => apiRequest('/stats'),
    getAggregatedStats:() => apiRequest('/stats/aggregated/data')
  },
  subject: {
    getAll:      () => apiRequest('/subjects'),
    getByName:   n => apiRequest(`/subjects/${encodeURIComponent(n)}`),
    getByDomain: d => apiRequest(`/subjects/domain/${encodeURIComponent(d)}`),
    create:      d => apiRequest('/subjects',        { method: 'POST', body: d })
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
  }
};

export default api;
<<<<<<< HEAD
=======
export function setupAPI() {
  console.log("✅ setupAPI exécuté — API prête");
  return api;
}
>>>>>>> 19c9ccf42f44476623e3bd8a1861d1bf148c026d
