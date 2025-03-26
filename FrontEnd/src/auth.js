// auth.js - Version améliorée
export const auth = {
    isLoggedIn: false,
    user: null,
    token: null,
    tokenExpiryTime: null,
    
    // Initialiser l'auth au démarrage de l'app
    init() {
        this.checkAuth();
        this.setupAutoRefresh();
    },
    
    // Se connecter
    async login(email, password) {
        try {
            const response = await window.KnowledgeQuestAPI.login({ email, password });
            
            if (response.success) {
                this.isLoggedIn = true;
                this.user = response.user;
                this.token = response.token;
                this.tokenExpiryTime = this.calculateExpiryTime(response.expiresIn || 3600);
                
                this.saveToStorage();
                return { success: true, user: this.user };
            }
            
            return { success: false, message: response.message || 'Échec de la connexion' };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: 'Erreur de connexion au serveur' };
        }
    },
    
    // S'inscrire
    async register(userData) {
        try {
            const response = await window.KnowledgeQuestAPI.register(userData);
            
            if (response.success) {
                this.isLoggedIn = true;
                this.user = response.user;
                this.token = response.token;
                this.tokenExpiryTime = this.calculateExpiryTime(response.expiresIn || 3600);
                
                this.saveToStorage();
                return { success: true, user: this.user };
            }
            
            return { success: false, message: response.message || 'Échec de l\'inscription' };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: 'Erreur de connexion au serveur' };
        }
    },
    
    // Vérifier si l'utilisateur est connecté
    checkAuth() {
        const authData = JSON.parse(localStorage.getItem('authData'));
        if (authData && authData.token) {
            // Vérifier si le token est expiré
            if (authData.tokenExpiryTime && new Date().getTime() < authData.tokenExpiryTime) {
                this.isLoggedIn = true;
                this.user = authData.user;
                this.token = authData.token;
                this.tokenExpiryTime = authData.tokenExpiryTime;
                return true;
            } else {
                // Token expiré, déconnecter l'utilisateur
                this.logout();
            }
        }
        return false;
    },
    
    // Se déconnecter
    logout() {
        this.isLoggedIn = false;
        this.user = null;
        this.token = null;
        this.tokenExpiryTime = null;
        localStorage.removeItem('authData');
    },
    
    // Sauvegarder les données d'authentification dans le stockage local
    saveToStorage() {
        localStorage.setItem('authData', JSON.stringify({
            token: this.token,
            user: this.user,
            tokenExpiryTime: this.tokenExpiryTime
        }));
    },
    
    // Calculer le temps d'expiration du token
    calculateExpiryTime(expiresInSeconds) {
        return new Date().getTime() + (expiresInSeconds * 1000);
    },
    
    // Configurer le rafraîchissement automatique du token
    setupAutoRefresh() {
        if (this.tokenExpiryTime) {
            const timeUntilExpiry = this.tokenExpiryTime - new Date().getTime();
            // Rafraîchir le token 5 minutes avant son expiration
            const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
            
            if (refreshTime > 0) {
                setTimeout(() => this.refreshToken(), refreshTime);
            } else {
                // Si le token expire dans moins de 5 minutes, le rafraîchir maintenant
                this.refreshToken();
            }
        }
    },
    
    // Rafraîchir le token d'authentification
    async refreshToken() {
        if (this.token) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok && data.token) {
                    this.token = data.token;
                    this.tokenExpiryTime = this.calculateExpiryTime(data.expiresIn || 3600);
                    this.saveToStorage();
                    
                    // Configurer le prochain rafraîchissement
                    this.setupAutoRefresh();
                } else {
                    // Échec du rafraîchissement, déconnecter l'utilisateur
                    this.logout();
                    window.location.href = 'login.html?session=expired';
                }
            } catch (error) {
                console.error("Token refresh error:", error);
                // En cas d'erreur, déconnecter l'utilisateur par sécurité
                this.logout();
                window.location.href = 'login.html?session=error';
            }
        }
    }
};