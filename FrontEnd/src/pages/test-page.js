/**
 * Gestionnaire pour la page de test/révision
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page de test
export function initTestPage() {
    console.log("Initializing test page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Vérifier si un QCM spécifique est demandé via l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const qcmId = urlParams.get('qcmId');
    
    // Si un QCM spécifique est demandé, l'afficher directement
    if (qcmId) {
        loadAndStartTest(qcmId);
    } else {
        // Sinon, afficher la sélection de QCM
        setupTestSelection();
    }
}

// Configurer la page de sélection de test
async function setupTestSelection() {
    console.log("Setting up test selection...");
    
    const testContainer = document.getElementById('test-container');
    const resultContainer = document.getElementById('result-container');
    
    // Masquer les conteneurs non nécessaires
    if (testContainer) testContainer.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'none';
    
    // Charger la liste des QCM disponibles
    try {
        const response = await window.KnowledgeQuestAPI.getQCMs();
        
        if (response.success && response.qcms && response.qcms.length > 0) {
            // Remplir le sélecteur de QCM
            const qcmSelect = document.getElementById('qcm-select');
            
            if (qcmSelect) {
                // Vider les options existantes
                qcmSelect.innerHTML = '<option value="" disabled selected>Choisissez un QCM</option>';
                
                // Ajouter les options
                response.qcms.forEach(qcm => {
                    const option = document.createElement('option');
                    option.value = qcm._id;
                    option.textContent = `${qcm.title} (${qcm.questions.length} questions)`;
                    qcmSelect.appendChild(option);
                });
                
                // Activer le bouton de démarrage
                const startButton = document.getElementById('start-test-btn');
                if (startButton) {
                    startButton.disabled = false;
                    
                    // Ajouter un écouteur d'événements pour le bouton de démarrage
                    startButton.addEventListener('click', () => {
                        const selectedQcmId = qcmSelect.value;
                        
                        if (selectedQcmId) {
                            const testSelection = document.getElementById('test-selection');
                            if (testSelection) testSelection.style.display = 'none';
                            loadAndStartTest(selectedQcmId);
                        } else {
                            alert('Veuillez sélectionner un QCM.');
                        }
                    });
                }
            }
        } else {
            // Afficher un message si aucun QCM n'est disponible
            const testSelection = document.getElementById('test-selection');
            if (testSelection) {
                testSelection.innerHTML = `
                    <div class="empty-state">
                        <h2>Aucun QCM disponible</h2>
                        <p>Vous devez d'abord créer des QCM ou en générer à partir de vos documents.</p>
                        <div class="empty-state-actions">
                            <a href="create-qcm.html" class="btn-primary">Créer un QCM</a>
                            <a href="upload-document.html" class="btn-secondary">Charger un document</a>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des QCM:', error);
        const testSelection = document.getElementById('test-selection');
        if (testSelection) {
            testSelection.innerHTML = `
                <div class="error-state">
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger les QCM. Veuillez réessayer plus tard.</p>
                    <button class="btn-primary" onclick="location.reload()">Réessayer</button>
                </div>
            `;
        }
    }
}

// Charger et démarrer un test
async function loadAndStartTest(qcmId) {
    console.log("Loading and starting test for QCM ID:", qcmId);
    
    try {
        // Afficher l'indicateur de chargement
        const testContainer = document.getElementById('test-container');
        if (testContainer) {
            testContainer.style.display = 'block';
            testContainer.innerHTML = '<div class="loading-spinner">Chargement du QCM...</div>';
        }
        
        // Récupérer le QCM
        const response = await window.KnowledgeQuestAPI.getQCMById(qcmId);
        
        if (response.success && response.qcm) {
            // Construire l'interface de test
            buildTestInterface(response.qcm);
        } else {
            showTestError('Erreur lors du chargement du QCM: ' + (response.message || 'QCM non trouvé'));
        }
    } catch (error) {
        console.error('Erreur lors du chargement du QCM:', error);
        showTestError('Une erreur est survenue lors du chargement du QCM.');
    }
}

// Construire l'interface de test
function buildTestInterface(qcm) {
    console.log("Building test interface for QCM:", qcm.title);
    
    const testContainer = document.getElementById('test-container');
    if (!testContainer) return;
    
    // Construire l'interface
    testContainer.innerHTML = `
        <div class="test-header">
            <h2 id="test-title">${qcm.title}</h2>
            <div class="test-progress">
                <div class="progress-bar-container">
                    <div id="test-progress-bar" class="progress-bar" style="width: 0%"></div>
                </div>
                <span id="test-progress-text">Question 1 sur ${qcm.questions.length}</span>
            </div>
        </div>
        
        <div class="question-card">
            <div class="question-header">
                <h3 id="question-title">Question 1/${qcm.questions.length}</h3>
                <div class="question-timer" id="question-timer">00:30</div>
            </div>
            
            <p id="question-text" class="question-text"></p>
            
            <div id="choices-container" class="choices-container">
                <!-- Les choix seront ajoutés ici dynamiquement -->
            </div>
            
            <div class="question-actions">
                <button id="next-question-btn" class="btn-primary" disabled>Question suivante</button>
            </div>
        </div>
    `;
    
    // Initialiser le test
    initTest(qcm);
}

// Initialiser le test avec les questions du QCM
function initTest(qcm) {
    // Variables pour suivre l'état du test
    let currentQuestionIndex = 0;
    let answers = [];
    let timer = null;
    let timeLeft = 30; // Secondes par question
    
    // Éléments de l'interface
    const questionTitle = document.getElementById('question-title');
    const questionText = document.getElementById('question-text');
    const choicesContainer = document.getElementById('choices-container');
    const nextButton = document.getElementById('next-question-btn');
    const progressBar = document.getElementById('test-progress-bar');
    const progressText = document.getElementById('test-progress-text');
    const questionTimer = document.getElementById('question-timer');
    
    // Fonction pour afficher une question
    function showQuestion(index) {
        const question = qcm.questions[index];
        
        // Mettre à jour le titre et le texte
        if (questionTitle) questionTitle.textContent = `Question ${index + 1}/${qcm.questions.length}`;
        if (questionText) questionText.textContent = question.question;
        
        // Vider et remplir le conteneur de choix
        if (choicesContainer) {
            choicesContainer.innerHTML = '';
            
            question.choices.forEach((choice, choiceIndex) => {
                const choiceItem = document.createElement('div');
                choiceItem.className = 'choice-item';
                
                const choiceLabel = document.createElement('label');
                choiceLabel.className = 'choice-label';
                
                const choiceInput = document.createElement('input');
                choiceInput.type = 'radio';
                choiceInput.name = `question-${index}`;
                choiceInput.value = choiceIndex;
                
                const choiceText = document.createElement('span');
                choiceText.className = 'choice-text';
                choiceText.textContent = choice;
                
                choiceLabel.appendChild(choiceInput);
                choiceLabel.appendChild(choiceText);
                choiceItem.appendChild(choiceLabel);
                choicesContainer.appendChild(choiceItem);
                
                // Ajouter un écouteur d'événements pour activer le bouton suivant
                choiceInput.addEventListener('change', () => {
                    if (nextButton) nextButton.disabled = false;
                });
                
                // Ajouter un écouteur pour toute la zone du choix
                choiceItem.addEventListener('click', () => {
                    choiceInput.checked = true;
                    
                    // Déclencher manuellement l'événement change
                    const event = new Event('change');
                    choiceInput.dispatchEvent(event);
                    
                    // Mettre en évidence la sélection
                    document.querySelectorAll('.choice-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    choiceItem.classList.add('selected');
                });
            });
        }
        
        // Désactiver le bouton suivant jusqu'à ce qu'une réponse soit sélectionnée
        if (nextButton) nextButton.disabled = true;
        
        // Mettre à jour la barre de progression
        if (progressBar) {
            const progress = ((index + 1) / qcm.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        // Mettre à jour le texte de progression
        if (progressText) {
            progressText.textContent = `Question ${index + 1} sur ${qcm.questions.length}`;
        }
        
        // Réinitialiser le timer
        if (questionTimer) {
            clearInterval(timer);
            timeLeft = 30;
            updateTimer();
            
            // Démarrer le timer
            timer = setInterval(() => {
                timeLeft--;
                updateTimer();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    moveToNextQuestion();
                }
            }, 1000);
        }
    }
    
    // Mettre à jour l'affichage du timer
    function updateTimer() {
        if (questionTimer) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            questionTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Changer la couleur lorsque le temps est presque écoulé
            if (timeLeft <= 10) {
                questionTimer.classList.add('warning');
            } else {
                questionTimer.classList.remove('warning');
            }
        }
    }
    
    // Passer à la question suivante
    function moveToNextQuestion() {
        // Enregistrer la réponse
        const selectedChoice = document.querySelector(`input[name="question-${currentQuestionIndex}"]:checked`);
        
        const question = qcm.questions[currentQuestionIndex];
        let userAnswer = null;
        let isCorrect = false;
        
        if (selectedChoice) {
            const choiceIndex = parseInt(selectedChoice.value);
            userAnswer = question.choices[choiceIndex];
            isCorrect = userAnswer === question.correctAnswer;
        }
        
        answers.push({
            question: question.question,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
        
        // Passer à la question suivante ou terminer le test
        currentQuestionIndex++;
        
        if (currentQuestionIndex < qcm.questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            finishTest();
        }
    }
    
    // Terminer le test et afficher les résultats
    async function finishTest() {
        // Arrêter le timer
        clearInterval(timer);
        
        // Masquer le conteneur de test
        const testContainer = document.getElementById('test-container');
        if (testContainer) testContainer.style.display = 'none';
        
        // Afficher le conteneur de résultats
        const resultContainer = document.getElementById('result-container');
        if (!resultContainer) return;
        
        // Calculer le score
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const totalQuestions = qcm.questions.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        // Construire l'interface de résultats
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `
            <div class="result-header">
                <h2>Résultats - ${qcm.title}</h2>
                <div class="score-display">
                    <div class="score-circle ${score >= 70 ? 'good' : score >= 50 ? 'average' : 'bad'}">
                        <span id="score-value">${score}%</span>
                    </div>
                    <div class="score-details">
                        <p><span id="correct-answers">${correctAnswers}</span>/<span id="total-questions">${totalQuestions}</span> réponses correctes</p>
                    </div>
                </div>
            </div>
            
            <div class="result-message">
                ${getResultMessage(score)}
            </div>
            
            <div class="answers-review" id="answers-review">
                <!-- Les réponses seront ajoutées ici -->
            </div>
            
            <div class="result-actions">
                <a href="dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
                <a href="take-test.html" class="btn-primary">Faire un autre test</a>
            </div>
        `;
        
        // Afficher les réponses
        const answersContainer = document.getElementById('answers-review');
        if (answersContainer) {
            answers.forEach((answer, index) => {
                const answerItem = document.createElement('div');
                answerItem.className = `answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;
                
                const question = qcm.questions[index];
                
                answerItem.innerHTML = `
                    <div class="answer-header">
                        <h3>Question ${index + 1}</h3>
                        <span class="answer-status">${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                    </div>
                    <p class="question-text">${question.question}</p>
                    <p class="user-answer">Votre réponse: ${answer.userAnswer || 'Aucune réponse'}</p>
                    ${!answer.isCorrect ? `<p class="correct-answer">Réponse correcte: ${question.correctAnswer}</p>` : ''}
                `;
                
                answersContainer.appendChild(answerItem);
            });
        }
        
        // Enregistrer la session sur le serveur
        try {
            const sessionData = {
                qcmId: qcm._id,
                score,
                questionsAnswered: answers
            };
            
            await window.KnowledgeQuestAPI.saveSession(sessionData);
            console.log("Session saved successfully");
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la session:', error);
        }
    }
    
    // Obtenir un message basé sur le score
    function getResultMessage(score) {
        if (score >= 90) {
            return '<p class="result-excellent">Excellent ! Vous maîtrisez parfaitement ce sujet.</p>';
        } else if (score >= 70) {
            return '<p class="result-good">Bien joué ! Vous avez une bonne compréhension du sujet.</p>';
        } else if (score >= 50) {
            return '<p class="result-average">Pas mal ! Mais il y a encore place à l\'amélioration.</p>';
        } else {
            return '<p class="result-bad">Vous devriez revoir ce sujet pour mieux le comprendre.</p>';
        }
    }
    
    // Ajouter un écouteur d'événements pour le bouton suivant
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            clearInterval(timer);
            moveToNextQuestion();
        });
    }
    
    // Afficher la première question
    showQuestion(currentQuestionIndex);
}

// Afficher une erreur de test
function showTestError(message) {
    const testContainer = document.getElementById('test-container');
    if (testContainer) {
        testContainer.innerHTML = `
            <div class="error-state">
                <h2>Erreur</h2>
                <p>${message}</p>
                <a href="dashboard.html" class="btn-primary">Retour au tableau de bord</a>
            </div>
        `;
    } else {
        alert(message);
    }
}