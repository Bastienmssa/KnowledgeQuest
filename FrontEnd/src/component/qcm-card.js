/**
 * Module pour gérer les cartes de QCM
 * Crée et gère les représentations visuelles des QCM dans différentes parties de l'application
 */

export function initQcmCards() {
    console.log("Initializing QCM cards...");
    
    // Initialiser les cartes QCM dans la bibliothèque
    initLibraryQcmCards();
    
    // Initialiser les cartes QCM dans les tests
    initTestQcmCards();
}

// Initialiser les cartes QCM dans la bibliothèque
function initLibraryQcmCards() {
    const qcmCardsContainer = document.querySelector('.qcm-cards-container');
    if (!qcmCardsContainer) return;
    
    console.log("Initializing library QCM cards...");
    
    // Ajouter des interactions aux cartes
    const qcmCards = qcmCardsContainer.querySelectorAll('.qcm-card');
    
    qcmCards.forEach(card => {
        // Ajouter un effet de survol
        card.addEventListener('mouseenter', () => {
            card.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hovered');
        });
        
        // Gérer les boutons d'action
        const actionButtons = card.querySelectorAll('.qcm-card-action');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher la propagation au clic sur la carte
                
                const action = button.getAttribute('data-action');
                const qcmId = card.getAttribute('data-id');
                
                if (action === 'edit') {
                    // Rediriger vers la page d'édition
                    window.location.href = `create-qcm.html?edit=${qcmId}`;
                } else if (action === 'start') {
                    // Rediriger vers la page de test
                    window.location.href = `take-test.html?qcmId=${qcmId}`;
                } else if (action === 'delete') {
                    // Confirmer puis supprimer
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce QCM ?')) {
                        deleteQcm(qcmId, card);
                    }
                }
            });
        });
    });
}

// Initialiser les cartes QCM dans les tests
function initTestQcmCards() {
    const testContainer = document.querySelector('.test-container');
    if (!testContainer) return;
    
    console.log("Initializing test QCM cards...");
    
    // Ajouter des interactions aux choix
    const choiceItems = testContainer.querySelectorAll('.choice-item');
    
    choiceItems.forEach(item => {
        item.addEventListener('click', () => {
            // Vérifier si l'item contient un input radio
            const radio = item.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                
                // Supprimer la classe selected de tous les choix
                const allChoices = item.closest('.choices-container').querySelectorAll('.choice-item');
                allChoices.forEach(choice => choice.classList.remove('selected'));
                
                // Ajouter la classe selected à l'élément cliqué
                item.classList.add('selected');
                
                // Activer le bouton suivant
                const nextButton = document.getElementById('next-question-btn');
                if (nextButton) {
                    nextButton.disabled = false;
                }
            }
        });
    });
}

// Créer dynamiquement une carte QCM
export function createQcmCard(qcm) {
    const card = document.createElement('div');
    card.className = 'qcm-card';
    card.setAttribute('data-id', qcm._id);
    
    card.innerHTML = `
        <div class="qcm-card-header">
            <h3>${qcm.title}</h3>
            <span class="qcm-card-badge">${qcm.questions.length} questions</span>
        </div>
        <div class="qcm-card-body">
            <p>${qcm.subject}</p>
            <p class="qcm-card-date">Créé le ${new Date(qcm.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="qcm-card-actions">
            <button class="qcm-card-action" data-action="start">
                <span class="icon">🎯</span>
                <span>Démarrer</span>
            </button>
            <button class="qcm-card-action" data-action="edit">
                <span class="icon">✏️</span>
                <span>Modifier</span>
            </button>
            <button class="qcm-card-action" data-action="delete">
                <span class="icon">🗑️</span>
                <span>Supprimer</span>
            </button>
        </div>
    `;
    
    return card;
}

// Ajouter une carte QCM au conteneur
export function appendQcmCard(container, qcm) {
    const card = createQcmCard(qcm);
    container.appendChild(card);
    
    // Initialiser les interactions pour cette carte
    initQcmCardInteractions(card);
    
    return card;
}

// Initialiser les interactions pour une carte spécifique
function initQcmCardInteractions(card) {
    // Ajouter un effet de survol
    card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
    });
    
    card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
    });
    
    // Gérer les boutons d'action
    const actionButtons = card.querySelectorAll('.qcm-card-action');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const action = button.getAttribute('data-action');
            const qcmId = card.getAttribute('data-id');
            
            if (action === 'edit') {
                window.location.href = `create-qcm.html?edit=${qcmId}`;
            } else if (action === 'start') {
                window.location.href = `take-test.html?qcmId=${qcmId}`;
            } else if (action === 'delete') {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce QCM ?')) {
                    deleteQcm(qcmId, card);
                }
            }
        });
    });
}

// Supprimer un QCM via l'API
async function deleteQcm(qcmId, cardElement) {
    try {
        const response = await window.KnowledgeQuestAPI.deleteQCM(qcmId);
        
        if (response.success) {
            // Animation de suppression
            cardElement.classList.add('removing');
            setTimeout(() => {
                cardElement.remove();
            }, 300);
        } else {
            alert('Erreur lors de la suppression: ' + response.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la suppression du QCM.');
    }
}