/*export function setupAPI() {
    const API_BASE_URL = 'http://localhost:3000';
    
    window.KnowledgeQuestAPI = {
        // Authentification
        login: async (credentials) => {
            // Code d'appel API
        },
        register: async (userData) => {
            // Code d'appel API
        },
        
        // QCM
        uploadDocument: async (file) => {
            // Code d'appel API pour l'upload
        },
        generateQCM: async (documentId) => {
            // Code de génération de QCM
        },
        createQCM: async (qcmData) => {
            // Code de création manuelle
        },
        getQCMs: async (filters = {}) => {
            // Code de récupération avec filtres
        },
        
        // Sessions
        saveSession: async (sessionData) => {
            // Code de sauvegarde de session
        },
        
        // Stats
        getStats: async (userId, filters = {}) => {
            // Code de récupération des stats
        }
    };
}*/

// api.js - Version améliorée
export function setupAPI() {
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // Gestionnaire global des erreurs
    const handleApiError = (error) => {
        console.error('API Error:', error);
        return {
            success: false,
            message: error.message || 'Une erreur s\'est produite lors de la communication avec le serveur'
        };
    };
    
    // Gestionnaire des réponses
    const handleResponse = async (response) => {
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data.message || 'Une erreur s\'est produite'
            };
        }
        
        return {
            success: true,
            ...data
        };
    };
    
    window.KnowledgeQuestAPI = {
        // Authentification
        login: async (credentials) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        register: async (userData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        // Gestion des documents
        uploadDocument: async (file) => {
            try {
                const formData = new FormData();
                formData.append('document', file);
                
                const response = await fetch(`${API_BASE_URL}/documents/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        // Génération et gestion des QCM
        generateQCM: async (documentId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/qcm/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ documentId })
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        createQCM: async (qcmData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/qcm`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(qcmData)
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        updateQCM: async (qcmId, qcmData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/qcm/${qcmId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(qcmData)
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        deleteQCM: async (qcmId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/qcm/${qcmId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getQCMs: async (filters = {}) => {
            try {
                const queryParams = new URLSearchParams();
                
                // Ajouter les filtres à la requête
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value);
                    }
                });
                
                const response = await fetch(`${API_BASE_URL}/qcm?${queryParams.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getQCMById: async (qcmId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/qcm/${qcmId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        // Sessions et statistiques
        saveSession: async (sessionData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/sessions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(sessionData)
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getSessions: async (filters = {}) => {
            try {
                const queryParams = new URLSearchParams();
                
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value);
                    }
                });
                
                const response = await fetch(`${API_BASE_URL}/sessions?${queryParams.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getSessionById: async (sessionId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getStats: async (filters = {}) => {
            try {
                const queryParams = new URLSearchParams();
                
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value);
                    }
                });
                
                const response = await fetch(`${API_BASE_URL}/stats?${queryParams.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        // Gestion du profil utilisateur
        updateUserProfile: async (userData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(userData)
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        updatePassword: async (currentPassword, newPassword) => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        uploadAvatar: async (formData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        deleteAccount: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/account`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                return await handleResponse(response);
            } catch (error) {
                return handleApiError(error);
            }
        }
    };
}