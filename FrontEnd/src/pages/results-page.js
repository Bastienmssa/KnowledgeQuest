/**
 * Gestionnaire pour la page de résultats de test
 * Affiche les détails d'un test complété avec les réponses correctes/incorrectes
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page de résultats
export function initResultsPage() {
    console.log("Initializing results page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    const score = urlParams.get('score');
    
    if (sessionId) {
        // Charger les détails de la session
        loadSessionResults(sessionId);
    } else if (score) {
        // Afficher uniquement le score sans détails
        displaySimpleResults(score, urlParams.get('qcmId'));
    } else {
        showError('Aucun résultat à afficher');
    }
}

// Charger les détails de la session
async function loadSessionResults(sessionId) {
    try {
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="loading-spinner">Chargement des résultats...</div>';
        }
        
        const response = await window.KnowledgeQuestAPI.getSessionById(sessionId);
        
        if (response.success) {
            displayDetailedResults(response.session);
        } else {
            showError('Erreur lors du chargement des résultats: ' + response.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Une erreur est survenue lors du chargement des résultats.');
    }
}

// Afficher les résultats détaillés
function displayDetailedResults(session) {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    // Calculer les statistiques
    const totalQuestions = session.questionsAnswered.length;
    const correctAnswers = session.questionsAnswered.filter(q => q.isCorrect).length;
    const score = session.score || Math.round((correctAnswers / totalQuestions) * 100);
    
    // Construire l'interface
    resultsContainer.innerHTML = `
        <div class="results-header">
            <h2>Résultats du test</h2>
            <div class="results-meta">
                <span>Complété le ${new Date(session.createdAt).toLocaleDateString()}</span>
                <span>${formatDuration(session.duration)}</span>
            </div>
        </div>
        
        <div class="results-summary">
            <div class="score-container ${getScoreClass(score)}">
                <div class="score-circle">
                    <span class="score-value">${score}%</span>
                </div>
                <div class="score-label">${getScoreLabel(score)}</div>
            </div>
            
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-value">${correctAnswers}/${totalQuestions}</span>
                    <span class="stat-label">Réponses correctes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalQuestions - correctAnswers}</span>
                    <span class="stat-label">Réponses incorrectes</span>
                </div>
            </div>
        </div>
        
        <div class="results-details">
            <h3>Détail des questions</h3>
            <div class="questions-list">
                ${session.questionsAnswered.map((item, index) => `
                    <div class="question-result ${item.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="question-header">
                            <span class="question-number">Question ${index + 1}</span>
                            <span class="question-status">${item.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                        </div>
                        <p class="question-text">${item.question}</p>
                        <div class="answer-details">
                            <p class="user-answer">
                                <strong>Votre réponse:</strong> 
                                ${item.userAnswer || '<em>Aucune réponse</em>'}
                            </p>
                            ${!item.isCorrect ? `
                                <p class="correct-answer">
                                    <strong>Réponse correcte:</strong> 
                                    ${item.correctAnswer}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="results-actions">
            <a href="take-test.html?qcmId=${session.qcmId}" class="btn-primary">Réessayer</a>
            <a href="dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
        </div>
    `;
}

// Afficher des résultats simplifiés
function displaySimpleResults(score, qcmId) {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="results-header">
            <h2>Test terminé</h2>
        </div>
        
        <div class="results-summary">
            <div class="score-container ${getScoreClass(score)}">
                <div class="score-circle">
                    <span class="score-value">${score}%</span>
                </div>
                <div class="score-label">${getScoreLabel(score)}</div>
            </div>
        </div>
        
        <div class="results-message">
            <p>Vos réponses ont été enregistrées avec succès.</p>
            <p>Consultez vos statistiques pour suivre votre progression.</p>
        </div>
        
        <div class="results-actions">
            ${qcmId ? `<a href="take-test.html?qcmId=${qcmId}" class="btn-primary">Réessayer</a>` : ''}
            <a href="stats.html" class="btn-secondary">Voir mes statistiques</a>
            <a href="dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
        </div>
    `;
}

// Obtenir la classe CSS basée sur le score
function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
}

// Obtenir le libellé basé sur le score
function getScoreLabel(score) {
    if (score >= 90) return 'Excellent !';
    if (score >= 80) return 'Très bien !';
    if (score >= 70) return 'Bien !';
    if (score >= 60) return 'Assez bien';
    if (score >= 50) return 'Moyen';
    return 'À améliorer';
}

// Formater la durée en minutes:secondes
function formatDuration(seconds) {
    if (!seconds) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `Durée: ${minutes}m ${remainingSeconds}s`;
}

// Afficher une erreur
function showError(message) {
    const container = document.querySelector('.results-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h2>Erreur</h2>
                <p>${message}</p>
                <a href="dashboard.html" class="btn-primary">Retour au tableau de bord</a>
            </div>
        `;
    }
}