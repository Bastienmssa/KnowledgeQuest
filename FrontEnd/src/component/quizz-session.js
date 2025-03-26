/**
 * Module pour gérer les sessions de révision (test de QCM)
 */

export function initQuizSession() {
    console.log("Initializing quiz session...");
    
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;
    
    // État de la session de quiz
    const quizState = {
        currentQuestionIndex: 0,
        questions: [],
        userAnswers: [],
        startTime: new Date(),
        qcmId: null
    };
    
    // Récupérer l'ID du QCM depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    quizState.qcmId = urlParams.get('qcmId');
    
    if (!quizState.qcmId) {
        showError('Aucun QCM spécifié');
        return;
    }
    
    // Charger les questions du QCM
    loadQuizQuestions(quizState.qcmId);
    
    // Gestion du bouton suivant
    const nextButton = document.getElementById('next-question-btn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            saveCurrentAnswer();
            
            if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
                // Passer à la question suivante
                quizState.currentQuestionIndex++;
                displayCurrentQuestion();
            } else {
                // Terminer le quiz
                finishQuiz();
            }
        });
    }
    
    // Charger les questions depuis l'API
    async function loadQuizQuestions(qcmId) {
        try {
            const loadingElement = document.querySelector('.quiz-loading');
            if (loadingElement) {
                loadingElement.style.display = 'flex';
            }
            
            const response = await window.KnowledgeQuestAPI.getQCM(qcmId);
            
            if (response.success) {
                quizState.questions = response.qcm.questions;
                displayCurrentQuestion();
            } else {
                showError(response.message || 'Erreur lors du chargement du QCM');
            }
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur:', error);
            showError('Une erreur est survenue lors du chargement du QCM');
        }
    }
    
    // Afficher la question courante
    function displayCurrentQuestion() {
        if (quizState.questions.length === 0) return;
        
        const question = quizState.questions[quizState.currentQuestionIndex];
        const questionContainer = document.querySelector('.question-container');
        
        if (!questionContainer) return;
        
        // Mettre à jour l'indicateur de progression
        updateProgressIndicator();
        
        // Afficher la question
        questionContainer.innerHTML = `
            <h3 class="question-text">${question.question}</h3>
            <div class="choices-container">
                ${question.choices.map((choice, index) => `
                    <div class="choice-item">
                        <input type="radio" name="answer" id="choice-${index}" value="${index}" ${isAnswerSelected(index) ? 'checked' : ''}>
                        <label for="choice-${index}">${choice}</label>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Ajouter des écouteurs pour les choix
        const choiceItems = questionContainer.querySelectorAll('.choice-item');
        choiceItems.forEach(item => {
            item.addEventListener('click', () => {
                const radio = item.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    
                    // Supprimer la classe selected de tous les choix
                    choiceItems.forEach(choice => choice.classList.remove('selected'));
                    
                    // Ajouter la classe selected à l'élément cliqué
                    item.classList.add('selected');
                    
                    // Activer le bouton suivant
                    if (nextButton) {
                        nextButton.disabled = false;
                    }
                }
            });
        });
        
        // Mettre à jour le texte du bouton selon la position
        if (nextButton) {
            nextButton.textContent = quizState.currentQuestionIndex < quizState.questions.length - 1 
                ? 'Question suivante' 
                : 'Terminer le test';
            
            // Désactiver le bouton si aucune réponse n'est sélectionnée
            nextButton.disabled = !isAnyAnswerSelected();
        }
    }
    
    // Mettre à jour l'indicateur de progression
    function updateProgressIndicator() {
        const progressIndicator = document.querySelector('.quiz-progress');
        const progressText = document.querySelector('.quiz-progress-text');
        
        if (progressIndicator) {
            const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
            progressIndicator.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Question ${quizState.currentQuestionIndex + 1}/${quizState.questions.length}`;
        }
    }
    
    // Vérifier si une réponse est sélectionnée
    function isAnyAnswerSelected() {
        const radios = document.querySelectorAll('input[name="answer"]');
        return Array.from(radios).some(radio => radio.checked);
    }
    
    // Vérifier si une réponse spécifique est sélectionnée
    function isAnswerSelected(index) {
        // Si la réponse a déjà été enregistrée
        if (quizState.userAnswers[quizState.currentQuestionIndex] !== undefined) {
            return quizState.userAnswers[quizState.currentQuestionIndex] === index;
        }
        return false;
    }
    
    // Enregistrer la réponse actuelle
    function saveCurrentAnswer() {
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        if (selectedRadio) {
            quizState.userAnswers[quizState.currentQuestionIndex] = parseInt(selectedRadio.value);
        } else {
            // Si aucune réponse n'est sélectionnée, enregistrer null
            quizState.userAnswers[quizState.currentQuestionIndex] = null;
        }
    }
    
    // Terminer le quiz et calculer le score
    async function finishQuiz() {
        // Sauvegarder la dernière réponse
        saveCurrentAnswer();
        
        // Calculer le score
        let correctAnswers = 0;
        const questionsAnswered = [];
        
        quizState.questions.forEach((question, index) => {
            const userAnswer = quizState.userAnswers[index];
            const isCorrect = userAnswer !== null && 
                              question.choices[userAnswer] === question.correctAnswer;
            
            if (isCorrect) correctAnswers++;
            
            questionsAnswered.push({
                question: question.question,
                userAnswer: userAnswer !== null ? question.choices[userAnswer] : null,
                isCorrect: isCorrect
            });
        });
        
        const score = Math.round((correctAnswers / quizState.questions.length) * 100);
        const endTime = new Date();
        const duration = Math.round((endTime - quizState.startTime) / 1000); // en secondes
        
        // Enregistrer la session
        try {
            const sessionData = {
                qcmId: quizState.qcmId,
                score: score,
                questionsAnswered: questionsAnswered,
                duration: duration
            };
            
            await window.KnowledgeQuestAPI.saveSession(sessionData);
            
            // Rediriger vers la page de résultats
            window.location.href = `results.html?score=${score}&qcmId=${quizState.qcmId}`;
        } catch (error) {
            console.error('Erreur:', error);
            showError('Une erreur est survenue lors de l\'enregistrement des résultats');
        }
    }
    
    // Afficher une erreur
    function showError(message) {
        const errorContainer = document.querySelector('.quiz-error');
        if (!errorContainer) return;
        
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        const loadingElement = document.querySelector('.quiz-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}