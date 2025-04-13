// js/api/api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Fonction utilitaire pour récupérer le token
const getToken = () => localStorage.getItem('token');

// Gestionnaire de requêtes HTTP avec gestion des erreurs
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }
    
    return data;
  } catch (error) {
    console.error(`Erreur API (${endpoint}):`, error);
    throw error;
  }
};

// API d'authentification
export const authAPI = {
  register: async (userData) => {
    return fetchWithAuth('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  login: async (email, password) => {
    return fetchWithAuth('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  getMe: async () => {
    return fetchWithAuth('/auth/me');
  },
  
  googleAuth: async (token) => {
    return fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },
  
  microsoftAuth: async (token) => {
    return fetchWithAuth('/auth/microsoft', {
      method: 'POST',
      body: JSON.stringify({ accessToken: token })
    });
  },
  
  appleAuth: async (token, user) => {
    return fetchWithAuth('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ id_token: token, user })
    });
  }
};

// API de gestion des QCM
export const qcmAPI = {
  getQCMs: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchWithAuth(`/qcms?${queryParams}`);
  },
  
  getQCMById: async (id) => {
    return fetchWithAuth(`/qcms/${id}`);
  },
  
  createQCM: async (qcmData) => {
    return fetchWithAuth('/qcms', {
      method: 'POST',
      body: JSON.stringify(qcmData)
    });
  },
  
  updateQCM: async (id, qcmData) => {
    return fetchWithAuth(`/qcms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(qcmData)
    });
  },
  
  deleteQCM: async (id) => {
    return fetchWithAuth(`/qcms/${id}`, {
      method: 'DELETE'
    });
  },
  
  generateQCM: async (documentId, subject) => {
    return fetchWithAuth('/qcms/generate', {
      method: 'POST',
      body: JSON.stringify({ documentId, subject })
    });
  }
};

// API de gestion des documents
export const documentAPI = {
  uploadDocument: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('document', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/documents/upload`, true);
      
      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.statusText || 'Erreur lors du téléchargement'));
        }
      };
      
      xhr.onerror = () => reject(new Error('Erreur réseau'));
      
      xhr.send(formData);
    });
  },
  
  downloadDocument: async (filename) => {
    window.open(`${API_BASE_URL}/documents/download/${filename}`);
  }
};

// API de gestion des sessions
export const sessionAPI = {
  createSession: async (sessionData) => {
    return fetchWithAuth('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },
  
  getUserSessions: async () => {
    return fetchWithAuth('/sessions/user');
  },
  
  getSessionById: async (id) => {
    return fetchWithAuth(`/sessions/${id}`);
  }
};

// API de statistiques
export const statsAPI = {
  getUserStats: async () => {
    return fetchWithAuth('/stats');
  },
  
  getAggregatedStats: async () => {
    return fetchWithAuth('/stats/aggregated/data');
  }
};

// API pour les sujets/matières
export const subjectAPI = {
  getAllSubjects: async () => {
    return fetchWithAuth('/subjects');
  },
  
  getSubjectByName: async (name) => {
    return fetchWithAuth(`/subjects/${name}`);
  },
  
  createSubject: async (subjectData) => {
    return fetchWithAuth('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  }
};

// Exporter l'ensemble pour utilisation globale
export const KnowledgeQuestAPI = {
  auth: authAPI,
  qcm: qcmAPI,
  document: documentAPI,
  session: sessionAPI,
  stats: statsAPI,
  subject: subjectAPI
};