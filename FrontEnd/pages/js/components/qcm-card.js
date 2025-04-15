// js/components/qcm-card.js
/**
 * Module pour gérer les cartes de QCM
 * Crée et gère les représentations visuelles des QCM dans différentes parties de l'application
 */
import { qcmService } from '../services/qcm-service.js';
import { showNotification } from './notification.js';

export function initQcmCards() {
  console.log("Initializing QCM cards...");
  
  // Initialiser les cartes QCM dans la bibliothèque
  initLibraryQcmCards();
  
  // Initialiser les cartes QCM dans les tests
  initTestQcmCards();
}

// Initialiser les cartes QCM dans la bibliothèque
async function initLibraryQcmCards() {
  const qcmCardsContainer = document.querySelector('.qcm-cards-container');
  if (!qcmCardsContainer) return;
  
  console.log("Initializing library QCM cards...");
  
  // Charger dynamiquement les QCM depuis l'API si le conteneur est vide
  if (qcmCardsContainer.children.length === 0) {
    await loadQcmCards(qcmCardsContainer);
  } else {
    // Sinon, juste initialiser les interactions
    const qcmCards = qcmCardsContainer.querySelectorAll('.qcm-card');
    qcmCards.forEach(card => {
      initQcmCardInteractions(card);
    });
  }
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
        const nextButton = document.getElementById('next-btn');
        if (nextButton) {
          nextButton.disabled = false;
        }
      }
    });
  });
}

export function createQcmCard(qcm) {
  const card = document.createElement('div');
  card.className = 'qcm-card';
  card.setAttribute('data-id', qcm._id);
  
  // Options spécifiques selon le domaine
  const isMedical = qcm.subject && ['Médecine', 'Anatomie', 'Physiologie', 'Pathologies', 'Pharmacologie'].includes(qcm.subject);
  
  const cardClass = isMedical ? 'medical-theme' : 'law-theme';
  card.classList.add(cardClass);
  
  const createdDate = qcm.createdAt ? new Date(qcm.createdAt).toLocaleDateString() : 'Date inconnue';
  
  card.innerHTML = `
    <div class="qcm-card-header">
      <h3>${qcm.title || 'QCM sans titre'}</h3>
      <span class="qcm-card-badge">${qcm.questions ? qcm.questions.length : 0} questions</span>
    </div>
    <div class="qcm-card-body">
      <p class="qcm-card-subject">${qcm.subject || 'Sujet non spécifié'}</p>
      <p class="qcm-card-date">Créé le ${createdDate}</p>
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

export function appendQcmCard(container, qcm) {
  const card = createQcmCard(qcm);
  container.appendChild(card);
  
  // Initialiser les interactions pour cette carte
  initQcmCardInteractions(card);
  
  return card;
}

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
        window.location.href = `../pages/create-qcm.html?edit=${qcmId}`;
      } else if (action === 'start') {
        window.location.href = `../pages/take-test.html?qcmId=${qcmId}`;
      } else if (action === 'delete') {
        confirmAndDeleteQcm(qcmId, card);
      }
    });
  });
}

async function confirmAndDeleteQcm(qcmId, card) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce QCM ?')) {
    await deleteQcm(qcmId, card);
  }
}

async function deleteQcm(qcmId, cardElement) {
  try {
    // Ajouter une classe pour l'animation de chargement
    cardElement.classList.add('loading');
    
    await qcmService.deleteQcm(qcmId);
    
    // Animation de suppression
    cardElement.classList.remove('loading');
    cardElement.classList.add('removing');
    setTimeout(() => {
      cardElement.remove();
      
      // Vérifier si c'était la dernière carte
      const container = document.querySelector('.qcm-cards-container');
      if (container && container.children.length === 0) {
        loadQcmCards(container); // Recharger pour afficher l'état vide
      }
    }, 300);
  } catch (error) {
    console.error('Erreur:', error);
    cardElement.classList.remove('loading');
    showNotification('Erreur lors de la suppression du QCM', 'error');
  }
}

async function loadQcmCards(container) {
  try {
    // Afficher un état de chargement
    container.innerHTML = '<div class="loading-spinner">Chargement des QCM...</div>';
    
    const qcms = await qcmService.getAllQcms();
    
    if (qcms && qcms.length > 0) {
      // Vider le conteneur
      container.innerHTML = '';
      
      // Ajouter les cartes QCM
      qcms.forEach(qcm => {
        appendQcmCard(container, qcm);
      });
    } else {
      // Afficher un message s'il n'y a pas de QCM
      container.innerHTML = `
        <div class="empty-state">
          <h3>Aucun QCM disponible</h3>
          <p>Vous n'avez pas encore créé ou généré de QCM.</p>
          <div class="empty-state-actions">
            <a href="../pages/create-qcm.html" class="btn-primary">Créer un QCM</a>
            <a href="../pages/upload-document.html" class="btn-secondary">Générer depuis un document</a>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des QCM:', error);
    container.innerHTML = `
      <div class="error-state">
        <h3>Erreur de chargement</h3>
        <p>${error.message || 'Impossible de charger vos QCM. Veuillez réessayer.'}</p>
        <button onclick="location.reload()" class="btn-primary">Réessayer</button>
      </div>
    `;
  }
}