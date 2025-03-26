/**
 * Gestionnaire pour la page de tableau de bord
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';
import { appendQcmCard } from '../component/qcm-card.js';
import { initMiniChart } from '../component/charts.js';

// Initialiser le tableau de bord
export function initDashboardPage() {
    console.log("Initializing dashboard page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Personnaliser l'interface avec les données de l'utilisateur
    updateUserInfo();
    
    // Charger les données du tableau de bord
    loadDashboardData();
}

// Mettre à jour les informations de l'utilisateur
function updateUserInfo() {
    const userNameElement = document.getElementById('user-name');
    const domainBadgeElement = document.querySelector('.domain-badge');
    
    if (userNameElement && auth.user) {
        userNameElement.textContent = auth.user.firstName || 'utilisateur';
    }
    
    if (domainBadgeElement && auth.user) {
        // Modifier la classe selon le domaine
        domainBadgeElement.classList.remove('medicine', 'law');
        domainBadgeElement.classList.add(auth.user.domain === 'Médecine' ? 'medicine' : 'law');
        
        // Mettre à jour le texte
        domainBadgeElement.textContent = auth.user.domain || 'Domaine';
    }
}

// Charger les données du tableau de bord depuis l'API
async function loadDashboardData() {
    try {
        // Afficher un indicateur de chargement
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            dashboardContent.innerHTML = '<div class="loading-spinner">Chargement des données...</div>';
        }
        
        // Charger les données nécessaires
        await Promise.all([
            loadStatistics(),
            loadRecentActivity(),
            loadQuickActions()
        ]);
        
    } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            showMessage(dashboardContent, 'Erreur lors du chargement des données', 'error');
        }
    }
}

// Charger les statistiques
async function loadStatistics() {
    try {
        const statsResponse = await window.KnowledgeQuestAPI.getStats();
        
        if (statsResponse.success) {
            const stats = statsResponse.stats;
            
            // Mettre à jour le score moyen
            const scoreElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
            if (scoreElement && stats.averageScore) {
                scoreElement.textContent = `${Math.round(stats.averageScore)}%`;
            }
            
            // Mettre à jour le mini-graphique de progression
            const miniChartContainer = document.getElementById('mini-progress-chart');
            if (miniChartContainer) {
                initMiniChart(miniChartContainer, stats.scoresHistory);
            }
            
            // Autres statistiques à mettre à jour...
            
        } else {
            console.error('Erreur lors du chargement des statistiques:', statsResponse.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Charger l'activité récente
async function loadRecentActivity() {
    try {
        // Récupérer les sessions récentes
        const sessionsResponse = await window.KnowledgeQuestAPI.getSessions({ limit: 3 });
        
        if (sessionsResponse.success) {
            const sessions = sessionsResponse.sessions;
            const activityList = document.querySelector('.activity-list');
            
            if (activityList && sessions.length > 0) {
                // Vider la liste
                activityList.innerHTML = '';
                
                // Ajouter les sessions
                sessions.forEach(session => {
                    const date = new Date(session.createdAt);
                    const formattedDate = formatRelativeDate(date);
                    
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    
                    activityItem.innerHTML = `
                        <div class="activity-icon ${session.type}">
                            ${session.type === 'test' ? '🎯' : session.type === 'upload' ? '📄' : '✍️'}
                        </div>
                        <div class="activity-details">
                            <h3>${session.type === 'test' ? 'Test complété' : session.type === 'upload' ? 'Document téléchargé' : 'QCM créé'}: ${session.title}</h3>
                            <p>${session.type === 'test' ? `Score: ${session.score}%` : session.type === 'upload' ? `${session.questionCount} questions générées` : `${session.questionCount} questions`} - ${formattedDate}</p>
                        </div>
                        <a href="${session.type === 'test' ? `results.html?sessionId=${session.id}` : session.type === 'upload' ? `take-test.html?qcmId=${session.id}` : `create-qcm.html?edit=${session.id}`}" class="btn-secondary">
                            ${session.type === 'test' ? 'Revoir' : session.type === 'upload' ? 'Passer le test' : 'Modifier'}
                        </a>
                    `;
                    
                    activityList.appendChild(activityItem);
                });
            } else if (activityList) {
                activityList.innerHTML = '<div class="empty-state">Aucune activité récente</div>';
            }
        } else {
            console.error('Erreur lors du chargement des sessions:', sessionsResponse.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'activité récente:', error);
    }
}

// Charger les actions rapides
async function loadQuickActions() {
    try {
        // Pour les actions rapides, nous pouvons charger les QCM récents
        const qcmResponse = await window.KnowledgeQuestAPI.getQCMs({ limit: 4 });
        
        if (qcmResponse.success) {
            const qcms = qcmResponse.qcms;
            
            // Mettre à jour le nombre de QCM créés
            const qcmCountElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
            if (qcmCountElement) {
                qcmCountElement.textContent = qcms.length.toString();
            }
            
            // Ajouter les cartes de QCM récents
            const qcmCardsContainer = document.querySelector('.qcm-cards-container');
            if (qcmCardsContainer) {
                qcms.forEach(qcm => {
                    appendQcmCard(qcmCardsContainer, qcm);
                });
            }
        } else {
            console.error('Erreur lors du chargement des QCM:', qcmResponse.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des actions rapides:', error);
    }
}

// Formater la date relative (aujourd'hui, hier, il y a X jours)
function formatRelativeDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Aujourd\'hui';
    } else if (diffDays === 1) {
        return 'Hier';
    } else {
        return `Il y a ${diffDays} jours`;
    }
}