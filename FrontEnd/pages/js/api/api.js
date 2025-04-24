// api.js - Service de communication avec l'API backend
const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  const config = { ...options, headers };

  if (!options.skipJson && config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 204) return { success: true };
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Une erreur est survenue');
    return data;
  } catch (error) {
    console.error(`Erreur API: ${url}`, error);
    throw error;
  }
}

const api = {
  auth: {
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
  }
};

export default api;
export function setupAPI() {
  console.log("✅ setupAPI exécuté — API prête");
  return api;
}
